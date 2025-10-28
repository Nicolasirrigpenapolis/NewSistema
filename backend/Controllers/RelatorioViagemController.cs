using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Interfaces;
using System.Security.Claims;

namespace Backend.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RelatorioViagemController : ControllerBase
    {
        private readonly SistemaContext _context;
        private readonly ILogger<RelatorioViagemController> _logger;
        private readonly IExportService _exportService;

        public RelatorioViagemController(
            SistemaContext context,
            ILogger<RelatorioViagemController> logger,
            IExportService exportService)
        {
            _context = context;
            _logger = logger;
            _exportService = exportService;
        }

        // GET: api/relatorioviagem/resumo
        [HttpGet("resumo")]
        public async Task<ActionResult<RelatorioViagemResumoDto>> GetResumo([FromQuery] RelatorioViagemFiltroDto filtros)
        {
            try
            {
                _logger.LogInformation("Solicitação de resumo do relatório de viagens");

                var query = _context.Viagens
                    .Include(v => v.Veiculo)
                    .Include(v => v.Condutor)
                    .Include(v => v.Despesas)
                    .Include(v => v.Receitas)
                    .AsQueryable();

                // Aplicar filtros
                if (filtros.DataInicio.HasValue)
                    query = query.Where(v => v.DataInicio >= filtros.DataInicio.Value);

                if (filtros.DataFim.HasValue)
                    query = query.Where(v => v.DataFim <= filtros.DataFim.Value);

                if (!string.IsNullOrWhiteSpace(filtros.Placa))
                {
                    var placaLower = filtros.Placa.ToLower();
                    query = query.Where(v => v.Veiculo != null && v.Veiculo.Placa.ToLower().Contains(placaLower));
                }

                if (!string.IsNullOrWhiteSpace(filtros.TipoDespesa))
                {
                    var tipoLower = filtros.TipoDespesa.ToLower();
                    query = query.Where(v => v.Despesas.Any(d => d.TipoDespesa.ToLower().Contains(tipoLower)));
                }

                var viagens = await query.ToListAsync();

                var totalViagens = viagens.Count;
                var receitaTotalGeral = viagens.Sum(v => v.ReceitaTotal);
                var despesaTotalGeral = viagens.Sum(v => v.TotalDespesas);
                var saldoLiquidoGeral = receitaTotalGeral - despesaTotalGeral;

                // Calcular despesas por tipo
                var despesasPorTipo = viagens
                    .SelectMany(v => v.Despesas)
                    .GroupBy(d => d.TipoDespesa)
                    .ToDictionary(g => g.Key, g => g.Sum(d => d.Valor));

                var resumo = new RelatorioViagemResumoDto
                {
                    TotalViagens = totalViagens,
                    ReceitaTotalGeral = receitaTotalGeral,
                    DespesaTotalGeral = despesaTotalGeral,
                    SaldoLiquidoGeral = saldoLiquidoGeral,
                    DespesasPorTipo = despesasPorTipo,
                    Viagens = viagens.Take(1000).Select(v => new RelatorioViagemItemDto
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
                        Despesas = v.Despesas.Select(d => new DespesaViagemDto
                        {
                            Id = d.Id,
                            ViagemId = d.ViagemId,
                            TipoDespesa = d.TipoDespesa,
                            Descricao = d.Descricao,
                            Valor = d.Valor,
                            DataDespesa = d.DataDespesa,
                            Local = d.Local,
                            Observacoes = d.Observacoes
                        }).ToList(),
                        DespesasPorTipo = v.Despesas
                            .GroupBy(d => d.TipoDespesa)
                            .ToDictionary(g => g.Key, g => g.Sum(d => d.Valor))
                    }).ToList()
                };

                return Ok(resumo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar resumo do relatório de viagens");
                return StatusCode(500, new { message = "Erro ao gerar resumo do relatório", error = ex.Message });
            }
        }

        // GET: api/relatorioviagem/export/excel
        [HttpGet("export/excel")]
        public async Task<IActionResult> ExportarExcel([FromQuery] RelatorioViagemFiltroDto filtros)
        {
            try
            {
                _logger.LogInformation("Solicitação de exportação Excel do relatório de viagens");

                // Validação de datas
                if (filtros.DataInicio.HasValue && filtros.DataFim.HasValue && filtros.DataFim < filtros.DataInicio)
                {
                    return BadRequest(new { message = "Data fim deve ser maior ou igual à data início" });
                }

                var excelBytes = await _exportService.ExportarViagemExcelAsync(_context, filtros);
                
                // Adiciona headers para evitar cache
                Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
                Response.Headers["Pragma"] = "no-cache";
                Response.Headers["Expires"] = "0";
                
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "relatorio-viagens.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar relatório de viagens para Excel");
                return StatusCode(500, new { message = "Erro ao exportar relatório", error = ex.Message });
            }
        }

        // GET: api/relatorioviagem/export/pdf
        [HttpGet("export/pdf")]
        public async Task<IActionResult> ExportarPdf([FromQuery] RelatorioViagemFiltroDto filtros)
        {
            try
            {
                _logger.LogInformation("Solicitação de exportação PDF do relatório de viagens");

                // Validação de datas
                if (filtros.DataInicio.HasValue && filtros.DataFim.HasValue && filtros.DataFim < filtros.DataInicio)
                {
                    return BadRequest(new { message = "Data fim deve ser maior ou igual à data início" });
                }

                var userName = User?.Identity?.Name;
                if (string.IsNullOrWhiteSpace(userName))
                {
                    userName = User?.Claims?
                        .FirstOrDefault(c => c.Type == "name" || c.Type == "nome" || c.Type == ClaimTypes.Name || c.Type == ClaimTypes.GivenName)?.Value;
                }

                filtros.UsuarioSolicitante ??= string.IsNullOrWhiteSpace(userName)
                    ? "Usuário não identificado"
                    : userName;
                filtros.TituloRelatorio ??= "Relatório de Viagens";

                var pdfBytes = await _exportService.ExportarViagemPdfAsync(_context, filtros);
                
                // Adiciona headers para evitar cache
                Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
                Response.Headers["Pragma"] = "no-cache";
                Response.Headers["Expires"] = "0";
                
                return File(pdfBytes, "application/pdf", "relatorio-viagens.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar relatório de viagens para PDF");
                return StatusCode(500, new { message = "Erro ao exportar relatório", error = ex.Message });
            }
        }
    }
}
