using Backend.Api.Services;

namespace Backend.Api.Middleware;

/// <summary>
/// Middleware para extrair o tenant (empresa) do header da requisição
/// </summary>
public class TenantMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantMiddleware> _logger;

    public TenantMiddleware(RequestDelegate next, ILogger<TenantMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        // Extrair tenant do header "X-Tenant-Id"
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantId) && 
            !string.IsNullOrWhiteSpace(tenantId))
        {
            try
            {
                var tenantIdString = tenantId.ToString();
                tenantService.DefinirTenant(tenantIdString);
                _logger.LogInformation("[TenantMiddleware] Tenant definido: {TenantId} | Path: {Path}", tenantIdString, context.Request.Path);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("[TenantMiddleware] Erro ao definir tenant: {Message}", ex.Message);
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsJsonAsync(new { error = ex.Message });
                return;
            }
        }
        else
        {
            _logger.LogWarning("[TenantMiddleware] Header X-Tenant-Id não encontrado ou vazio | Path: {Path}", context.Request.Path);
        }

        await _next(context);
    }
}

/// <summary>
/// Extension method para registrar o middleware
/// </summary>
public static class TenantMiddlewareExtensions
{
    public static IApplicationBuilder UseTenantMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<TenantMiddleware>();
    }
}
