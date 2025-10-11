using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Data.Interceptors;

public sealed class SlowQueryInterceptor : DbCommandInterceptor
{
    private readonly int _thresholdMs;
    private readonly ILogger<SlowQueryInterceptor>? _logger;

    public SlowQueryInterceptor(int thresholdMilliseconds = 500, ILogger<SlowQueryInterceptor>? logger = null)
    {
        _thresholdMs = thresholdMilliseconds;
        _logger = logger;
    }

    private void LogIfSlow(DbCommand command, TimeSpan elapsed)
    {
        if (elapsed.TotalMilliseconds >= _thresholdMs)
        {
            var msg = $"[DB][SLOW] {elapsed.TotalMilliseconds:n0} ms SQL= {command.CommandText}\nParams: {string.Join(", ", command.Parameters.Cast<DbParameter>().Select(p => p.ParameterName + '=' + (p.Value ?? "NULL")))}";
            if (_logger != null)
                _logger.LogWarning(msg);
            else
                Console.WriteLine(msg);
        }
    }

    public override InterceptionResult<DbDataReader> ReaderExecuting(DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result)
        => result;

    public override async ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result, CancellationToken cancellationToken = default)
        => await ValueTask.FromResult(result);

    public override DbDataReader ReaderExecuted(DbCommand command, CommandExecutedEventData eventData, DbDataReader result)
    {
        LogIfSlow(command, eventData.Duration);
        return result;
    }

    public override async ValueTask<DbDataReader> ReaderExecutedAsync(DbCommand command, CommandExecutedEventData eventData, DbDataReader result, CancellationToken cancellationToken = default)
    {
        LogIfSlow(command, eventData.Duration);
        return await ValueTask.FromResult(result);
    }

    public override int NonQueryExecuted(DbCommand command, CommandExecutedEventData eventData, int result)
    {
        LogIfSlow(command, eventData.Duration);
        return result;
    }

    public override async ValueTask<int> NonQueryExecutedAsync(DbCommand command, CommandExecutedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        LogIfSlow(command, eventData.Duration);
        return await ValueTask.FromResult(result);
    }

    public override object? ScalarExecuted(DbCommand command, CommandExecutedEventData eventData, object? result)
    {
        LogIfSlow(command, eventData.Duration);
        return result;
    }

    public override async ValueTask<object?> ScalarExecutedAsync(DbCommand command, CommandExecutedEventData eventData, object? result, CancellationToken cancellationToken = default)
    {
        LogIfSlow(command, eventData.Duration);
        return await ValueTask.FromResult(result);
    }
}
