using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Interfaces;
using Backend.Api.DTOs;
using Backend.Api.Extensions;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelatorioManutencaoController : ControllerBase
    {
        private readonly SistemaContext _context;
        private readonly ILogger<RelatorioManutencaoController> _logger;
        private readonly IExportService _exportService;

        public RelatorioManutencaoController(SistemaContext context, ILogger<RelatorioManutencaoController> logger, IExportService exportService)
        {
            _context = context;
            _logger = logger;
            _exportService = exportService;
        }

        /// <summary>
        /// Obter relatório de manutenção de veículos com filtros
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PagedResult<RelatorioManutencaoItemDto>>> GetRelatorio([FromQuery] RelatorioManutencaoFiltroDto filtro)
        {
            try
            {
                // Validação de datas
                if (filtro.DataInicio.HasValue && filtro.DataFim.HasValue && filtro.DataFim < filtro.DataInicio)
                {
                    return BadRequest(new { message = "Data fim deve ser maior ou igual à data início" });
                }

                var query = _context.ManutencaoVeiculos
                    .Include(m => m.Veiculo)
                    .Include(m => m.Fornecedor)
                    .Include(m => m.Pecas)
                    .AsQueryable();

                // Aplicar filtros
                if (filtro.DataInicio.HasValue)
                {
                    query = query.Where(m => m.DataManutencao >= filtro.DataInicio.Value);
                }

                if (filtro.DataFim.HasValue)
                {
                    query = query.Where(m => m.DataManutencao <= filtro.DataFim.Value);
                }

                if (!string.IsNullOrWhiteSpace(filtro.Placa))
                {
                    var placaLower = filtro.Placa.ToLower();
                    query = query.Where(m => m.Veiculo != null && m.Veiculo.Placa.ToLower().Contains(placaLower));
                }

                if (!string.IsNullOrWhiteSpace(filtro.Peca))
                {
                    var pecaLower = filtro.Peca.ToLower();
                    query = query.Where(m => m.Pecas.Any(p => p.DescricaoPeca.ToLower().Contains(pecaLower)));
                }

                if (filtro.FornecedorId.HasValue)
                {
                    query = query.Where(m => m.FornecedorId == filtro.FornecedorId.Value);
                }

                // Aplicar ordenação
                query = ApplyOrdering(query, filtro.SortBy, filtro.SortDirection);

                // Aplicar paginação
                var totalItems = await query.CountAsync();
                var items = await query
                    .Skip((filtro.Page - 1) * filtro.PageSize)
                    .Take(filtro.PageSize)
                    .ToListAsync();

                var startItem = totalItems > 0 ? ((filtro.Page - 1) * filtro.PageSize) + 1 : 0;
                var endItem = totalItems > 0 ? Math.Min(filtro.Page * filtro.PageSize, totalItems) : 0;

                var relatorioItems = items.Select(m => new RelatorioManutencaoItemDto
                {
                    Id = m.Id,
                    DataManutencao = m.DataManutencao,
                    VeiculoPlaca = m.Veiculo?.Placa ?? "",
                    VeiculoMarca = m.Veiculo?.Marca ?? "",
                    Descricao = m.Descricao,
                    FornecedorNome = m.Fornecedor?.Nome,
                    ValorMaoObra = m.ValorMaoObra,
                    ValorPecas = m.Pecas?.Sum(p => p.ValorTotal) ?? 0,
                    ValorTotal = m.ValorTotal,
                    Pecas = m.Pecas?.Select(p => new ManutencaoPecaDto
                    {
                        Id = p.Id,
                        ManutencaoId = p.ManutencaoId,
                        DescricaoPeca = p.DescricaoPeca,
                        Quantidade = p.Quantidade,
                        ValorUnitario = p.ValorUnitario,
                        ValorTotal = p.ValorTotal,
                        Unidade = p.Unidade
                    }).ToList() ?? new List<ManutencaoPecaDto>()
                }).ToList();

                var result = new PagedResult<RelatorioManutencaoItemDto>
                {
                    Items = relatorioItems,
                    TotalItems = totalItems,
                    Page = filtro.Page,
                    PageSize = filtro.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalItems / filtro.PageSize),
                    HasNextPage = filtro.Page * filtro.PageSize < totalItems,
                    HasPreviousPage = filtro.Page > 1,
                    StartItem = startItem,
                    EndItem = endItem
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar relatório de manutenção");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obter resumo do relatório de manutenção
        /// </summary>
        [HttpGet("resumo")]
        public async Task<ActionResult<RelatorioManutencaoResumoDto>> GetResumo([FromQuery] RelatorioManutencaoFiltroDto filtro)
        {
            try
            {
                // Validação de datas
                if (filtro.DataInicio.HasValue && filtro.DataFim.HasValue && filtro.DataFim < filtro.DataInicio)
                {
                    return BadRequest(new { message = "Data fim deve ser maior ou igual à data início" });
                }

                var query = _context.ManutencaoVeiculos
                    .Include(m => m.Veiculo)
                    .Include(m => m.Fornecedor)
                    .Include(m => m.Pecas)
                    .AsQueryable();

                // Aplicar filtros (reutilizar lógica do método Get)
                if (filtro.DataInicio.HasValue)
                {
                    query = query.Where(m => m.DataManutencao >= filtro.DataInicio.Value);
                }

                if (filtro.DataFim.HasValue)
                {
                    query = query.Where(m => m.DataManutencao <= filtro.DataFim.Value);
                }

                if (!string.IsNullOrWhiteSpace(filtro.Placa))
                {
                    var placaLower = filtro.Placa.ToLower();
                    query = query.Where(m => m.Veiculo != null && m.Veiculo.Placa.ToLower().Contains(placaLower));
                }

                if (!string.IsNullOrWhiteSpace(filtro.Peca))
                {
                    var pecaLower = filtro.Peca.ToLower();
                    query = query.Where(m => m.Pecas.Any(p => p.DescricaoPeca.ToLower().Contains(pecaLower)));
                }

                if (filtro.FornecedorId.HasValue)
                {
                    query = query.Where(m => m.FornecedorId == filtro.FornecedorId.Value);
                }

                // Calcular apenas totais - NÃO carregar todas as manutenções
                var totalManutencoes = await query.CountAsync();
                var valorTotalMaoObra = await query.SumAsync(m => m.ValorMaoObra);
                var valorTotalPecas = await query
                    .SelectMany(m => m.Pecas)
                    .SumAsync(p => p.ValorTotal);
                var valorTotalGeral = valorTotalMaoObra + valorTotalPecas;

                var resumo = new RelatorioManutencaoResumoDto
                {
                    TotalManutencoes = totalManutencoes,
                    ValorTotalMaoObra = valorTotalMaoObra,
                    ValorTotalPecas = valorTotalPecas,
                    ValorTotalGeral = valorTotalGeral,
                    Manutencoes = new List<RelatorioManutencaoItemDto>() // Lista vazia - não mais necessária
                };

                return Ok(resumo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar resumo do relatório de manutenção");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Exportar relatório para Excel
        /// </summary>
        [HttpGet("export/excel")]
        public async Task<ActionResult> ExportExcel([FromQuery] RelatorioManutencaoFiltroDto filtro)
        {
            try
            {
                _logger.LogInformation("Solicitação de exportação Excel do relatório de manutenção");

                // Validação de datas
                if (filtro.DataInicio.HasValue && filtro.DataFim.HasValue && filtro.DataFim < filtro.DataInicio)
                {
                    return BadRequest(new { message = "Data fim deve ser maior ou igual à data início" });
                }

                var excelBytes = await _exportService.ExportarManutencaoExcelAsync(_context, filtro);
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "relatorio-manutencao.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar relatório de manutenção para Excel");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Exportar relatório para PDF
        /// </summary>
        [HttpGet("export/pdf")]
        public async Task<ActionResult> ExportPdf([FromQuery] RelatorioManutencaoFiltroDto filtro)
        {
            try
            {
                _logger.LogInformation("Solicitação de exportação PDF do relatório de manutenção");

                // Validação de datas
                if (filtro.DataInicio.HasValue && filtro.DataFim.HasValue && filtro.DataFim < filtro.DataInicio)
                {
                    return BadRequest(new { message = "Data fim deve ser maior ou igual à data início" });
                }

                var pdfBytes = await _exportService.ExportarManutencaoPdfAsync(_context, filtro);
                return File(pdfBytes, "application/pdf", "relatorio-manutencao.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar relatório de manutenção para PDF");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        private IQueryable<Models.ManutencaoVeiculo> ApplyOrdering(IQueryable<Models.ManutencaoVeiculo> query, string? sortBy, string? sortDirection)
        {
            var isAscending = sortDirection?.ToLower() != "desc";

            return sortBy?.ToLower() switch
            {
                "datamanutencao" => isAscending ? query.OrderBy(m => m.DataManutencao) : query.OrderByDescending(m => m.DataManutencao),
                "placa" => isAscending ? query.OrderBy(m => m.Veiculo!.Placa) : query.OrderByDescending(m => m.Veiculo!.Placa),
                "fornecedor" => isAscending ? query.OrderBy(m => m.Fornecedor!.Nome) : query.OrderByDescending(m => m.Fornecedor!.Nome),
                // Ordenação por valor de mão de obra (não podemos somar peças no EF)
                "valor" => isAscending ? query.OrderBy(m => m.ValorMaoObra) : query.OrderByDescending(m => m.ValorMaoObra),
                _ => query.OrderByDescending(m => m.DataManutencao)
            };
        }
    }
}
