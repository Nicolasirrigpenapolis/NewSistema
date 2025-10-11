namespace Backend.Api.Extensions
{
    /// <summary>
    /// Extensões para IEnumerable seguindo boas práticas
    /// </summary>
    public static class EnumerableExtensions
    {
        /// <summary>
        /// Retorna o valor máximo ou um valor padrão se a sequência estiver vazia
        /// </summary>
        public static TResult MaxOrDefault<TSource, TResult>(
            this IEnumerable<TSource> source,
            Func<TSource, TResult> selector,
            TResult defaultValue = default!)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            if (selector == null) throw new ArgumentNullException(nameof(selector));

            var list = source.ToList();
            return list.Any() ? list.Max(selector)! : defaultValue;
        }
    }
}
