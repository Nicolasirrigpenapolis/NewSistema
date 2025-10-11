using Microsoft.Extensions.Caching.Memory;

namespace Backend.Api.Services;

public interface ICacheService
{
    T? Get<T>(string key);
    void Set<T>(string key, T value, TimeSpan? absoluteExpiration = null);
    void Remove(string key);
    void RemoveByPrefix(string prefix);
}

public class CacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<CacheService> _logger;
    private readonly HashSet<string> _cacheKeys = new();
    private readonly object _lock = new();

    public CacheService(IMemoryCache cache, ILogger<CacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public T? Get<T>(string key)
    {
        try
        {
            return _cache.Get<T>(key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cache for key: {Key}", key);
            return default;
        }
    }

    public void Set<T>(string key, T value, TimeSpan? absoluteExpiration = null)
    {
        try
        {
            var options = new MemoryCacheEntryOptions();

            if (absoluteExpiration.HasValue)
            {
                options.SetAbsoluteExpiration(absoluteExpiration.Value);
            }
            else
            {
                // Default: 5 minutos
                options.SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
            }

            options.RegisterPostEvictionCallback((key, value, reason, state) =>
            {
                lock (_lock)
                {
                    _cacheKeys.Remove(key.ToString()!);
                }
            });

            _cache.Set(key, value, options);

            lock (_lock)
            {
                _cacheKeys.Add(key);
            }

            _logger.LogDebug("Cache set for key: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting cache for key: {Key}", key);
        }
    }

    public void Remove(string key)
    {
        try
        {
            _cache.Remove(key);
            lock (_lock)
            {
                _cacheKeys.Remove(key);
            }
            _logger.LogDebug("Cache removed for key: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cache for key: {Key}", key);
        }
    }

    public void RemoveByPrefix(string prefix)
    {
        try
        {
            List<string> keysToRemove;
            lock (_lock)
            {
                keysToRemove = _cacheKeys.Where(k => k.StartsWith(prefix)).ToList();
            }

            foreach (var key in keysToRemove)
            {
                Remove(key);
            }

            _logger.LogDebug("Cache removed for prefix: {Prefix} ({Count} keys)", prefix, keysToRemove.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cache by prefix: {Prefix}", prefix);
        }
    }
}

