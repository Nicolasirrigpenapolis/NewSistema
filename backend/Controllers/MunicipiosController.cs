using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Models;
using Backend.Api.DTOs;
using Backend.Api.Interfaces;
using Backend.Api.Services;
using System.Diagnostics;

namespace Backend.Api.Controllers
{
    [Route("api/[controller]")]
    public class MunicipiosController : BaseController<Municipio, MunicipioListDto, MunicipioDetailDto, MunicipioCreateDto, MunicipioUpdateDto>
    {
        private readonly IIBGEService _ibgeService;

        public MunicipiosController(
            SistemaContext context,
            IIBGEService ibgeService,
            ILogger<MunicipiosController> logger,
            ICacheService cacheService)
            : base(context, logger, cacheService)
        {
            _ibgeService = ibgeService;
        }

        protected override DbSet<Municipio> GetDbSet() => _context.Municipios;

        protected override MunicipioListDto EntityToListDto(Municipio entity)
        {
            return new MunicipioListDto
            {
                Id = entity.Id,
                Codigo = entity.Codigo,
                Nome = entity.Nome,
                Uf = entity.Uf,
                Ativo = entity.Ativo
            };
        }

        protected override MunicipioDetailDto EntityToDetailDto(Municipio entity)
        {
            return new MunicipioDetailDto
            {
                Id = entity.Id,
                Codigo = entity.Codigo,
                Nome = entity.Nome,
                Uf = entity.Uf,
                Ativo = entity.Ativo
            };
        }

        protected override Municipio CreateDtoToEntity(MunicipioCreateDto dto)
        {
            return new Municipio
            {
                Codigo = dto.Codigo,
                Nome = dto.Nome.Trim(),
                Uf = dto.Uf.Trim().ToUpper(),
                Ativo = true // Sempre ativo ao criar
            };
        }

        protected override void UpdateEntityFromDto(Municipio entity, MunicipioUpdateDto dto)
        {
            entity.Nome = dto.Nome.Trim();
            entity.Uf = dto.Uf.Trim().ToUpper();
            entity.Ativo = dto.Ativo;
        }

        protected override IQueryable<Municipio> ApplySearchFilter(IQueryable<Municipio> query, string search)
        {
            return query.Where(m =>
                m.Nome.Contains(search) ||
                m.Uf.Contains(search) ||
                m.Codigo.ToString().Contains(search)
            );
        }

        protected override IQueryable<Municipio> ApplyOrdering(IQueryable<Municipio> query, string? sortBy, string? sortDirection)
        {
            var isDesc = sortDirection?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "codigo" => isDesc ? query.OrderByDescending(m => m.Codigo) : query.OrderBy(m => m.Codigo),
                "uf" => isDesc ? query.OrderByDescending(m => m.Uf) : query.OrderBy(m => m.Uf),
                _ => isDesc ? query.OrderByDescending(m => m.Nome) : query.OrderBy(m => m.Nome)
            };
        }

        protected override async Task<(bool canDelete, string errorMessage)> CanDeleteAsync(Municipio entity)
        {
            // Verificar se município está sendo usado em algum MDFe ou outro local
            var temUso = await _context.MDFes.AnyAsync(m => m.EmitenteCodMunicipio == entity.Codigo);
            if (temUso)
            {
                return (false, "Não é possível excluir município que está sendo usado");
            }
            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateCreateAsync(MunicipioCreateDto dto)
        {
            var existente = await _context.Municipios.AnyAsync(m => m.Codigo == dto.Codigo);
            if (existente)
            {
                return (false, $"Já existe um município com o código {dto.Codigo}");
            }
            return (true, string.Empty);
        }

        protected override Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(Municipio entity, MunicipioUpdateDto dto)
        {
            return Task.FromResult((true, string.Empty));
        }

        #region Métodos específicos de Município

        /// <summary>
        /// Obter municípios por UF (método personalizado com paginação)
        /// </summary>
        [HttpGet("por-uf/{uf}")]
        public async Task<ActionResult<PagedResult<MunicipioDto>>> GetMunicipiosPorUf(
            string uf,
            [FromQuery] PaginationRequest? request)
        {
            try
            {
                var cacheKey = $"municipios_uf_{uf.ToUpper()}";
                // Cache completo (sem paginação) atende 90% dos dropdowns
                if (request == null || (request.Page == 1 && request.PageSize == 10))
                {
                    var cached = _cacheService?.Get<PagedResult<MunicipioListDto>>(cacheKey);
                    if (cached != null)
                        return Ok(cached);
                }
                // Se não vier request, retornar TODOS os municípios (para dropdowns/combobox)
                if (request == null || (request.Page == 1 && request.PageSize == 10))
                {
                    var todosMunicipios = await _context.Municipios
                        .Where(m => m.Ativo && m.Uf == uf.ToUpper())
                        .OrderBy(m => m.Nome)
                        .ToListAsync();

                    var result = new PagedResult<MunicipioListDto>
                    {
                        Items = todosMunicipios.Select(EntityToListDto).ToList(),
                        TotalItems = todosMunicipios.Count,
                        Page = 1,
                        PageSize = todosMunicipios.Count,
                        TotalPages = 1,
                        HasNextPage = false,
                        HasPreviousPage = false
                    };

                    _cacheService?.Set(cacheKey, result, TimeSpan.FromHours(6));
                    return Ok(result);
                }

                var query = _context.Municipios
                    .Where(m => m.Ativo && m.Uf == uf.ToUpper())
                    .AsQueryable();

                // Aplicar busca se fornecida
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

                var pagedResult = new PagedResult<MunicipioListDto>
                {
                    Items = items.Select(EntityToListDto).ToList(),
                    TotalItems = totalItems,
                    Page = request.Page,
                    PageSize = request.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalItems / request.PageSize),
                    HasNextPage = request.Page * request.PageSize < totalItems,
                    HasPreviousPage = request.Page > 1
                };

                return Ok(pagedResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter municípios por UF: {UF}", uf);
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obter município por código IBGE
        /// </summary>
        [HttpGet("codigo/{codigo}")]
        public async Task<ActionResult<MunicipioDto>> GetMunicipioByCodigo(int codigo)
        {
            try
            {
                var cacheKey = $"municipio_codigo_{codigo}";
                var cached = _cacheService?.Get<MunicipioDetailDto>(cacheKey);
                if (cached != null)
                    return Ok(cached);

                var municipio = await _context.Municipios
                    .Where(m => m.Ativo)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(m => m.Codigo == codigo);

                if (municipio == null)
                {
                    return NotFound(new { message = "Município não encontrado" });
                }

                var detail = EntityToDetailDto(municipio);
                _cacheService?.Set(cacheKey, detail, TimeSpan.FromHours(12));
                return Ok(detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter município por código: {Codigo}", codigo);
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Importar todos os municípios do IBGE
        /// </summary>
        [HttpPost("importar-todos-ibge")]
        public async Task<ActionResult<ImportResultDto>> ImportarTodosMunicipiosIBGE()
        {
            var stopwatch = Stopwatch.StartNew();
            var resultado = new ImportResultDto { Sucesso = true };

            try
            {
                _logger.LogInformation("Iniciando import completo de municípios do IBGE");

                var municipiosIBGE = await _ibgeService.ImportarTodosMunicipiosAsync();

                if (!municipiosIBGE.Any())
                {
                    resultado.Sucesso = false;
                    resultado.Erros.Add("Não foi possível obter dados do IBGE");
                    return BadRequest(resultado);
                }

                resultado.TotalEstados = municipiosIBGE.Select(m => m.UF).Distinct().Count();

                // Usar a estratégia de execução para suportar retry com transações
                var strategy = _context.Database.CreateExecutionStrategy();
                await strategy.ExecuteAsync(async () =>
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();

                    try
                    {
                        var municipiosExistentes = await _context.Municipios
                            .ToDictionaryAsync(m => m.Codigo, m => m);

                        var municipiosParaInserir = new List<Municipio>();

                        foreach (var municipioIBGE in municipiosIBGE)
                        {
                            if (municipiosExistentes.TryGetValue(municipioIBGE.Id, out var existente))
                            {
                                if (existente.Nome != municipioIBGE.Nome ||
                                    existente.Uf != municipioIBGE.UF ||
                                    !existente.Ativo)
                                {
                                    existente.Nome = municipioIBGE.Nome;
                                    existente.Uf = municipioIBGE.UF;
                                    existente.Ativo = true;
                                    resultado.TotalAtualizados++;
                                }
                                else
                                {
                                    resultado.TotalIgnorados++;
                                }
                            }
                            else
                            {
                                municipiosParaInserir.Add(new Municipio
                                {
                                    Codigo = municipioIBGE.Id,
                                    Nome = municipioIBGE.Nome,
                                    Uf = municipioIBGE.UF,
                                    Ativo = true
                                });
                            }
                        }

                        if (municipiosParaInserir.Any())
                        {
                            await _context.Municipios.AddRangeAsync(municipiosParaInserir);
                            resultado.TotalInseridos = municipiosParaInserir.Count;
                        }

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        _logger.LogInformation("Import concluído: {TotalInseridos} inseridos, {TotalAtualizados} atualizados, {TotalIgnorados} ignorados",
                            resultado.TotalInseridos, resultado.TotalAtualizados, resultado.TotalIgnorados);
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        _logger.LogError(ex, "Erro durante importação de municípios");
                        throw;
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro durante import de municípios");
                resultado.Sucesso = false;
                resultado.Erros.Add($"Erro durante o processamento: {ex.Message}");
                return StatusCode(500, resultado);
            }
            finally
            {
                stopwatch.Stop();
                resultado.TempoProcessamento = stopwatch.Elapsed;
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Obter lista de estados (UFs) distintos - MIGRADO DE LocalidadeController
        /// </summary>
        [HttpGet("estados")]
        public async Task<ActionResult<List<EstadoDto>>> GetEstados()
        {
            try
            {
                var estados = await _context.Municipios
                    .Where(m => m.Ativo)
                    .Select(m => m.Uf)
                    .Distinct()
                    .OrderBy(uf => uf)
                    .Select(uf => new EstadoDto
                    {
                        Sigla = uf,
                        Nome = uf // Pode ser expandido com nomes completos se necessário
                    })
                    .ToListAsync();

                return Ok(estados);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar estados");
                return StatusCode(500, new { message = "Erro interno do servidor" });
            }
        }

        /// <summary>
        /// Buscar código IBGE de um município específico - MIGRADO DE LocalidadeController
        /// </summary>
        [HttpGet("codigo-municipio")]
        public async Task<ActionResult<CodigoMunicipioDto>> GetCodigoMunicipio([FromQuery] string municipio, [FromQuery] string uf)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(municipio) || string.IsNullOrWhiteSpace(uf))
                {
                    return BadRequest(new { message = "Município e UF são obrigatórios" });
                }

                var municipioEncontrado = await _context.Municipios
                    .FirstOrDefaultAsync(m => m.Nome.ToUpper() == municipio.ToUpper() &&
                                            m.Uf.ToUpper() == uf.ToUpper() &&
                                            m.Ativo);

                if (municipioEncontrado == null)
                {
                    return NotFound(new { message = "Município não encontrado" });
                }

                return Ok(new CodigoMunicipioDto
                {
                    Codigo = municipioEncontrado.Codigo,
                    Municipio = municipioEncontrado.Nome,
                    Uf = municipioEncontrado.Uf
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar código do município: {municipio}/{uf}", municipio, uf);
                return StatusCode(500, new { message = "Erro interno do servidor" });
            }
        }

        #endregion
    }

    // DTOs movidos para CommonDTOs.cs para evitar duplicação
}
