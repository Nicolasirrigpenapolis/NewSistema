using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Controllers;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Models;
using Backend.Api.Services;

namespace Backend.Api.Controllers
{
    [Route("api/[controller]")]
    public class ViagemController : BaseController<Viagem, ViagemListDto, ViagemDetailDto, ViagemCreateDto, ViagemUpdateDto>
    {
        public ViagemController(SistemaContext context, ILogger<ViagemController> logger, ICacheService? cacheService = null)
            : base(context, logger, cacheService)
        {
        }

        protected override DbSet<Viagem> GetDbSet()
        {
            return _context.Viagens;
        }

        protected override ViagemListDto EntityToListDto(Viagem entity)
        {
            return new ViagemListDto
            {
                Id = entity.Id,
                VeiculoId = entity.VeiculoId,
                VeiculoPlaca = entity.Veiculo?.Placa ?? "",
                VeiculoMarca = entity.Veiculo?.Marca ?? "",
                CondutorId = entity.CondutorId,
                CondutorNome = entity.Condutor?.Nome,
                DataInicio = entity.DataInicio,
                DataFim = entity.DataFim,
                DuracaoDias = entity.DuracaoDias,
                KmInicial = entity.KmInicial,
                KmFinal = entity.KmFinal,
                KmPercorrido = entity.KmPercorrido,
                ReceitaTotal = entity.ReceitaTotal,  // ✅ Calculated by backend
                TotalDespesas = entity.TotalDespesas,  // ✅ Calculated by backend
                SaldoLiquido = entity.SaldoLiquido,  // ✅ Calculated by backend
                OrigemDestino = entity.OrigemDestino,
                DataCriacao = entity.DataCriacao
            };
        }

        protected override ViagemDetailDto EntityToDetailDto(Viagem entity)
        {
            var listDto = EntityToListDto(entity);

            return new ViagemDetailDto
            {
                Id = listDto.Id,
                VeiculoId = listDto.VeiculoId,
                VeiculoPlaca = listDto.VeiculoPlaca,
                VeiculoMarca = listDto.VeiculoMarca,
                CondutorId = listDto.CondutorId,
                CondutorNome = listDto.CondutorNome,
                DataInicio = listDto.DataInicio,
                DataFim = listDto.DataFim,
                DuracaoDias = listDto.DuracaoDias,
                KmInicial = listDto.KmInicial,
                KmFinal = listDto.KmFinal,
                KmPercorrido = listDto.KmPercorrido,
                ReceitaTotal = listDto.ReceitaTotal,
                TotalDespesas = listDto.TotalDespesas,
                SaldoLiquido = listDto.SaldoLiquido,
                OrigemDestino = listDto.OrigemDestino,
                DataCriacao = listDto.DataCriacao,
                Observacoes = entity.Observacoes,
                DataUltimaAlteracao = entity.DataUltimaAlteracao,
                Despesas = entity.Despesas?.Select(d => new DespesaViagemDto
                {
                    Id = d.Id,
                    ViagemId = d.ViagemId,
                    TipoDespesa = d.TipoDespesa,
                    Descricao = d.Descricao,
                    Valor = d.Valor,
                    DataDespesa = d.DataDespesa,
                    Local = d.Local,
                    Observacoes = d.Observacoes
                }).ToList() ?? new List<DespesaViagemDto>(),
                Receitas = entity.Receitas?.Select(r => new ReceitaViagemDto
                {
                    Id = r.Id,
                    ViagemId = r.ViagemId,
                    Descricao = r.Descricao,
                    Valor = r.Valor,
                    DataReceita = r.DataReceita,
                    Origem = r.Origem,
                    Observacoes = r.Observacoes
                }).ToList() ?? new List<ReceitaViagemDto>()
            };
        }

        protected override Viagem CreateDtoToEntity(ViagemCreateDto dto)
        {
            var entity = new Viagem
            {
                VeiculoId = dto.VeiculoId,
                CondutorId = dto.CondutorId,
                DataInicio = dto.DataInicio,
                DataFim = dto.DataFim,
                KmInicial = dto.KmInicial,
                KmFinal = dto.KmFinal,
                OrigemDestino = dto.OrigemDestino,
                Observacoes = dto.Observacoes,
                Ativo = true,
                DataCriacao = DateTime.Now
                // ✅ ReceitaTotal NÃO é aceito do frontend - é calculado!
            };

            // Adicionar despesas
            if (dto.Despesas?.Any() == true)
            {
                entity.Despesas = dto.Despesas.Select(d => new DespesaViagem
                {
                    TipoDespesa = d.TipoDespesa,
                    Descricao = d.Descricao,
                    Valor = d.Valor,
                    DataDespesa = d.DataDespesa,
                    Local = d.Local,
                    Observacoes = d.Observacoes,
                    DataCriacao = DateTime.Now
                }).ToList();
            }

            // Adicionar receitas
            if (dto.Receitas?.Any() == true)
            {
                entity.Receitas = dto.Receitas.Select(r => new ReceitaViagem
                {
                    Descricao = r.Descricao,
                    Valor = r.Valor,
                    DataReceita = r.DataReceita,
                    Origem = r.Origem,
                    Observacoes = r.Observacoes,
                    DataCriacao = DateTime.Now
                }).ToList();
            }

            return entity;
        }

        protected override void UpdateEntityFromDto(Viagem entity, ViagemUpdateDto dto)
        {
            entity.VeiculoId = dto.VeiculoId;
            entity.CondutorId = dto.CondutorId;
            entity.DataInicio = dto.DataInicio;
            entity.DataFim = dto.DataFim;
            entity.KmInicial = dto.KmInicial;
            entity.KmFinal = dto.KmFinal;
            entity.OrigemDestino = dto.OrigemDestino;
            entity.Observacoes = dto.Observacoes;
            entity.Ativo = dto.Ativo;
            entity.DataUltimaAlteracao = DateTime.Now;
            // ✅ ReceitaTotal NÃO é aceito do frontend - é calculado!

            // Atualizar despesas (remover existentes e adicionar novas)
            if (entity.Despesas?.Any() == true)
            {
                _context.DespesasViagem.RemoveRange(entity.Despesas);
            }

            if (dto.Despesas?.Any() == true)
            {
                entity.Despesas = dto.Despesas.Select(d => new DespesaViagem
                {
                    ViagemId = entity.Id,
                    TipoDespesa = d.TipoDespesa,
                    Descricao = d.Descricao,
                    Valor = d.Valor,
                    DataDespesa = d.DataDespesa,
                    Local = d.Local,
                    Observacoes = d.Observacoes,
                    DataCriacao = DateTime.Now
                }).ToList();
            }

            // Atualizar receitas (remover existentes e adicionar novas)
            if (entity.Receitas?.Any() == true)
            {
                _context.ReceitasViagem.RemoveRange(entity.Receitas);
            }

            if (dto.Receitas?.Any() == true)
            {
                entity.Receitas = dto.Receitas.Select(r => new ReceitaViagem
                {
                    ViagemId = entity.Id,
                    Descricao = r.Descricao,
                    Valor = r.Valor,
                    DataReceita = r.DataReceita,
                    Origem = r.Origem,
                    Observacoes = r.Observacoes,
                    DataCriacao = DateTime.Now
                }).ToList();
            }
        }

        protected override IQueryable<Viagem> ApplySearchFilter(IQueryable<Viagem> query, string search)
        {
            if (string.IsNullOrWhiteSpace(search))
                return query;

            var searchLower = search.ToLower();
            return query.Where(v =>
                (v.OrigemDestino != null && v.OrigemDestino.ToLower().Contains(searchLower)) ||
                (v.Veiculo != null && v.Veiculo.Placa.ToLower().Contains(searchLower)) ||
                v.Despesas.Any(d => d.TipoDespesa.ToLower().Contains(searchLower) ||
                                   d.Descricao.ToLower().Contains(searchLower))
            );
        }

        protected override IQueryable<Viagem> ApplyOrdering(IQueryable<Viagem> query, string? sortBy, string? sortDirection)
        {
            var isAscending = sortDirection?.ToLower() != "desc";

            return sortBy?.ToLower() switch
            {
                "datainicio" => isAscending ? query.OrderBy(v => v.DataInicio) : query.OrderByDescending(v => v.DataInicio),
                "datafim" => isAscending ? query.OrderBy(v => v.DataFim) : query.OrderByDescending(v => v.DataFim),
                "placa" => isAscending ? query.OrderBy(v => v.Veiculo!.Placa) : query.OrderByDescending(v => v.Veiculo!.Placa),
                "receita" => isAscending ? query.OrderBy(v => v.ReceitaTotal) : query.OrderByDescending(v => v.ReceitaTotal),
                "saldo" => isAscending ? query.OrderBy(v => v.ReceitaTotal - v.Despesas.Sum(d => d.Valor)) : query.OrderByDescending(v => v.ReceitaTotal - v.Despesas.Sum(d => d.Valor)),
                "datacriacao" => isAscending ? query.OrderBy(v => v.DataCriacao) : query.OrderByDescending(v => v.DataCriacao),
                _ => query.OrderByDescending(v => v.DataInicio)
            };
        }

        protected override async Task<(bool canDelete, string errorMessage)> CanDeleteAsync(Viagem entity)
        {
            // Viagens podem sempre ser excluídas
            return await Task.FromResult((true, string.Empty));
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateCreateAsync(ViagemCreateDto dto)
        {
            // Verificar se veículo existe
            var veiculoExists = await _context.Veiculos
                .AnyAsync(v => v.Id == dto.VeiculoId);

            if (!veiculoExists)
            {
                return (false, "Veículo não encontrado");
            }

            // Verificar se data fim é posterior à data início
            if (dto.DataFim < dto.DataInicio)
            {
                return (false, "Data de fim deve ser posterior à data de início");
            }

            // Verificar se o período não conflita com outras viagens do mesmo veículo
            // Permite que uma viagem comece no dia seguinte ao fim de outra (< em vez de <=)
            var conflictingViagem = await _context.Viagens
                .AnyAsync(v => v.VeiculoId == dto.VeiculoId &&
                              ((dto.DataInicio >= v.DataInicio && dto.DataInicio < v.DataFim) ||
                               (dto.DataFim > v.DataInicio && dto.DataFim <= v.DataFim) ||
                               (dto.DataInicio < v.DataInicio && dto.DataFim > v.DataFim)));

            if (conflictingViagem)
            {
                return (false, "Já existe uma viagem para este veículo no período informado");
            }

            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(Viagem entity, ViagemUpdateDto dto)
        {
            // Verificar se veículo existe
            var veiculoExists = await _context.Veiculos
                .AnyAsync(v => v.Id == dto.VeiculoId);

            if (!veiculoExists)
            {
                return (false, "Veículo não encontrado");
            }

            // Verificar se data fim é posterior à data início
            if (dto.DataFim < dto.DataInicio)
            {
                return (false, "Data de fim deve ser posterior à data de início");
            }

            // Verificar se o período não conflita com outras viagens do mesmo veículo (exceto a atual)
            // Permite que uma viagem comece no dia seguinte ao fim de outra (< em vez de <=)
            var conflictingViagem = await _context.Viagens
                .AnyAsync(v => v.Id != entity.Id && v.VeiculoId == dto.VeiculoId &&
                              ((dto.DataInicio >= v.DataInicio && dto.DataInicio < v.DataFim) ||
                               (dto.DataFim > v.DataInicio && dto.DataFim <= v.DataFim) ||
                               (dto.DataInicio < v.DataInicio && dto.DataFim > v.DataFim)));

            if (conflictingViagem)
            {
                return (false, "Já existe uma viagem para este veículo no período informado");
            }

            return (true, string.Empty);
        }

        // Incluir relacionamentos no GetById
        public override async Task<ActionResult<ViagemDetailDto>> GetById(int id)
        {
            try
            {
                var entity = await GetDbSet()
                    .Include(v => v.Veiculo)
                    .Include(v => v.Condutor)
                    .Include(v => v.Despesas)
                    .Include(v => v.Receitas)
                    .FirstOrDefaultAsync(v => v.Id == id);

                if (entity == null || !IsEntityActive(entity))
                {
                    return NotFound(new { message = "Registro não encontrado" });
                }

                var dto = EntityToDetailDto(entity);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter viagem por ID: {Id}", id);
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        // Override do Get para incluir relacionamentos
        public override async Task<ActionResult<PagedResult<ViagemListDto>>> Get([FromQuery] PaginationRequest request)
        {
            try
            {
                var query = GetDbSet()
                    .Include(v => v.Veiculo)
                    .Include(v => v.Condutor)
                    .Include(v => v.Despesas)
                    .Include(v => v.Receitas)
                    .AsQueryable();

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

                var startItem = totalItems > 0 ? ((request.Page - 1) * request.PageSize) + 1 : 0;
                var endItem = totalItems > 0 ? Math.Min(request.Page * request.PageSize, totalItems) : 0;

                var result = new PagedResult<ViagemListDto>
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
                _logger.LogError(ex, "Erro ao obter lista paginada de viagens");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }
    }
}
