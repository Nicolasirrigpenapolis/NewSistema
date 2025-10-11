using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Utils;

namespace Backend.Api.Repositories
{
    /// <summary>
    /// Implementação genérica do repositório com Entity Framework
    /// </summary>
    public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
    {
        protected readonly SistemaContext _context;
        protected readonly DbSet<TEntity> _dbSet;
        protected readonly ILogger<GenericRepository<TEntity>> _logger;

        public GenericRepository(SistemaContext context, ILogger<GenericRepository<TEntity>> logger)
        {
            _context = context;
            _dbSet = context.Set<TEntity>();
            _logger = logger;
        }

        #region Operações básicas

        public virtual async Task<TEntity?> GetByIdAsync(int id)
        {
            try
            {
                var entity = await _dbSet.FindAsync(id);

                // Verificar se está ativo (se aplicável)
                if (entity != null && !IsEntityActive(entity))
                    return null;

                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar entidade por ID: {Id}", id);
                throw;
            }
        }

        public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            try
            {
                var query = _dbSet.AsQueryable();

                // Filtrar apenas ativos se aplicável
                if (HasActiveProperty())
                {
                    query = query.Where(e => EF.Property<bool>(e, "Ativo"));
                }

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar todas as entidades");
                throw;
            }
        }

        public virtual async Task<PagedResult<TEntity>> GetPagedAsync(PaginationRequest request)
        {
            try
            {
                var query = _dbSet.AsQueryable();

                // Filtrar apenas ativos se aplicável
                if (HasActiveProperty())
                {
                    query = query.Where(e => EF.Property<bool>(e, "Ativo"));
                }

                // Aplicar busca se fornecida
                if (!string.IsNullOrWhiteSpace(request.Search))
                {
                    query = ApplySearchFilter(query, request.Search);
                }

                // Aplicar ordenação
                query = ApplyOrdering(query, request.SortBy, request.SortDirection);

                // Contar total de itens
                var totalItems = await query.CountAsync();

                // Aplicar paginação
                var items = await query
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync();

                var startItem = totalItems > 0 ? ((request.Page - 1) * request.PageSize) + 1 : 0;
                var endItem = totalItems > 0 ? Math.Min(request.Page * request.PageSize, totalItems) : 0;

                return new PagedResult<TEntity>
                {
                    Items = items,
                    TotalItems = totalItems,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalItems / request.PageSize),
                    HasNextPage = request.Page * request.PageSize < totalItems,
                    HasPreviousPage = request.Page > 1,
                    StartItem = startItem,
                    EndItem = endItem
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar entidades paginadas");
                throw;
            }
        }

        public virtual async Task<TEntity> AddAsync(TEntity entity)
        {
            try
            {
                // Definir data de criação se aplicável
                SetCreationDate(entity);

                // Definir como ativo se aplicável
                SetActiveStatus(entity, true);

                _dbSet.Add(entity);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Entidade {EntityType} criada com ID: {Id}",
                    typeof(TEntity).Name, GetEntityId(entity));

                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao adicionar entidade {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual async Task UpdateAsync(TEntity entity)
        {
            try
            {
                // Definir data de atualização se aplicável
                SetUpdateDate(entity);

                _dbSet.Update(entity);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Entidade {EntityType} atualizada com ID: {Id}",
                    typeof(TEntity).Name, GetEntityId(entity));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar entidade {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual async Task DeleteAsync(int id)
        {
            try
            {
                var entity = await _dbSet.FindAsync(id);
                if (entity == null)
                    throw new InvalidOperationException($"Entidade com ID {id} não encontrada");

                // SEMPRE fazer HARD DELETE - exclusão real do banco
                _dbSet.Remove(entity);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Entidade {EntityType} deletada com ID: {Id}",
                    typeof(TEntity).Name, id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao deletar entidade {EntityType} com ID: {Id}",
                    typeof(TEntity).Name, id);
                throw;
            }
        }

        #endregion

        #region Operações avançadas

        public virtual async Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate)
        {
            try
            {
                var query = _dbSet.Where(predicate);

                // Filtrar apenas ativos se aplicável
                if (HasActiveProperty())
                {
                    query = query.Where(e => EF.Property<bool>(e, "Ativo"));
                }

                return await query.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar entidades com filtro");
                throw;
            }
        }

        public virtual async Task<TEntity?> SingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate)
        {
            try
            {
                var query = _dbSet.Where(predicate);

                // Filtrar apenas ativos se aplicável
                if (HasActiveProperty())
                {
                    query = query.Where(e => EF.Property<bool>(e, "Ativo"));
                }

                return await query.SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar entidade única com filtro");
                throw;
            }
        }

        public virtual async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>> predicate)
        {
            try
            {
                var query = _dbSet.Where(predicate);

                // Filtrar apenas ativos se aplicável
                if (HasActiveProperty())
                {
                    query = query.Where(e => EF.Property<bool>(e, "Ativo"));
                }

                return await query.AnyAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao verificar existência de entidade");
                throw;
            }
        }

        public virtual async Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null)
        {
            try
            {
                var query = _dbSet.AsQueryable();

                if (predicate != null)
                    query = query.Where(predicate);

                // Filtrar apenas ativos se aplicável
                if (HasActiveProperty())
                {
                    query = query.Where(e => EF.Property<bool>(e, "Ativo"));
                }

                return await query.CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao contar entidades");
                throw;
            }
        }

        #endregion

        #region Operações em lote

        public virtual async Task AddRangeAsync(IEnumerable<TEntity> entities)
        {
            try
            {
                foreach (var entity in entities)
                {
                    SetCreationDate(entity);
                    SetActiveStatus(entity, true);
                }

                _dbSet.AddRange(entities);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Adicionadas {Count} entidades {EntityType}",
                    entities.Count(), typeof(TEntity).Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao adicionar entidades em lote");
                throw;
            }
        }

        public virtual async Task UpdateRangeAsync(IEnumerable<TEntity> entities)
        {
            try
            {
                foreach (var entity in entities)
                {
                    SetUpdateDate(entity);
                }

                _dbSet.UpdateRange(entities);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Atualizadas {Count} entidades {EntityType}",
                    entities.Count(), typeof(TEntity).Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar entidades em lote");
                throw;
            }
        }

        public virtual async Task DeleteRangeAsync(IEnumerable<TEntity> entities)
        {
            try
            {
                _dbSet.RemoveRange(entities);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Removidas {Count} entidades {EntityType}",
                    entities.Count(), typeof(TEntity).Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao remover entidades em lote");
                throw;
            }
        }

        #endregion

        // Soft delete removido - sistema usa apenas HARD DELETE

        #region Métodos auxiliares (podem ser sobrescritos)

        protected virtual bool HasActiveProperty()
        {
            return ReflectionCache.HasActiveProperty(typeof(TEntity));
        }

        protected virtual bool IsEntityActive(TEntity entity)
        {
            return ReflectionCache.GetActiveValue(entity);
        }

        protected virtual void SetActiveStatus(TEntity entity, bool active)
        {
            ReflectionCache.SetActiveValue(entity, active);
        }

        protected virtual void SetCreationDate(TEntity entity)
        {
            ReflectionCache.SetDataCriacaoValue(entity, DateTime.Now);
        }

        protected virtual void SetUpdateDate(TEntity entity)
        {
            ReflectionCache.SetDataUltimaAlteracaoValue(entity, DateTime.Now);
        }

        protected virtual object GetEntityId(TEntity entity)
        {
            return ReflectionCache.GetIdValue(entity);
        }

        protected virtual IQueryable<TEntity> ApplySearchFilter(IQueryable<TEntity> query, string search)
        {
            // Implementação padrão - deve ser sobrescrita para filtros específicos
            return query;
        }

        protected virtual IQueryable<TEntity> ApplyOrdering(IQueryable<TEntity> query, string? sortBy, string? sortDirection)
        {
            // Implementação padrão - ordenar por ID
            var isDesc = sortDirection?.ToLower() == "desc";
            return isDesc ?
                query.OrderByDescending(e => EF.Property<int>(e, "Id")) :
                query.OrderBy(e => EF.Property<int>(e, "Id"));
        }

        #endregion
    }
}
