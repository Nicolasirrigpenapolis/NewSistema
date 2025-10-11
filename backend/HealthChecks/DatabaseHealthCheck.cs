using Microsoft.Extensions.Diagnostics.HealthChecks;
using Backend.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.HealthChecks
{
    /// <summary>
    /// Health check para verificar conectividade com o banco de dados
    /// </summary>
    public class DatabaseHealthCheck : IHealthCheck
    {
        private readonly SistemaContext _context;
        private readonly ILogger<DatabaseHealthCheck> _logger;

        public DatabaseHealthCheck(SistemaContext context, ILogger<DatabaseHealthCheck> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Teste simples de conectividade
                await _context.Database.CanConnectAsync(cancellationToken);

                // Verificar se as tabelas principais existem
                var emitenteCount = await _context.Emitentes.CountAsync(cancellationToken);

                var data = new Dictionary<string, object>
                {
                    ["database_status"] = "connected",
                    ["emitentes_count"] = emitenteCount,
                    ["check_time"] = DateTime.UtcNow
                };

                _logger.LogInformation("Database health check passed. Emitentes count: {Count}", emitenteCount);

                return HealthCheckResult.Healthy("Database is accessible", data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database health check failed");

                var data = new Dictionary<string, object>
                {
                    ["database_status"] = "failed",
                    ["error"] = ex.Message,
                    ["check_time"] = DateTime.UtcNow
                };

                return HealthCheckResult.Unhealthy("Database is not accessible", ex, data);
            }
        }
    }
}
