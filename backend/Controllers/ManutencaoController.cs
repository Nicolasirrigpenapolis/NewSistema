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
    public class ManutencaoController : BaseController<ManutencaoVeiculo, ManutencaoVeiculoListDto, ManutencaoVeiculoDetailDto, ManutencaoVeiculoCreateDto, ManutencaoVeiculoUpdateDto>
    {
        public ManutencaoController(SistemaContext context, ILogger<ManutencaoController> logger, ICacheService? cacheService = null)
            : base(context, logger, cacheService)
        {
        }

        protected override DbSet<ManutencaoVeiculo> GetDbSet()
        {
            return _context.ManutencaoVeiculos;
        }

        protected override ManutencaoVeiculoListDto EntityToListDto(ManutencaoVeiculo entity)
        {
            return new ManutencaoVeiculoListDto
            {
                Id = entity.Id,
                VeiculoId = entity.VeiculoId,
                VeiculoPlaca = entity.Veiculo?.Placa ?? "",
                VeiculoMarca = entity.Veiculo?.Marca ?? "",
                VeiculoDescricao = entity.Veiculo != null
                    ? $"{entity.Veiculo.Placa ?? ""}{(!string.IsNullOrWhiteSpace(entity.Veiculo.Marca) ? $" - {entity.Veiculo.Marca}" : "")}"
                    : "",
                DataManutencao = entity.DataManutencao,
                Descricao = entity.Descricao,
                FornecedorId = entity.FornecedorId,
                FornecedorNome = entity.Fornecedor?.Nome,
                ValorMaoObra = entity.ValorMaoObra,
                ValorPecas = entity.Pecas?.Sum(p => p.ValorTotal) ?? 0,
                ValorTotal = entity.ValorTotal,
                DataCriacao = entity.DataCriacao
            };
        }

        protected override ManutencaoVeiculoDetailDto EntityToDetailDto(ManutencaoVeiculo entity)
        {
            var listDto = EntityToListDto(entity);

            return new ManutencaoVeiculoDetailDto
            {
                Id = listDto.Id,
                VeiculoId = listDto.VeiculoId,
                VeiculoPlaca = listDto.VeiculoPlaca,
                VeiculoMarca = listDto.VeiculoMarca,
                DataManutencao = listDto.DataManutencao,
                Descricao = listDto.Descricao,
                FornecedorId = listDto.FornecedorId,
                FornecedorNome = listDto.FornecedorNome,
                ValorMaoObra = listDto.ValorMaoObra,
                ValorPecas = listDto.ValorPecas,
                ValorTotal = listDto.ValorTotal,
                DataCriacao = listDto.DataCriacao,
                Observacoes = entity.Observacoes,
                DataUltimaAlteracao = entity.DataUltimaAlteracao,
                Pecas = entity.Pecas?.Select(p => new ManutencaoPecaDto
                {
                    Id = p.Id,
                    ManutencaoId = p.ManutencaoId,
                    DescricaoPeca = p.DescricaoPeca,
                    Quantidade = p.Quantidade,
                    ValorUnitario = p.ValorUnitario,
                    ValorTotal = p.ValorTotal,
                    Unidade = p.Unidade
                }).ToList() ?? new List<ManutencaoPecaDto>()
            };
        }

        protected override ManutencaoVeiculo CreateDtoToEntity(ManutencaoVeiculoCreateDto dto)
        {
            var entity = new ManutencaoVeiculo
            {
                VeiculoId = dto.VeiculoId,
                DataManutencao = dto.DataManutencao,
                Descricao = dto.Descricao,
                FornecedorId = dto.FornecedorId,
                ValorMaoObra = dto.ValorMaoObra,
                Observacoes = dto.Observacoes,
                Ativo = true,
                DataCriacao = DateTime.Now
            };

            // Adicionar peças
            if (dto.Pecas?.Any() == true)
            {
                entity.Pecas = dto.Pecas.Select(p => new ManutencaoPeca
                {
                    DescricaoPeca = p.DescricaoPeca,
                    Quantidade = p.Quantidade,
                    ValorUnitario = p.ValorUnitario,
                    Unidade = p.Unidade,
                    DataCriacao = DateTime.Now
                }).ToList();
            }

            return entity;
        }

        protected override void UpdateEntityFromDto(ManutencaoVeiculo entity, ManutencaoVeiculoUpdateDto dto)
        {
            entity.VeiculoId = dto.VeiculoId;
            entity.DataManutencao = dto.DataManutencao;
            entity.Descricao = dto.Descricao;
            entity.FornecedorId = dto.FornecedorId;
            entity.ValorMaoObra = dto.ValorMaoObra;
            entity.Observacoes = dto.Observacoes;
            entity.Ativo = dto.Ativo;
            entity.DataUltimaAlteracao = DateTime.Now;

            // Atualizar peças (remover existentes e adicionar novas)
            if (entity.Pecas?.Any() == true)
            {
                _context.ManutencaoPecas.RemoveRange(entity.Pecas);
            }

            if (dto.Pecas?.Any() == true)
            {
                entity.Pecas = dto.Pecas.Select(p => new ManutencaoPeca
                {
                    ManutencaoId = entity.Id,
                    DescricaoPeca = p.DescricaoPeca,
                    Quantidade = p.Quantidade,
                    ValorUnitario = p.ValorUnitario,
                    Unidade = p.Unidade,
                    DataCriacao = DateTime.Now
                }).ToList();
            }
        }

        protected override IQueryable<ManutencaoVeiculo> ApplySearchFilter(IQueryable<ManutencaoVeiculo> query, string search)
        {
            if (string.IsNullOrWhiteSpace(search))
                return query;

            var searchLower = search.ToLower();
            return query.Where(m =>
                m.Descricao.ToLower().Contains(searchLower) ||
                (m.Veiculo != null && m.Veiculo.Placa.ToLower().Contains(searchLower)) ||
                (m.Fornecedor != null && m.Fornecedor.Nome.ToLower().Contains(searchLower)) ||
                m.Pecas.Any(p => p.DescricaoPeca.ToLower().Contains(searchLower))
            );
        }

        protected override IQueryable<ManutencaoVeiculo> ApplyOrdering(IQueryable<ManutencaoVeiculo> query, string? sortBy, string? sortDirection)
        {
            var isAscending = sortDirection?.ToLower() != "desc";

            return sortBy?.ToLower() switch
            {
                "datamanutencao" => isAscending ? query.OrderBy(m => m.DataManutencao) : query.OrderByDescending(m => m.DataManutencao),
                "placa" => isAscending ? query.OrderBy(m => m.Veiculo!.Placa) : query.OrderByDescending(m => m.Veiculo!.Placa),
                "fornecedor" => isAscending ? query.OrderBy(m => m.Fornecedor!.Nome) : query.OrderByDescending(m => m.Fornecedor!.Nome),
                "valor" => isAscending ? query.OrderBy(m => m.ValorMaoObra) : query.OrderByDescending(m => m.ValorMaoObra),
                "datacriacao" => isAscending ? query.OrderBy(m => m.DataCriacao) : query.OrderByDescending(m => m.DataCriacao),
                _ => query.OrderByDescending(m => m.DataManutencao)
            };
        }

        protected override async Task<(bool canDelete, string errorMessage)> CanDeleteAsync(ManutencaoVeiculo entity)
        {
            // Manutenções podem sempre ser excluídas
            return await Task.FromResult((true, string.Empty));
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateCreateAsync(ManutencaoVeiculoCreateDto dto)
        {
            // Verificar se veículo existe
            var veiculoExiste = await _context.Veiculos.AnyAsync(v => v.Id == dto.VeiculoId);
            if (!veiculoExiste)
            {
                _logger.LogWarning("Veículo com ID {VeiculoId} não existe no banco de dados", dto.VeiculoId);
                return (false, $"Veículo com ID {dto.VeiculoId} não encontrado. Por favor, selecione um veículo válido.");
            }

            // Verificar se veículo está ativo
            var veiculoAtivo = await _context.Veiculos
                .AnyAsync(v => v.Id == dto.VeiculoId && v.Ativo);

            if (!veiculoAtivo)
            {
                _logger.LogWarning("Veículo com ID {VeiculoId} existe mas está inativo", dto.VeiculoId);
                return (false, "O veículo selecionado está inativo. Por favor, ative o veículo ou selecione outro.");
            }

            // Verificar se fornecedor existe e está ativo (se informado)
            if (dto.FornecedorId.HasValue)
            {
                var fornecedorExiste = await _context.Fornecedores
                    .AnyAsync(f => f.Id == dto.FornecedorId.Value);

                if (!fornecedorExiste)
                {
                    _logger.LogWarning("Fornecedor com ID {FornecedorId} não existe no banco de dados", dto.FornecedorId.Value);
                    return (false, $"Fornecedor com ID {dto.FornecedorId.Value} não encontrado. Por favor, selecione um fornecedor válido.");
                }

                var fornecedorAtivo = await _context.Fornecedores
                    .AnyAsync(f => f.Id == dto.FornecedorId.Value && f.Ativo);

                if (!fornecedorAtivo)
                {
                    _logger.LogWarning("Fornecedor com ID {FornecedorId} existe mas está inativo", dto.FornecedorId.Value);
                    return (false, "O fornecedor selecionado está inativo. Por favor, ative o fornecedor ou selecione outro.");
                }
            }

            return (true, string.Empty);
        }

        protected override async Task<(bool isValid, string errorMessage)> ValidateUpdateAsync(ManutencaoVeiculo entity, ManutencaoVeiculoUpdateDto dto)
        {
            return await ValidateCreateAsync(dto);
        }

        // Incluir relacionamentos no GetById
        public override async Task<ActionResult<ManutencaoVeiculoDetailDto>> GetById(int id)
        {
            try
            {
                var entity = await GetDbSet()
                    .Include(m => m.Veiculo)
                    .Include(m => m.Fornecedor)
                    .Include(m => m.Pecas)
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (entity == null || !IsEntityActive(entity))
                {
                    return NotFound(new { message = "Registro não encontrado" });
                }

                var dto = EntityToDetailDto(entity);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter manutenção por ID: {Id}", id);
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        // Override do Get para incluir relacionamentos
        public override async Task<ActionResult<PagedResult<ManutencaoVeiculoListDto>>> Get([FromQuery] PaginationRequest request)
        {
            try
            {
                var query = GetDbSet()
                    .Include(m => m.Veiculo)
                    .Include(m => m.Fornecedor)
                    .Include(m => m.Pecas)
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

                var result = new PagedResult<ManutencaoVeiculoListDto>
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
                _logger.LogError(ex, "Erro ao obter lista paginada de manutenções");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }
    }
}
