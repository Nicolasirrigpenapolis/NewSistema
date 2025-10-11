// Teste de modificação - Program.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IO;
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

var builder = WebApplication.CreateBuilder(args);

// Configurações específicas da empresa instalada
var secaoEmpresa = builder.Configuration.GetSection("Empresa");
var opcoesEmpresa = secaoEmpresa.Get<OpcoesEmpresa>();
if (opcoesEmpresa is null || string.IsNullOrWhiteSpace(opcoesEmpresa.IdentificadorEmpresa) || string.IsNullOrWhiteSpace(opcoesEmpresa.StringConexao))
{
    throw new InvalidOperationException("Configuração da seção 'Empresa' ausente ou incompleta. Defina IdentificadorEmpresa, NomeExibicao e StringConexao no arquivo de configuração da instalação.");
}
builder.Services.AddSingleton(opcoesEmpresa);
builder.Services.AddSingleton<IContextoEmpresa>(sp =>
{
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

    // Ajustes de performance locais:
    // - Connect Timeout reduzido para falhar rápido
    // - Encrypt desabilitado local (TLS handshake lento) pode ser reativado em produção
    // - Application Name para facilitar análise
    if (!baseConn.Contains("Application Name", StringComparison.OrdinalIgnoreCase))
        baseConn += (baseConn.Trim().EndsWith(";") ? string.Empty : ";") + "Application Name=BackendApiDev;";
    // Só força Encrypt=False em desenvolvimento; em produção deixar configurar externamente ou default True
    if (!baseConn.Contains("Encrypt", StringComparison.OrdinalIgnoreCase))
    {
        if (builder.Environment.IsDevelopment())
            baseConn += "Encrypt=False;"; // ambiente local
        else
            baseConn += "Encrypt=True;TrustServerCertificate=True;"; // ajustar TrustServerCertificate se houver cadeia válida
    }
    if (!baseConn.Contains("Max Pool Size", StringComparison.OrdinalIgnoreCase))
        baseConn += "Max Pool Size=100;";
    if (!baseConn.Contains("Min Pool Size", StringComparison.OrdinalIgnoreCase))
        baseConn += "Min Pool Size=5;";
    if (!baseConn.Contains("Pooling", StringComparison.OrdinalIgnoreCase))
        baseConn += "Pooling=true;";

    string Sanitize(string cs)
    {
        try
        {
            return System.Text.RegularExpressions.Regex.Replace(cs, @"(?i)(Password|Pwd)=[^;]*", "$1=***");
        }
        catch
        {
            return cs;
        }
    }

    logger.LogInformation("[DB] Empresa {Empresa} conectada com string sanitizada: {Conexao}", contextoEmpresa.IdentificadorEmpresa, Sanitize(baseConn));

    options
        .UseSqlServer(baseConn, sql =>
        {
            sql.CommandTimeout(30); // reduzir de 120 para 30
            sql.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null);
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
// Registro condicional do provider MDFe
// Provider MDFe: apenas implementação Stub ativa
builder.Services.AddSingleton<IMDFeProvider, StubMDFeProvider>();

builder.Services.AddScoped<IIBGEService, IBGEService>();

// INI validation services
builder.Services.AddSingleton<IniParser>();
builder.Services.AddSingleton<MdfeIniTemplateProvider>();
builder.Services.AddSingleton<IMdfeIniValidator, MdfeIniValidator>();

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

var contextoEmpresaApp = app.Services.GetRequiredService<IContextoEmpresa>();
var caminhoLogos = Path.Combine(contextoEmpresaApp.Armazenamento.CaminhoBase, contextoEmpresaApp.Armazenamento.PastaLogos);
if (Directory.Exists(caminhoLogos))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(caminhoLogos),
        RequestPath = "/arquivos/logos",
        OnPrepareResponse = context =>
        {
            context.Context.Response.Headers["Cache-Control"] = "public,max-age=300";
        }
    });
}

app.UseHttpsRedirection();

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

app.UseAuthentication();
app.UseAuthorization();

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

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<SistemaContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var permissaoRepo = scope.ServiceProvider.GetService<IPermissaoRepository>();

    try
    {
        // Apply pending migrations
        context.Database.Migrate();
        logger.LogInformation("Database migrations applied successfully");

        // Seed opcional controlado por variável de ambiente
        if (Environment.GetEnvironmentVariable("SEED_DATABASE") == "1")
        {
            try
            {
                await DatabaseSeeder.SeedAsync(context, logger);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro durante seed opcional");
            }
        }

        // Create master user automatically somente se variável habilitar
        if (Environment.GetEnvironmentVariable("CREATE_MASTER_USER") == "1")
        {
            await CreateMasterUser(context, passwordHasher, logger);
        }

        // Sempre garantir que cargo Programador tenha TODAS as permissões existentes
        await EnsureAllPermissionsForSuperUser(context, logger);
    }
    catch (Exception ex) when (ex.Message.Contains("multiple cascade paths") || ex.Message.Contains("cascade"))
    {
        // Ignore foreign key constraint errors - database creation may have partially succeeded
        logger.LogWarning(ex, "Foreign key constraint error during database creation - continuing anyway");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while applying database migrations");
    }
}

async Task CreateMasterUser(SistemaContext context, IPasswordHasher passwordHasher, ILogger logger)
{
    try
    {
        // Check if master user already exists
        var existingUser = await context.Usuarios.Include(u => u.Cargo).FirstOrDefaultAsync(u => u.UserName == "programador");
        if (existingUser != null)
        {
            // Se o usuário existe mas não tem cargo, vamos atualizar
            if (existingUser.CargoId == null)
            {
                logger.LogInformation("Master user exists but missing cargo - updating...");

                // Criar cargo Programador se não existir
                var cargo = await context.Cargos.FirstOrDefaultAsync(c => c.Nome == "Programador");
                if (cargo == null)
                {
                    cargo = new Cargo
                    {
                        Nome = "Programador",
                        Descricao = "Desenvolvedor do sistema com acesso total",
                        Ativo = true,
                        DataCriacao = DateTime.UtcNow
                    };
                    context.Cargos.Add(cargo);
                    await context.SaveChangesAsync();
                    logger.LogInformation("Cargo 'Programador' created successfully");
                }

                // Atualizar usuário com cargo
                existingUser.CargoId = cargo.Id;
                await context.SaveChangesAsync();
                logger.LogInformation("Master user updated with cargo 'Programador'");
            }
            else
            {
                logger.LogInformation("Master user already exists with cargo");
            }
            return;
        }

        // Criar cargo Programador se não existir
        var programadorCargo = await context.Cargos.FirstOrDefaultAsync(c => c.Nome == "Programador");
        if (programadorCargo == null)
        {
            programadorCargo = new Cargo
            {
                Nome = "Programador",
                Descricao = "Desenvolvedor do sistema com acesso total",
                Ativo = true,
                DataCriacao = DateTime.UtcNow
            };
            context.Cargos.Add(programadorCargo);
            await context.SaveChangesAsync();
            logger.LogInformation("Cargo 'Programador' created successfully");
        }

        // Create master user with cargo
        var masterUser = new Usuario
        {
            UserName = "programador",
            Nome = "Programador",
            CargoId = programadorCargo.Id,
            Ativo = true,
            DataCriacao = DateTime.UtcNow
        };

        var masterPassword = Environment.GetEnvironmentVariable("MASTER_USER_PASSWORD");
        if (string.IsNullOrWhiteSpace(masterPassword))
        {
            masterPassword = Guid.NewGuid().ToString("N").Substring(0, 12) + "!"; // gera senha temporária
            logger.LogWarning("MASTER_USER_PASSWORD não definida. Gerada senha temporária: {TempPassword}", masterPassword);
        }

        masterUser.PasswordHash = passwordHasher.HashPassword(masterPassword);

        // Add user to database
        context.Usuarios.Add(masterUser);
        await context.SaveChangesAsync();

        logger.LogInformation("Master user 'programador' created successfully with cargo 'Programador'");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error creating master user");
    }
}

async Task EnsureAllPermissionsForSuperUser(SistemaContext context, ILogger logger)
{
    try
    {
        var cargoProgramador = await context.Cargos.FirstOrDefaultAsync(c => c.Nome == "Programador");
        if (cargoProgramador == null)
        {
            logger.LogWarning("Cargo 'Programador' não encontrado ao sincronizar permissões");
            return;
        }

        var allPermIds = await context.Permissoes.Select(p => p.Id).ToListAsync();
        var existing = await context.CargoPermissoes
            .Where(cp => cp.CargoId == cargoProgramador.Id)
            .Select(cp => cp.PermissaoId)
            .ToListAsync();

        var missing = allPermIds.Except(existing).ToList();
        if (missing.Count == 0)
        {
            logger.LogInformation("Cargo 'Programador' já possui todas as permissões ({Count})", existing.Count);
            return;
        }

        foreach (var pid in missing)
        {
            context.CargoPermissoes.Add(new Backend.Api.Models.CargoPermissao
            {
                CargoId = cargoProgramador.Id,
                PermissaoId = pid,
                DataCriacao = DateTime.UtcNow
            });
        }
        await context.SaveChangesAsync();
        logger.LogInformation("Adicionadas {Added} novas permissões ao cargo 'Programador'. Total agora: {Total}", missing.Count, existing.Count + missing.Count);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Falha ao garantir permissões para super usuário");
    }
}

app.Run();

