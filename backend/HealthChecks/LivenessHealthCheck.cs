using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Backend.Api.HealthChecks;

public class LivenessHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        // Simples verificação: o processo está respondendo
        return Task.FromResult(HealthCheckResult.Healthy("Application is alive"));
    }
}
