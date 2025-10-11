using System.Linq.Expressions;
using Backend.Api.DTOs;

namespace Backend.Api.Repositories
{
    /// <summary>
    /// Interface genérica para repositórios com operações CRUD padronizadas
    /// </summary>
    public interface IGenericRepository<TEntity> where TEntity : class
    {
        // Operações básicas
        Task<TEntity?> GetByIdAsync(int id);
        Task<IEnumerable<TEntity>> GetAllAsync();
        Task<PagedResult<TEntity>> GetPagedAsync(PaginationRequest request);
        Task<TEntity> AddAsync(TEntity entity);
        Task UpdateAsync(TEntity entity);
        Task DeleteAsync(int id);

        // Operações avançadas
        Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity?> SingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate);
        Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate);
        Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null);

        // Operações em lote
        Task AddRangeAsync(IEnumerable<TEntity> entities);
        Task UpdateRangeAsync(IEnumerable<TEntity> entities);
        Task DeleteRangeAsync(IEnumerable<TEntity> entities);

        // Soft delete removido - sistema usa apenas HARD DELETE
    }
}
