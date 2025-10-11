using System.Collections.Concurrent;
using System.Reflection;

namespace Backend.Api.Utils
{
    /// <summary>
    /// Cache para operações de reflection para melhorar performance
    /// </summary>
    public static class ReflectionCache
    {
        private static readonly ConcurrentDictionary<string, PropertyInfo?> _propertyCache = new();
        private static readonly ConcurrentDictionary<Type, bool> _hasActivePropertyCache = new();

        /// <summary>
        /// Obtém uma propriedade com cache
        /// </summary>
        public static PropertyInfo? GetCachedProperty(Type type, string propertyName)
        {
            var key = $"{type.FullName}.{propertyName}";
            return _propertyCache.GetOrAdd(key, _ => type.GetProperty(propertyName));
        }

        /// <summary>
        /// Verifica se o tipo tem propriedade "Ativo" com cache
        /// </summary>
        public static bool HasActiveProperty(Type type)
        {
            return _hasActivePropertyCache.GetOrAdd(type, t => t.GetProperty("Ativo") != null);
        }

        /// <summary>
        /// Obtém valor da propriedade "Ativo" com cache
        /// </summary>
        public static bool GetActiveValue(object entity)
        {
            var activeProperty = GetCachedProperty(entity.GetType(), "Ativo");
            return activeProperty?.GetValue(entity) as bool? ?? true;
        }

        /// <summary>
        /// Define valor da propriedade "Ativo" com cache
        /// </summary>
        public static void SetActiveValue(object entity, bool value)
        {
            var activeProperty = GetCachedProperty(entity.GetType(), "Ativo");
            activeProperty?.SetValue(entity, value);
        }

        /// <summary>
        /// Obtém valor da propriedade "Id" com cache
        /// </summary>
        public static object GetIdValue(object entity)
        {
            var idProperty = GetCachedProperty(entity.GetType(), "Id");
            return idProperty?.GetValue(entity) ?? 0;
        }

        /// <summary>
        /// Define valor da propriedade "DataCriacao" com cache
        /// </summary>
        public static void SetDataCriacaoValue(object entity, DateTime value)
        {
            var dataProperty = GetCachedProperty(entity.GetType(), "DataCriacao");
            dataProperty?.SetValue(entity, value);
        }

        /// <summary>
        /// Define valor da propriedade "DataUltimaAlteracao" com cache
        /// </summary>
        public static void SetDataUltimaAlteracaoValue(object entity, DateTime value)
        {
            var dataProperty = GetCachedProperty(entity.GetType(), "DataUltimaAlteracao") ??
                              GetCachedProperty(entity.GetType(), "DataAtualizacao");
            dataProperty?.SetValue(entity, value);
        }

        /// <summary>
        /// Limpa o cache (para uso em testes ou situações específicas)
        /// </summary>
        public static void ClearCache()
        {
            _propertyCache.Clear();
            _hasActivePropertyCache.Clear();
        }
    }
}
