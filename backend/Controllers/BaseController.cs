// Teste de modificação - BaseController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Extensions;
using Backend.Api.Utils;
using Backend.Api.Services;

namespace Backend.Api.Controllers
{
    /// <summary>
    /// Controller base com funcionalidades comuns para todos os controllers CRUD
    /// </summary>
    [ApiController]
    public abstract class BaseController<TEntity, TListDto, TDetailDto, TCreateDto, TUpdateDto> : ControllerBase
        where TEntity : class
        where TListDto : class
        where TDetailDto : class
        where TCreateDto : class
        where TUpdateDto : class
    {
        protected readonly SistemaContext _context;
        protected readonly ILogger _logger;
        protected readonly ICacheService? _cacheService;

        protected BaseController(SistemaContext context, ILogger logger, ICacheService? cacheService = null)
        {
            _context = context;
            _logger = logger;
            _cacheService = cacheService;
        }

        protected virtual string GetCacheKeyPrefix()
        {
            return typeof(TEntity).Name.ToLower();
        }

        /// <summary>
        /// Obter DbSet da entidade - deve ser implementado por cada controller
        /// </summary>
        protected abstract DbSet<TEntity> GetDbSet();

        /// <summary>
        /// Converter entidade para DTO de lista - deve ser implementado por cada controller
        /// </summary>
        protected abstract TListDto EntityToListDto(TEntity entity);

        /// <summary>
        /// Converter entidade para DTO de detalhes - deve ser implementado por cada controller
        /// </summary>
        protected abstract TDetailDto EntityToDetailDto(TEntity entity);

        /// <summary>
        /// Criar entidade a partir do DTO - deve ser implementado por cada controller
        /// </summary>
        protected abstract TEntity CreateDtoToEntity(TCreateDto dto);

        /// <summary>
        /// Atualizar entidade com dados do DTO - deve ser implementado por cada controller
        /// </summary>
        protected abstract void UpdateEntityFromDto(TEntity entity, TUpdateDto dto);

        /// <summary>
        /// Aplicar filtros de busca - deve ser implementado por cada controller
        /// </summary>
        protected abstract IQueryable<TEntity> ApplySearchFilter(IQueryable<TEntity> query, string search);

        /// <summary>
        /// Aplicar ordenação - deve ser implementado por cada controller
        /// </summary>
        protected abstract IQueryable<TEntity> ApplyOrdering(IQueryable<TEntity> query, string? sortBy, string? sortDirection);

        /// <summary>
        /// Validar se entidade pode ser excluída - deve ser implementado por cada controller
        /// </summary>
        protected abstract Task<(bool canDelete, string errorMessage)> CanDeleteAsync(TEntity entity);

        /// <summary>
        /// Validação personalizada antes de criar - pode ser sobrescrito
        /// </summary>
        protected virtual Task<(bool isValid, string errorMessage)> ValidateCreateAsync(TCreateDto dto)
        {
            return Task.FromResult((true, string.Empty));
        }

        /// <summary>
        /// Validação personalizada antes de atualizar - pode ser sobrescrito
        /// </summary>
        protected virtual Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(TEntity entity, TUpdateDto dto)
        {
            return Task.FromResult((true, string.Empty));
        }

        /// <summary>
        /// Verifica se entidade está ativa (para soft delete) - pode ser sobrescrito
        /// </summary>
        protected virtual bool IsEntityActive(TEntity entity)
        {
            return ReflectionCache.GetActiveValue(entity);
        }

        /// <summary>
        /// Define entidade como inativa (soft delete) - pode ser sobrescrito
        /// </summary>
        protected virtual void SetEntityInactive(TEntity entity)
        {
            ReflectionCache.SetActiveValue(entity, false);
        }

        /// <summary>
        /// Obter ID da entidade - pode ser sobrescrito
        /// </summary>
        protected virtual object GetEntityId(TEntity entity)
        {
            return ReflectionCache.GetIdValue(entity);
        }

        /// <summary>
        /// GET paginado padrão
        /// </summary>
        [HttpGet]
        public virtual async Task<ActionResult<PagedResult<TListDto>>> Get([FromQuery] PaginationRequest request)
        {
            try
            {
                var query = GetDbSet().AsQueryable();

                // Aplicar filtro de busca
                if (!string.IsNullOrWhiteSpace(request.Search))
                {
                    query = ApplySearchFilter(query, request.Search);
                }

                // Aplicar ordenação
                query = ApplyOrdering(query, request.SortBy, request.SortDirection);

                // Aplicar paginação
                var totalItems = await query.CountAsync();
                var items = await query
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync();

                // Aplicar filtro de "Ativo" DEPOIS de trazer do banco (em memória)
                if (request.Ativo.HasValue)
                {
                    var ativoFilter = request.Ativo.Value;
                    items = items.Where(e => IsEntityActive(e) == ativoFilter).ToList();
                    totalItems = items.Count;
                }

                var startItem = totalItems > 0 ? ((request.Page - 1) * request.PageSize) + 1 : 0;
                var endItem = totalItems > 0 ? Math.Min(request.Page * request.PageSize, totalItems) : 0;

                var result = new PagedResult<TListDto>
                {
                    Items = items.Select(EntityToListDto).ToList(),
                    TotalItems = totalItems,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalItems / request.PageSize),
                    HasNextPage = request.Page * request.PageSize < totalItems,
                    HasPreviousPage = request.Page > 1,
                    StartItem = startItem,
                    EndItem = endItem
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter lista paginada");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// GET por ID padrão
        /// </summary>
        [HttpGet("{id}")]
        public virtual async Task<ActionResult<TDetailDto>> GetById(int id)
        {
            try
            {
                var cacheKey = $"{GetCacheKeyPrefix()}:detail:{id}";

                // Tentar obter do cache
                if (_cacheService != null)
                {
                    var cached = _cacheService.Get<TDetailDto>(cacheKey);
                    if (cached != null)
                    {
                        return Ok(cached);
                    }
                }

                var entity = await GetDbSet().FindAsync(id);

                if (entity == null || !IsEntityActive(entity))
                {
                    return NotFound(new { message = "Registro não encontrado" });
                }

                var dto = EntityToDetailDto(entity);

                // Adicionar ao cache (5 minutos)
                _cacheService?.Set(cacheKey, dto, TimeSpan.FromMinutes(5));

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter registro por ID: {Id}", id);
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// POST padrão
        /// </summary>
        [HttpPost]
        public virtual async Task<ActionResult<TDetailDto>> Create([FromBody] TCreateDto dto)
        {
            _logger.LogInformation("POST Create - Recebido: {Dto}", System.Text.Json.JsonSerializer.Serialize(dto));

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("POST Create - ModelState inválido: {Errors}",
                    string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            try
            {
                // Validação personalizada
                var (isValid, errorMessage) = await ValidateCreateAsync(dto);
                if (!isValid)
                {
                    return BadRequest(new { message = errorMessage });
                }

                var entity = CreateDtoToEntity(dto);

                // Definir data de criação se aplicável
                ReflectionCache.SetDataCriacaoValue(entity, DateTime.Now);

                // Definir como ativo se aplicável
                ReflectionCache.SetActiveValue(entity, true);

                GetDbSet().Add(entity);
                await _context.SaveChangesAsync();

                // Invalidar cache de listagens
                _cacheService?.RemoveByPrefix(GetCacheKeyPrefix());

                var result = EntityToDetailDto(entity);
                var entityId = GetEntityId(entity);

                return CreatedAtAction(nameof(GetById), new { id = entityId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar registro");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// PUT padrão
        /// </summary>
        [HttpPut("{id}")]
        public virtual async Task<IActionResult> Update(int id, [FromBody] TUpdateDto dto)
        {
            _logger.LogInformation("PUT Update - ID recebido: {Id}, DTO: {Dto}",
                id, System.Text.Json.JsonSerializer.Serialize(dto));

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("PUT Update - ModelState inválido: {Errors}",
                    string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            try
            {
                var entity = await GetDbSet().FindAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("PUT Update - Entidade não encontrada para ID: {Id}", id);
                    return NotFound(new { message = "Registro não encontrado" });
                }

                // Validação personalizada
                var (isValid, errorMessage) = await ValidateUpdateAsync(entity, dto);
                if (!isValid)
                {
                    return BadRequest(new { message = errorMessage });
                }

                UpdateEntityFromDto(entity, dto);

                // Atualizar data de alteração se aplicável
                ReflectionCache.SetDataUltimaAlteracaoValue(entity, DateTime.Now);

                await _context.SaveChangesAsync();

                // Invalidar cache específico e listagens
                _cacheService?.Remove($"{GetCacheKeyPrefix()}:detail:{id}");
                _cacheService?.RemoveByPrefix(GetCacheKeyPrefix());

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar registro ID: {Id}", id);
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// DELETE padrão (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        public virtual async Task<IActionResult> Delete(int id)
        {
            try
            {
                var entity = await GetDbSet().FindAsync(id);
                if (entity == null)
                {
                    return NotFound(new { message = "Registro não encontrado" });
                }

                // Verificar se pode deletar
                var (canDelete, errorMessage) = await CanDeleteAsync(entity);
                if (!canDelete)
                {
                    return BadRequest(new { message = errorMessage });
                }

                // SEMPRE fazer HARD DELETE - exclusão real do banco
                GetDbSet().Remove(entity);

                await _context.SaveChangesAsync();

                // Invalidar cache específico e listagens
                _cacheService?.Remove($"{GetCacheKeyPrefix()}:detail:{id}");
                _cacheService?.RemoveByPrefix(GetCacheKeyPrefix());

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao excluir registro ID: {Id}", id);
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }
    }
}
