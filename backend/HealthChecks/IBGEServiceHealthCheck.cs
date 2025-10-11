using Microsoft.Extensions.Diagnostics.HealthChecks;
using Backend.Api.Interfaces;

namespace Backend.Api.HealthChecks
{
    /// <summary>
    /// Health check para verificar disponibilidade da API do IBGE
    /// </summary>
    public class IBGEServiceHealthCheck : IHealthCheck
    {
        private readonly IIBGEService _ibgeService;
        private readonly ILogger<IBGEServiceHealthCheck> _logger;
        private readonly HttpClient _httpClient;

        public IBGEServiceHealthCheck(
            IIBGEService ibgeService,
            ILogger<IBGEServiceHealthCheck> logger,
            HttpClient httpClient)
        {
            _ibgeService = ibgeService;
            _logger = logger;
            _httpClient = httpClient;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            try
            {
                // Teste rápido de conectividade com a API do IBGE
                var response = await _httpClient.GetAsync(
                    "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
                    cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    var data = new Dictionary<string, object>
                    {
                        ["ibge_api_status"] = "available",
                        ["response_status"] = response.StatusCode.ToString(),
                        ["check_time"] = DateTime.UtcNow
                    };

                    _logger.LogInformation("IBGE service health check passed");
                    return HealthCheckResult.Healthy("IBGE API is available", data);
                }
                else
                {
                    var data = new Dictionary<string, object>
                    {
                        ["ibge_api_status"] = "degraded",
                        ["response_status"] = response.StatusCode.ToString(),
                        ["check_time"] = DateTime.UtcNow
                    };

                    _logger.LogWarning("IBGE service health check degraded. Status: {Status}", response.StatusCode);
                    return HealthCheckResult.Degraded("IBGE API returned non-success status", null, data);
                }
            }
            catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
            {
                _logger.LogWarning("IBGE service health check timeout");

                var data = new Dictionary<string, object>
                {
                    ["ibge_api_status"] = "timeout",
                    ["error"] = "Request timeout",
                    ["check_time"] = DateTime.UtcNow
                };

                return HealthCheckResult.Degraded("IBGE API timeout", ex, data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "IBGE service health check failed");

                var data = new Dictionary<string, object>
                {
                    ["ibge_api_status"] = "failed",
                    ["error"] = ex.Message,
                    ["check_time"] = DateTime.UtcNow
                };

                return HealthCheckResult.Unhealthy("IBGE API is not accessible", ex, data);
            }
        }
    }
}
