using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Diagnostics;

namespace Backend.Api.HealthChecks;

public class MemoryHealthCheck : IHealthCheck
{
    private readonly long _thresholdBytes;
    public MemoryHealthCheck(long thresholdBytes = 512L * 1024 * 1024) // 512 MB default
    {
        _thresholdBytes = thresholdBytes;
    }

    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var process = Process.GetCurrentProcess();
        var used = process.WorkingSet64;
        if (used > _thresholdBytes)
        {
            return Task.FromResult(HealthCheckResult.Degraded($"Alto uso de memória: {used / (1024*1024)} MB > limite {_thresholdBytes / (1024*1024)} MB"));
        }
        return Task.FromResult(HealthCheckResult.Healthy($"Uso de memória ok: {used / (1024*1024)} MB"));
    }
}
