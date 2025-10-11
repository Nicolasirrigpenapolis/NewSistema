using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Extensions;
using Backend.Api.Interfaces;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelatorioDespesasController : ControllerBase
    {
        private readonly SistemaContext _context;
        private readonly ILogger<RelatorioDespesasController> _logger;
        private readonly IExportService _exportService;

        public RelatorioDespesasController(SistemaContext context, ILogger<RelatorioDespesasController> logger, IExportService exportService)
        {
            _context = context;
            _logger = logger;
            _exportService = exportService;
        }

        /// <summary>
        /// Obter relatório de despesas e receitas de viagens com filtros
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PagedResult<RelatorioDespesasItemDto>>> GetRelatorio([FromQuery] RelatorioDespesasFiltroDto filtro)
        {
            try
            {
                // Validação de datas
                if (filtro.DataInicio.HasValue && filtro.DataFim.HasValue && filtro.DataFim < filtro.DataInicio)
                {
                    return BadRequest(new { message = "Data fim deve ser maior ou igual à data início" });
                }

                var query = _context.Viagens
                    .Include(v => v.Veiculo)
                    .Include(v => v.Despesas)
                    .AsQueryable();

                // Aplicar filtros
                if (filtro.DataInicio.HasValue)
                {
                    query = query.Where(v => v.DataInicio >= filtro.DataInicio.Value);
                }

                if (filtro.DataFim.HasValue)
                {
                    query = query.Where(v => v.DataFim <= filtro.DataFim.Value);
                }

                if (!string.IsNullOrWhiteSpace(filtro.Placa))
                {
                    var placaLower = filtro.Placa.ToLower();
                    query = query.Where(v => v.Veiculo != null && v.Veiculo.Placa.ToLower().Contains(placaLower));
                }

                if (!string.IsNullOrWhiteSpace(filtro.TipoDespesa))
                {
                    var tipoDespesaLower = filtro.TipoDespesa.ToLower();
                    query = query.Where(v => v.Despesas.Any(d => d.TipoDespesa.ToLower().Contains(tipoDespesaLower)));
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

                var relatorioItems = items.Select(v => new RelatorioDespesasItemDto
                {
                    Id = v.Id,
                    VeiculoPlaca = v.Veiculo?.Placa ?? "",
                    VeiculoMarca = v.Veiculo?.Marca ?? "",
                    DataInicio = v.DataInicio,
                    DataFim = v.DataFim,
                    DuracaoDias = v.DuracaoDias,
                    OrigemDestino = v.OrigemDestino,
                    ReceitaTotal = v.ReceitaTotal,
                    TotalDespesas = v.TotalDespesas,
                    SaldoLiquido = v.SaldoLiquido,
                    Despesas = v.Despesas?.Select(d => new DespesaViagemDto
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
                    DespesasPorTipo = v.Despesas?
                        .GroupBy(d => d.TipoDespesa)
                        .ToDictionary(g => g.Key, g => g.Sum(d => d.Valor)) ?? new Dictionary<string, decimal>()
                }).ToList();

                var result = new PagedResult<RelatorioDespesasItemDto>
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
                _logger.LogError(ex, "Erro ao gerar relatório de despesas");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obter resumo do relatório de despesas e receitas
        /// </summary>
        [HttpGet("resumo")]
        public async Task<ActionResult<RelatorioDespesasResumoDto>> GetResumo([FromQuery] RelatorioDespesasFiltroDto filtro)
        {
            try
            {
                // Validação de datas
                if (filtro.DataInicio.HasValue && filtro.DataFim.HasValue && filtro.DataFim < filtro.DataInicio)
                {
                    return BadRequest(new { message = "Data fim deve ser maior ou igual à data início" });
                }

                var query = _context.Viagens
                    .Include(v => v.Veiculo)
                    .Include(v => v.Despesas)
                    .AsQueryable();

                // Aplicar filtros (reutilizar lógica do método Get)
                if (filtro.DataInicio.HasValue)
                {
                    query = query.Where(v => v.DataInicio >= filtro.DataInicio.Value);
                }

                if (filtro.DataFim.HasValue)
                {
                    query = query.Where(v => v.DataFim <= filtro.DataFim.Value);
                }

                if (!string.IsNullOrWhiteSpace(filtro.Placa))
                {
                    var placaLower = filtro.Placa.ToLower();
                    query = query.Where(v => v.Veiculo != null && v.Veiculo.Placa.ToLower().Contains(placaLower));
                }

                if (!string.IsNullOrWhiteSpace(filtro.TipoDespesa))
                {
                    var tipoDespesaLower = filtro.TipoDespesa.ToLower();
                    query = query.Where(v => v.Despesas.Any(d => d.TipoDespesa.ToLower().Contains(tipoDespesaLower)));
                }

                // Calcular apenas totais - NÃO carregar todas as viagens
                var totalViagens = await query.CountAsync();
                var receitaTotalGeral = await query.SumAsync(v => v.ReceitaTotal);
                var despesaTotalGeral = await query
                    .SelectMany(v => v.Despesas)
                    .SumAsync(d => d.Valor);
                var saldoLiquidoGeral = receitaTotalGeral - despesaTotalGeral;

                // Calcular despesas por tipo
                var despesasPorTipo = await query
                    .SelectMany(v => v.Despesas)
                    .GroupBy(d => d.TipoDespesa)
                    .Select(g => new { TipoDespesa = g.Key, Total = g.Sum(d => d.Valor) })
                    .ToDictionaryAsync(g => g.TipoDespesa, g => g.Total);

                var resumo = new RelatorioDespesasResumoDto
                {
                    TotalViagens = totalViagens,
                    ReceitaTotalGeral = receitaTotalGeral,
                    DespesaTotalGeral = despesaTotalGeral,
                    SaldoLiquidoGeral = saldoLiquidoGeral,
                    DespesasPorTipo = despesasPorTipo,
                    Viagens = new List<RelatorioDespesasItemDto>() // Lista vazia - não mais necessária
                };

                return Ok(resumo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar resumo do relatório de despesas");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obter estatísticas por tipo de despesa
        /// </summary>
        [HttpGet("estatisticas")]
        public async Task<ActionResult<Dictionary<string, object>>> GetEstatisticas([FromQuery] RelatorioDespesasFiltroDto filtro)
        {
            try
            {
                var query = _context.Viagens
                    .Include(v => v.Veiculo)
                    .Include(v => v.Despesas)
                    .AsQueryable();

                // Aplicar filtros
                if (filtro.DataInicio.HasValue)
                {
                    query = query.Where(v => v.DataInicio >= filtro.DataInicio.Value);
                }

                if (filtro.DataFim.HasValue)
                {
                    query = query.Where(v => v.DataFim <= filtro.DataFim.Value);
                }

                if (!string.IsNullOrWhiteSpace(filtro.Placa))
                {
                    var placaLower = filtro.Placa.ToLower();
                    query = query.Where(v => v.Veiculo != null && v.Veiculo.Placa.ToLower().Contains(placaLower));
                }

                // Estatísticas detalhadas
                var estatisticas = new Dictionary<string, object>();

                // Despesas por tipo com percentuais
                var despesasPorTipo = await query
                    .SelectMany(v => v.Despesas)
                    .GroupBy(d => d.TipoDespesa)
                    .Select(g => new {
                        TipoDespesa = g.Key,
                        Total = g.Sum(d => d.Valor),
                        Quantidade = g.Count(),
                        Media = g.Average(d => d.Valor)
                    })
                    .ToListAsync();

                var totalGeral = despesasPorTipo.Sum(d => d.Total);

                estatisticas["despesasPorTipo"] = despesasPorTipo.Select(d => new
                {
                    tipo = d.TipoDespesa,
                    total = d.Total,
                    quantidade = d.Quantidade,
                    media = Math.Round(d.Media, 2),
                    percentual = totalGeral > 0 ? Math.Round((d.Total / totalGeral) * 100, 2) : 0
                });

                // Veículos com maior gasto
                var veiculosMaiorGasto = await query
                    .GroupBy(v => new { v.VeiculoId, v.Veiculo!.Placa, v.Veiculo.Marca })
                    .Select(g => new
                    {
                        placa = g.Key.Placa,
                        marca = g.Key.Marca,
                        totalViagens = g.Count(),
                        receitaTotal = g.Sum(v => v.ReceitaTotal),
                        despesaTotal = g.Sum(v => v.Despesas.Sum(d => d.Valor)),
                        saldoLiquido = g.Sum(v => v.ReceitaTotal) - g.Sum(v => v.Despesas.Sum(d => d.Valor))
                    })
                    .OrderByDescending(v => v.despesaTotal)
                    .Take(10)
                    .ToListAsync();

                estatisticas["veiculosMaiorGasto"] = veiculosMaiorGasto;

                // Tendência mensal (últimos 12 meses)
                var dataLimite = DateTime.Now.AddMonths(-12);
                var tendenciaMensal = await _context.Viagens
                    .Include(v => v.Despesas)
                    .Where(v => v.DataInicio >= dataLimite)
                    .GroupBy(v => new { v.DataInicio.Year, v.DataInicio.Month })
                    .Select(g => new
                    {
                        ano = g.Key.Year,
                        mes = g.Key.Month,
                        totalViagens = g.Count(),
                        receitaTotal = g.Sum(v => v.ReceitaTotal),
                        despesaTotal = g.Sum(v => v.Despesas.Sum(d => d.Valor)),
                        saldoLiquido = g.Sum(v => v.ReceitaTotal) - g.Sum(v => v.Despesas.Sum(d => d.Valor))
                    })
                    .OrderBy(g => g.ano).ThenBy(g => g.mes)
                    .ToListAsync();

                estatisticas["tendenciaMensal"] = tendenciaMensal;

                return Ok(estatisticas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar estatísticas de despesas");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Exportar relatório para Excel
        /// </summary>
        [HttpGet("export/excel")]
        public async Task<ActionResult> ExportExcel([FromQuery] RelatorioDespesasFiltroDto filtro)
        {
            try
            {
                _logger.LogInformation("Solicitação de exportação Excel do relatório de despesas");

                // Validação de datas
                if (filtro.DataInicio.HasValue && filtro.DataFim.HasValue && filtro.DataFim < filtro.DataInicio)
                {
                    return BadRequest(new { message = "Data fim deve ser maior ou igual à data início" });
                }

                var excelBytes = await _exportService.ExportarDespesasExcelAsync(_context, filtro);
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "relatorio-despesas-viagens.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar relatório de despesas para Excel");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Exportar relatório para PDF
        /// </summary>
        [HttpGet("export/pdf")]
        public async Task<ActionResult> ExportPdf([FromQuery] RelatorioDespesasFiltroDto filtro)
        {
            try
            {
                _logger.LogInformation("Solicitação de exportação PDF do relatório de despesas");

                // Validação de datas
                if (filtro.DataInicio.HasValue && filtro.DataFim.HasValue && filtro.DataFim < filtro.DataInicio)
                {
                    return BadRequest(new { message = "Data fim deve ser maior ou igual à data início" });
                }

                var pdfBytes = await _exportService.ExportarDespesasPdfAsync(_context, filtro);
                return File(pdfBytes, "application/pdf", "relatorio-despesas-viagens.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar relatório de despesas para PDF");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        private IQueryable<Models.Viagem> ApplyOrdering(IQueryable<Models.Viagem> query, string? sortBy, string? sortDirection)
        {
            var isAscending = sortDirection?.ToLower() != "desc";

            return sortBy?.ToLower() switch
            {
                "datainicio" => isAscending ? query.OrderBy(v => v.DataInicio) : query.OrderByDescending(v => v.DataInicio),
                "datafim" => isAscending ? query.OrderBy(v => v.DataFim) : query.OrderByDescending(v => v.DataFim),
                "placa" => isAscending ? query.OrderBy(v => v.Veiculo!.Placa) : query.OrderByDescending(v => v.Veiculo!.Placa),
                "receita" => isAscending ? query.OrderBy(v => v.ReceitaTotal) : query.OrderByDescending(v => v.ReceitaTotal),
                // Ordenação por receita já que não podemos somar despesas no EF
                "despesa" => isAscending ? query.OrderBy(v => v.ReceitaTotal) : query.OrderByDescending(v => v.ReceitaTotal),
                "saldo" => isAscending ? query.OrderBy(v => v.ReceitaTotal) : query.OrderByDescending(v => v.ReceitaTotal),
                _ => query.OrderByDescending(v => v.DataInicio)
            };
        }
    }
}
