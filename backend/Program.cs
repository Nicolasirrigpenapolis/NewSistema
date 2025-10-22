// Teste de modificação - Program.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IO;
using System.Data.Common;
using Backend.Api.Data;
using Backend.Api.Models;
using Backend.Api.Services;
using Backend.Api.Services.Ini;
using Backend.Api.Repositories;
using Backend.Api.Interfaces;
using Backend.Api.HealthChecks;
using Backend.Api.Providers.MDFe; // provider MDFe
using Backend.Api.Configuracoes;
using Backend.Api.Tenancia;
using Backend.Api.Middleware;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// CONFIGURAÇÃO MULTI-TENANT
// ============================================

// Carregar configurações de empresas do arquivo JSON
var configEmpresasPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Configuracoes", "ConfiguracoesEmpresas.json");
if (!File.Exists(configEmpresasPath))
{
    throw new InvalidOperationException($"Arquivo de configuração de empresas não encontrado: {configEmpresasPath}");
}

var configEmpresasJson = File.ReadAllText(configEmpresasPath);
var configEmpresas = System.Text.Json.JsonSerializer.Deserialize<ConfiguracoesEmpresas>(configEmpresasJson);

if (configEmpresas?.Empresas == null || !configEmpresas.Empresas.Any())
{
    throw new InvalidOperationException("Nenhuma empresa configurada no arquivo ConfiguracoesEmpresas.json");
}

// Registrar configurações de empresas
builder.Services.Configure<ConfiguracoesEmpresas>(options =>
{
    options.Empresas = configEmpresas.Empresas;
});

// Registrar TenantService (scoped para ser único por requisição)
builder.Services.AddScoped<ITenantService, TenantService>();

// Criar OpcoesEmpresa e ContextoEmpresa dinâmicos baseados no tenant
builder.Services.AddScoped<OpcoesEmpresa>(sp =>
{
    var tenantService = sp.GetRequiredService<ITenantService>();
    var logger = sp.GetRequiredService<ILogger<Program>>();
    var config = tenantService.TenantAtual;
    
    logger.LogInformation("[OpcoesEmpresa] TenantIdAtual: {TenantId}", tenantService.TenantIdAtual ?? "NULL");
    
    if (config == null)
    {
        // Se não há tenant definido, usar a primeira empresa disponível como padrão
        var configEmpresas = sp.GetRequiredService<IOptions<ConfiguracoesEmpresas>>().Value;
        config = configEmpresas.Empresas.FirstOrDefault(e => e.Ativo) 
            ?? throw new InvalidOperationException("Nenhuma empresa ativa disponível");
        
        logger.LogWarning("[OpcoesEmpresa] Tenant não definido! Usando fallback: {EmpresaId}", config.Id);
    }
    else
    {
        logger.LogInformation("[OpcoesEmpresa] Usando tenant configurado: {EmpresaId}", config.Id);
    }
    
    return new OpcoesEmpresa
    {
        IdentificadorEmpresa = config.Id,
        NomeExibicao = config.NomeExibicao,
        StringConexao = config.StringConexao,
        Armazenamento = new OpcoesArmazenamentoEmpresa
        {
            CaminhoBase = string.IsNullOrWhiteSpace(config.CertificadoCaminho) 
                ? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "arquivos", config.Id) 
                : Path.GetDirectoryName(config.CertificadoCaminho) ?? AppDomain.CurrentDomain.BaseDirectory,
            PastaLogos = "logos",
            PastaCertificados = "certificados",
            PastaXml = "xml"
        },
        IdentidadeVisual = new OpcoesIdentidadeVisualEmpresa
        {
            ArquivoLogotipo = config.Logo,
            CorPrimaria = config.CorPrimaria
        }
    };
});

builder.Services.AddScoped<IContextoEmpresa>(sp =>
{
    var opcoesEmpresa = sp.GetRequiredService<OpcoesEmpresa>();
    var logger = sp.GetRequiredService<ILogger<ContextoEmpresa>>();
    return new ContextoEmpresa(opcoesEmpresa, logger);
});

// Add services to the container.
builder.Services.AddMemoryCache();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Response compression (gzip/br) para reduzir payloads de listagens
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
});

// Output cache para reduzir carga em endpoints de leitura (idempotentes)
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy("Short", p => p.Expire(TimeSpan.FromSeconds(30)).SetVaryByQuery("page", "pageSize", "search"));
    options.AddPolicy("Medium", p => p.Expire(TimeSpan.FromMinutes(5)).SetVaryByQuery("page", "pageSize", "search"));
    options.AddPolicy("Long", p => p.Expire(TimeSpan.FromHours(1)));
});
builder.Services.Configure<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProviderOptions>(o =>
{
    o.Level = System.IO.Compression.CompressionLevel.Fastest; // Fastest para não aumentar CPU
});

// Configure Entity Framework with fallback connection strings + resiliencia + interceptor de performance
builder.Services.AddDbContext<SistemaContext>((sp, options) =>
{
    var logger = sp.GetRequiredService<ILogger<Program>>();
    var contextoEmpresa = sp.GetRequiredService<IContextoEmpresa>();

    string baseConn = contextoEmpresa.StringConexao;
    string? envConn = Environment.GetEnvironmentVariable("MDFE_DB_CONN");
    if (!string.IsNullOrWhiteSpace(envConn))
    {
        baseConn = envConn!;
        logger.LogInformation("[DB] Empresa {Empresa} usando string de conexão vinda da variável MDFE_DB_CONN.", contextoEmpresa.IdentificadorEmpresa);
    }

    // Normaliza opções de conexão evitando pool agressivo no ambiente local
    var connBuilder = new DbConnectionStringBuilder
    {
        ConnectionString = baseConn
    };

    if (!connBuilder.ContainsKey("Application Name"))
        connBuilder["Application Name"] = "BackendApiDev";

    if (!connBuilder.ContainsKey("Encrypt"))
    {
        if (builder.Environment.IsDevelopment())
        {
            connBuilder["Encrypt"] = "False";
        }
        else
        {
            connBuilder["Encrypt"] = "True";
            if (!connBuilder.ContainsKey("TrustServerCertificate"))
                connBuilder["TrustServerCertificate"] = "True";
        }
    }
    else if (!builder.Environment.IsDevelopment() &&
             string.Equals(connBuilder["Encrypt"]?.ToString(), "True", StringComparison.OrdinalIgnoreCase) &&
             !connBuilder.ContainsKey("TrustServerCertificate"))
    {
        connBuilder["TrustServerCertificate"] = "True";
    }

    if (!connBuilder.ContainsKey("Max Pool Size"))
        connBuilder["Max Pool Size"] = 100;

    if (builder.Environment.IsDevelopment())
    {
        connBuilder["Min Pool Size"] = 0;
    }
    else if (!connBuilder.ContainsKey("Min Pool Size"))
    {
        connBuilder["Min Pool Size"] = 5;
    }

    if (!connBuilder.ContainsKey("Pooling"))
        connBuilder["Pooling"] = true;

    if (!connBuilder.ContainsKey("Connect Timeout") && !connBuilder.ContainsKey("Connection Timeout"))
        connBuilder["Connect Timeout"] = 60;

    baseConn = connBuilder.ConnectionString;

    options
        .UseSqlServer(baseConn, sql =>
        {
            sql.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null);
            sql.CommandTimeout(60); // Aumentado para 60 segundos para consultas complexas e ambientes lentos
        })
        .AddInterceptors(new Backend.Api.Data.Interceptors.SlowQueryInterceptor( thresholdMilliseconds: 300));
});

// Configuração de senha para hash manual
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();

// Configure JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
    ?? builder.Configuration["JwtSettings:SecretKey"]
    ?? throw new InvalidOperationException("JWT SecretKey not found. Set JWT_SECRET_KEY environment variable.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// Register cache service
builder.Services.AddSingleton<ICacheService, CacheService>();

// Register application services
builder.Services.AddScoped<IMDFeService, MDFeService>();

// Registro condicional do provider MDFe - SINGLETON para evitar múltiplas inicializações da DLL nativa
var mdfeProviderSetting = builder.Configuration.GetValue<string>("MDFe:Provider")?.ToLowerInvariant();
if (mdfeProviderSetting == "stub")
{
    builder.Services.AddSingleton<IMDFeProvider, StubMDFeProvider>();
    Console.WriteLine("✓ MDFe Provider: STUB (simulação)");
}
else
{
    builder.Services.AddSingleton<IMDFeProvider, AcbrLibMDFeProvider>();
    Console.WriteLine("✓ MDFe Provider: ACBrLib (produção) - Singleton compartilhado");
}

builder.Services.AddScoped<IIBGEService, IBGEService>();

// INI validation services
builder.Services.AddSingleton<IniParser>();
builder.Services.AddSingleton<MdfeIniTemplateProvider>();
builder.Services.AddSingleton<IMdfeIniValidator, MdfeIniValidator>();
builder.Services.AddSingleton<IMDFeIniGenerator, MDFeIniGenerator>();

// Register repositories
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IPermissaoRepository, PermissaoRepository>();

// Register permission services
builder.Services.AddScoped<IPermissaoService, PermissaoService>();

// Register HttpClient for IBGE service
builder.Services.AddHttpClient<IIBGEService, IBGEService>();

// Register HttpClient for validation services (CNPJ lookup)
builder.Services.AddHttpClient();

// Register export service (gera Excel/PDF para relatórios)
builder.Services.AddScoped<IExportService, ExportService>();
builder.Services.AddScoped<IMDFeBusinessService, MDFeBusinessService>();

// Configure Health Checks
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database", tags: new[] { "db", "ready" })
    .AddCheck<IBGEServiceHealthCheck>("ibge_service", tags: new[] { "external", "ready" })
    .AddCheck<LivenessHealthCheck>("liveness", tags: new[] { "live" })
    .AddCheck<MemoryHealthCheck>("memory_usage", tags: new[] { "ready" });

// Register health check dependencies
builder.Services.AddHttpClient<IBGEServiceHealthCheck>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Backend API", Version = "v1", Description = "API unificada (antiga MDFeApi)" });
    
    // Configure JWT authentication in Swagger
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });
    
    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        // Em produção, especificar domínios exatos
        policy
            .WithOrigins("https://seu-dominio-frontend.com") // Substituir pelo domínio real
            .WithMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .WithHeaders("Content-Type", "Authorization")
            .AllowCredentials();
    });

    options.AddPolicy("Development", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000", "https://localhost:5001", "http://localhost:5173", "http://localhost:8080")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Serve static files from frontend/build in development
    var frontendPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "frontend", "build");
    if (Directory.Exists(frontendPath))
    {
        app.UseDefaultFiles();
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(frontendPath),
            RequestPath = ""
        });
    }
}

// Comentado: Em multi-tenant, o contexto é resolvido por requisição
// var contextoEmpresaApp = app.Services.GetRequiredService<IContextoEmpresa>();
// var caminhoLogos = Path.Combine(contextoEmpresaApp.Armazenamento.CaminhoBase, contextoEmpresaApp.Armazenamento.PastaLogos);
// if (Directory.Exists(caminhoLogos))
// {
//     app.UseStaticFiles(new StaticFileOptions
//     {
//         FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(caminhoLogos),
//         RequestPath = "/arquivos/logos",
//         OnPrepareResponse = context =>
//         {
//             context.Context.Response.Headers["Cache-Control"] = "public,max-age=300";
//         }
//     });
// }

// REMOVIDO temporariamente para desenvolvimento - Permitir HTTP para testes
// app.UseHttpsRedirection(); // Reativar em produção

app.UseResponseCompression();
app.UseOutputCache();

// Security headers
app.UseMiddleware<Backend.Api.Middleware.SecurityHeadersMiddleware>();

// Add security middlewares (comentado temporariamente - middlewares não encontrados)
// app.UseMiddleware<Backend.Api.Middleware.RateLimitingMiddleware>();
// app.UseMiddleware<Backend.Api.Middleware.InputValidationMiddleware>();

// Add custom validation middleware
app.UseMiddleware<Backend.Api.Middleware.ValidationExceptionMiddleware>();

// Usar política CORS apropriada baseada no ambiente
if (app.Environment.IsDevelopment())
{
    app.UseCors("Development");
}
else
{
    app.UseCors("Production");
}

// Multi-tenant middleware (DEVE vir ANTES de Authentication)
app.UseTenantMiddleware();

// REMOVIDO temporariamente para desenvolvimento - Reativar em produção
// app.UseAuthentication();
// app.UseAuthorization();

// Configure Health Check endpoints
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = System.Text.Json.JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            timestamp = DateTime.UtcNow,
            duration = report.TotalDuration.TotalMilliseconds,
            checks = report.Entries.Select(x => new
            {
                name = x.Key,
                status = x.Value.Status.ToString(),
                duration = x.Value.Duration.TotalMilliseconds,
                description = x.Value.Description,
                data = x.Value.Data,
                exception = x.Value.Exception?.Message
            })
        }, new System.Text.Json.JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
        });
        await context.Response.WriteAsync(result);
    }
});

// Health check endpoints específicos
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});

app.MapControllers();

// SPA fallback for React Router
if (app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("index.html");
}

// Ensure ALL tenant databases are created and seeded
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var tenantConfigs = scope.ServiceProvider.GetRequiredService<IOptions<ConfiguracoesEmpresas>>().Value;
    
    logger.LogInformation("[STARTUP] Inicializando bancos de dados multi-tenant");

    foreach (var empresaConfig in tenantConfigs.Empresas.Where(e => e.Ativo))
    {
        logger.LogInformation("[STARTUP] Processando empresa: {Empresa}", empresaConfig.NomeExibicao);
        
        try
        {
            // Criar OpcoesEmpresa para esta empresa
            var opcoesEmpresa = new OpcoesEmpresa
            {
                IdentificadorEmpresa = empresaConfig.Id,
                NomeExibicao = empresaConfig.NomeExibicao,
                StringConexao = empresaConfig.StringConexao,
                Armazenamento = new OpcoesArmazenamentoEmpresa
                {
                    CaminhoBase = string.IsNullOrWhiteSpace(empresaConfig.CertificadoCaminho) 
                        ? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "arquivos", empresaConfig.Id) 
                        : Path.GetDirectoryName(empresaConfig.CertificadoCaminho) ?? AppDomain.CurrentDomain.BaseDirectory,
                    PastaLogos = "logos",
                    PastaCertificados = "certificados",
                    PastaXml = "xml"
                },
                IdentidadeVisual = new OpcoesIdentidadeVisualEmpresa
                {
                    ArquivoLogotipo = empresaConfig.Logo,
                    CorPrimaria = empresaConfig.CorPrimaria
                }
            };

            // Criar contexto específico para esta empresa
            var optionsBuilder = new DbContextOptionsBuilder<SistemaContext>();
            optionsBuilder.UseSqlServer(empresaConfig.StringConexao, sql =>
            {
                sql.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(3),
                    errorNumbersToAdd: null);
                sql.CommandTimeout(30);
            });

            using var context = new SistemaContext(optionsBuilder.Options);
            
            logger.LogInformation("[STARTUP] Aplicando migrations para: {Empresa}", empresaConfig.NomeExibicao);
            
            // Apply pending migrations
            context.Database.Migrate();
            logger.LogInformation("[STARTUP] ✓ Migrations aplicadas para: {Empresa}", empresaConfig.NomeExibicao);

            // Seed automático do usuário programador e permissões
            try
            {
                await DatabaseSeeder.SeedAsync(context, logger);
                logger.LogInformation("[STARTUP] ✓ Seed concluído para: {Empresa}", empresaConfig.NomeExibicao);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[STARTUP] Erro durante seed para empresa {Empresa} - continuando", empresaConfig.NomeExibicao);
            }
        }
        catch (Exception ex) when (ex.Message.Contains("multiple cascade paths") || ex.Message.Contains("cascade"))
        {
            logger.LogWarning(ex, "[STARTUP] Erro de foreign key para empresa {Empresa} - continuando", empresaConfig.NomeExibicao);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[STARTUP] Erro ao processar empresa {Empresa}", empresaConfig.NomeExibicao);
        }
    }
    
    logger.LogInformation("[STARTUP] ✓ Inicialização multi-tenant concluída");
}

app.Run();

