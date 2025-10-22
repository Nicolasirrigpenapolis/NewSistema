using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.draw;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Interfaces;
using Backend.Api.Tenancia;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Services
{
    public class ExportService : IExportService
    {
        private readonly ILogger<ExportService> _logger;
        private readonly IContextoEmpresa _contextoEmpresa;
        private readonly IWebHostEnvironment _environment;
        private readonly PdfStyleCatalog _pdfStyles = new PdfStyleCatalog();

        public ExportService(ILogger<ExportService> logger, IContextoEmpresa contextoEmpresa, IWebHostEnvironment environment)
        {
            _logger = logger;
            _contextoEmpresa = contextoEmpresa;
            _environment = environment;
        }

        #region Relatório de Manutenção - Excel

        public byte[] ExportarManutencaoExcel(RelatorioManutencaoResumoDto dados, RelatorioManutencaoFiltroDto filtros)
        {
            try
            {
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Manutencao");

                var titleRange = worksheet.Range("A1:H1");
                titleRange.Merge();
                titleRange.Value = filtros.TituloRelatorio ?? "RELATÓRIO DE MANUTENÇÃO DE VEÍCULOS";
                titleRange.Style.Font.Bold = true;
                titleRange.Style.Font.FontSize = 16;
                titleRange.Style.Font.FontColor = XLColor.White;
                titleRange.Style.Fill.BackgroundColor = XLColor.FromArgb(41, 128, 185);
                titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                worksheet.Row(1).Height = 28;

                var row = 2;
                var periodo = $"Período: {filtros.DataInicio?.ToString("dd/MM/yyyy") ?? "Todos"} até {filtros.DataFim?.ToString("dd/MM/yyyy") ?? "Todos"}";
                worksheet.Cell(row, 1).Value = periodo;
                worksheet.Cell(row, 1).Style.Font.FontSize = 10;
                worksheet.Cell(row, 1).Style.Font.Italic = true;
                worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(52, 73, 94);
                row++;

                if (!string.IsNullOrWhiteSpace(filtros.UsuarioSolicitante))
                {
                    worksheet.Cell(row, 1).Value = $"Solicitante: {filtros.UsuarioSolicitante} | Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}";
                    worksheet.Cell(row, 1).Style.Font.FontSize = 9;
                    worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(149, 165, 166);
                    row++;
                }

                row++;

                worksheet.Cell(row, 1).Value = "RESUMO EXECUTIVO";
                worksheet.Cell(row, 1).Style.Font.Bold = true;
                worksheet.Cell(row, 1).Style.Font.FontSize = 12;
                worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(52, 73, 94);
                row++;

                var summaryTopRow = row;
                var summaryCards = new (string Label, double Value, string Format, XLColor Color)[]
                {
                    ("Total de manutenções", dados.TotalManutencoes, "#,##0", XLColor.FromArgb(52, 152, 219)),
                    ("Mão de obra total", (double)dados.ValorTotalMaoObra, "R$ #,##0.00", XLColor.FromArgb(39, 174, 96)),
                    ("Peças total", (double)dados.ValorTotalPecas, "R$ #,##0.00", XLColor.FromArgb(41, 128, 185)),
                    ("Total geral", (double)dados.ValorTotalGeral, "R$ #,##0.00", XLColor.FromArgb(243, 156, 18))
                };

                for (var i = 0; i < summaryCards.Length; i++)
                {
                    var (label, value, format, color) = summaryCards[i];
                    var column = 1 + (i * 2);

                    var labelRange = worksheet.Range(summaryTopRow, column, summaryTopRow, column + 1);
                    labelRange.Merge();
                    labelRange.Value = label;
                    labelRange.Style.Font.Bold = true;
                    labelRange.Style.Font.FontColor = XLColor.White;
                    labelRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    labelRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    labelRange.Style.Fill.BackgroundColor = color;
                    labelRange.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;

                    var valueRange = worksheet.Range(summaryTopRow + 1, column, summaryTopRow + 1, column + 1);
                    valueRange.Merge();
                    valueRange.Value = value;
                    valueRange.Style.Font.Bold = true;
                    valueRange.Style.Font.FontSize = 14;
                    valueRange.Style.Font.FontColor = XLColor.White;
                    valueRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    valueRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    valueRange.Style.Fill.BackgroundColor = color;
                    valueRange.Style.NumberFormat.Format = format;
                    valueRange.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;
                }

                row = summaryTopRow + 3;

                var ticketMedio = dados.TotalManutencoes > 0 ? dados.ValorTotalGeral / dados.TotalManutencoes : 0m;
                worksheet.Cell(row, 1).Value = $"Ticket médio por manutenção: {ticketMedio:C2}";
                worksheet.Cell(row, 1).Style.Font.FontSize = 10;
                worksheet.Cell(row, 1).Style.Font.Italic = true;
                worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(52, 73, 94);
                row += 2;

                worksheet.Cell(row, 1).Value = "DETALHAMENTO DE MANUTENÇÕES";
                worksheet.Cell(row, 1).Style.Font.Bold = true;
                worksheet.Cell(row, 1).Style.Font.FontSize = 12;
                worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(52, 73, 94);
                row++;

                var detailHeaders = new[] { "Data", "Veículo", "Descrição", "Fornecedor", "Mão de obra", "Peças", "Total" };
                for (var i = 0; i < detailHeaders.Length; i++)
                {
                    var cell = worksheet.Cell(row, i + 1);
                    cell.Value = detailHeaders[i];
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.FontColor = XLColor.White;
                    cell.Style.Fill.BackgroundColor = XLColor.FromArgb(52, 73, 94);
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                }

                var detailHeaderRow = row;
                row++;

                var alternate = false;
                foreach (var manutencao in dados.Manutencoes)
                {
                    worksheet.Cell(row, 1).Value = manutencao.DataManutencao.ToString("dd/MM/yyyy");
                    worksheet.Cell(row, 2).Value = $"{manutencao.VeiculoPlaca} - {manutencao.VeiculoMarca}";
                    worksheet.Cell(row, 3).Value = manutencao.Descricao;
                    worksheet.Cell(row, 4).Value = manutencao.FornecedorNome ?? "Nao informado";
                    worksheet.Cell(row, 5).Value = manutencao.ValorMaoObra;
                    worksheet.Cell(row, 6).Value = manutencao.ValorPecas;
                    worksheet.Cell(row, 7).Value = manutencao.ValorTotal;

                    worksheet.Cell(row, 5).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 6).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 7).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 7).Style.Font.Bold = true;

                    var detailRange = worksheet.Range(row, 1, row, 7);
                    detailRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    detailRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    if (alternate)
                    {
                        detailRange.Style.Fill.BackgroundColor = XLColor.FromArgb(245, 247, 250);
                    }

                    alternate = !alternate;
                    row++;
                }

                worksheet.Column(1).Width = 12;
                worksheet.Column(2).Width = 26;
                worksheet.Column(3).Width = 42;
                worksheet.Column(4).Width = 26;
                worksheet.Column(5).Width = 16;
                worksheet.Column(6).Width = 16;
                worksheet.Column(7).Width = 16;
                worksheet.Column(8).Width = 4;

                worksheet.SheetView.FreezeRows(detailHeaderRow);

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar relatório de manutenção em Excel");
                throw;
            }
        }

        #endregion

        #region Relatório de Manutenção - PDF

        public byte[] ExportarManutencaoPdf(RelatorioManutencaoResumoDto dados, RelatorioManutencaoFiltroDto filtros)
        {
            try
            {
                var culture = new CultureInfo("pt-BR");
                var orientation = DecideManutencaoOrientation(dados);
                var pageSize = orientation == PdfOrientation.Landscape ? PageSize.A4.Rotate() : PageSize.A4;

                using var stream = new MemoryStream();
                var document = new Document(pageSize, 36f, 36f, 72f, 54f);
                var writer = PdfWriter.GetInstance(document, stream);

                var dataGeracao = DateTime.Now;
                var rodapeTexto = "Relatório gerado automaticamente pelo Sistema Irrigação Penápolis";
                writer.PageEvent = new ReportFooterPageEvent(_pdfStyles, rodapeTexto, dataGeracao);

                document.Open();

                BuildManutencaoHeader(document, dados, filtros, dataGeracao, culture);

                var ticketMedio = dados.TotalManutencoes > 0
                    ? dados.ValorTotalGeral / dados.TotalManutencoes
                    : 0m;

                var manutencaoSummary = new List<SummaryItem>
                {
                    new SummaryItem("Total de manutenções", dados.TotalManutencoes.ToString(culture), _pdfStyles.SecondaryColor, "Registros no período"),
                    new SummaryItem("Mão de obra", dados.ValorTotalMaoObra.ToString("C2", culture), _pdfStyles.SuccessColor),
                    new SummaryItem("Peças", dados.ValorTotalPecas.ToString("C2", culture), _pdfStyles.PrimaryColor),
                    new SummaryItem("Total geral", dados.ValorTotalGeral.ToString("C2", culture), _pdfStyles.SuccessColor)
                };

                AddSummarySection(document, "Resumo financeiro", manutencaoSummary, $"Ticket médio por Manutenção: {ticketMedio.ToString("C2", culture)}");

                BuildManutencaoPecasResumo(document, dados, culture);
                BuildManutencaoCards(document, dados, culture);

                document.Close();
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar Relatório de Manutenção em PDF");
                throw;
            }
        }

        #endregion

        #region Relatório de Despesas - Excel

        public byte[] ExportarDespesasExcel(RelatorioDespesasResumoDto dados, RelatorioDespesasFiltroDto filtros)
        {
            try
            {
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("DespesasViagens");

                var titleRange = worksheet.Range("A1:H1");
                titleRange.Merge();
                titleRange.Value = filtros.TituloRelatorio ?? "RELATORIO DE DESPESAS E RECEITAS";
                titleRange.Style.Font.Bold = true;
                titleRange.Style.Font.FontSize = 16;
                titleRange.Style.Font.FontColor = XLColor.White;
                titleRange.Style.Fill.BackgroundColor = XLColor.FromArgb(39, 174, 96);
                titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                worksheet.Row(1).Height = 28;

                var row = 2;
                var periodo = $"Periodo: {filtros.DataInicio?.ToString("dd/MM/yyyy") ?? "Todos"} ate {filtros.DataFim?.ToString("dd/MM/yyyy") ?? "Todos"}";
                worksheet.Cell(row, 1).Value = periodo;
                worksheet.Cell(row, 1).Style.Font.FontSize = 10;
                worksheet.Cell(row, 1).Style.Font.Italic = true;
                worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(52, 73, 94);
                row++;

                if (!string.IsNullOrWhiteSpace(filtros.UsuarioSolicitante))
                {
                    worksheet.Cell(row, 1).Value = $"Solicitante: {filtros.UsuarioSolicitante} | Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}";
                    worksheet.Cell(row, 1).Style.Font.FontSize = 9;
                    worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(149, 165, 166);
                    row++;
                }

                row++;

                worksheet.Cell(row, 1).Value = "RESUMO EXECUTIVO";
                worksheet.Cell(row, 1).Style.Font.Bold = true;
                worksheet.Cell(row, 1).Style.Font.FontSize = 12;
                worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(52, 73, 94);
                row++;

                var summaryTopRow = row;
                var summaryCards = new (string Label, double Value, string Format, XLColor Color)[]
                {
                    ("Total de viagens", dados.TotalViagens, "#,##0", XLColor.FromArgb(52, 152, 219)),
                    ("Receita total", (double)dados.ReceitaTotalGeral, "R$ #,##0.00", XLColor.FromArgb(39, 174, 96)),
                    ("Despesas totais", (double)dados.DespesaTotalGeral, "R$ #,##0.00", XLColor.FromArgb(231, 76, 60)),
                    ("Saldo liquido", (double)dados.SaldoLiquidoGeral, "R$ #,##0.00", dados.SaldoLiquidoGeral >= 0 ? XLColor.FromArgb(46, 204, 113) : XLColor.FromArgb(231, 76, 60))
                };

                for (var i = 0; i < summaryCards.Length; i++)
                {
                    var (label, value, format, color) = summaryCards[i];
                    var column = 1 + (i * 2);

                    var labelRange = worksheet.Range(summaryTopRow, column, summaryTopRow, column + 1);
                    labelRange.Merge();
                    labelRange.Value = label;
                    labelRange.Style.Font.Bold = true;
                    labelRange.Style.Font.FontColor = XLColor.White;
                    labelRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    labelRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    labelRange.Style.Fill.BackgroundColor = color;
                    labelRange.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;

                    var valueRange = worksheet.Range(summaryTopRow + 1, column, summaryTopRow + 1, column + 1);
                    valueRange.Merge();
                    valueRange.Value = value;
                    valueRange.Style.Font.Bold = true;
                    valueRange.Style.Font.FontSize = 14;
                    valueRange.Style.Font.FontColor = XLColor.White;
                    valueRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    valueRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    valueRange.Style.Fill.BackgroundColor = color;
                    valueRange.Style.NumberFormat.Format = format;
                    valueRange.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;
                }

                row = summaryTopRow + 3;

                var saldoMedio = dados.TotalViagens > 0 ? dados.SaldoLiquidoGeral / dados.TotalViagens : 0m;
                worksheet.Cell(row, 1).Value = $"Saldo medio por viagem: {saldoMedio:C2}";
                worksheet.Cell(row, 1).Style.Font.FontSize = 10;
                worksheet.Cell(row, 1).Style.Font.Italic = true;
                worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(52, 73, 94);
                row += 2;

                if (dados.DespesasPorTipo.Any())
                {
                    worksheet.Cell(row, 1).Value = "DESPESAS POR TIPO";
                    worksheet.Cell(row, 1).Style.Font.Bold = true;
                    worksheet.Cell(row, 1).Style.Font.FontSize = 12;
                    worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(52, 73, 94);
                    row++;

                    var headerRange = worksheet.Range(row, 1, row, 2);
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Font.FontColor = XLColor.White;
                    headerRange.Style.Fill.BackgroundColor = XLColor.FromArgb(52, 73, 94);
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    worksheet.Cell(row, 1).Value = "Tipo";
                    worksheet.Cell(row, 2).Value = "Valor";
                    row++;

                    var alternateTipo = false;
                    foreach (var despesaTipo in dados.DespesasPorTipo.OrderByDescending(d => d.Value))
                    {
                        worksheet.Cell(row, 1).Value = despesaTipo.Key;
                        worksheet.Cell(row, 2).Value = despesaTipo.Value;
                        worksheet.Cell(row, 2).Style.NumberFormat.Format = "R$ #,##0.00";
                        worksheet.Cell(row, 2).Style.Font.Bold = true;

                        var despesaRange = worksheet.Range(row, 1, row, 2);
                        despesaRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                        if (alternateTipo)
                        {
                            despesaRange.Style.Fill.BackgroundColor = XLColor.FromArgb(245, 247, 250);
                        }

                        alternateTipo = !alternateTipo;
                        row++;
                    }

                    row += 2;
                }

                worksheet.Cell(row, 1).Value = "DETALHAMENTO DE VIAGENS";
                worksheet.Cell(row, 1).Style.Font.Bold = true;
                worksheet.Cell(row, 1).Style.Font.FontSize = 12;
                worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.FromArgb(52, 73, 94);
                row++;

                var detailHeaders = new[] { "Periodo", "Veiculo", "Origem/Destino", "Duracao", "Receita", "Despesas", "Saldo" };
                for (var i = 0; i < detailHeaders.Length; i++)
                {
                    var cell = worksheet.Cell(row, i + 1);
                    cell.Value = detailHeaders[i];
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.FontColor = XLColor.White;
                    cell.Style.Fill.BackgroundColor = XLColor.FromArgb(52, 73, 94);
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                }

                var detailHeaderRow = row;
                row++;

                var alternateViagem = false;
                foreach (var viagem in dados.Viagens)
                {
                    worksheet.Cell(row, 1).Value = $"{viagem.DataInicio:dd/MM/yyyy} - {viagem.DataFim:dd/MM/yyyy}";
                    worksheet.Cell(row, 2).Value = $"{viagem.VeiculoPlaca} - {viagem.VeiculoMarca}";
                    worksheet.Cell(row, 3).Value = viagem.OrigemDestino ?? "Nao informado";
                    worksheet.Cell(row, 4).Value = $"{viagem.DuracaoDias} dias";
                    worksheet.Cell(row, 5).Value = viagem.ReceitaTotal;
                    worksheet.Cell(row, 6).Value = viagem.TotalDespesas;
                    worksheet.Cell(row, 7).Value = viagem.SaldoLiquido;

                    worksheet.Cell(row, 5).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 6).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 7).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 7).Style.Font.Bold = true;
                    worksheet.Cell(row, 7).Style.Font.FontColor = viagem.SaldoLiquido >= 0 ? XLColor.FromArgb(39, 174, 96) : XLColor.FromArgb(231, 76, 60);

                    var detailRange = worksheet.Range(row, 1, row, 7);
                    detailRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    detailRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    if (alternateViagem)
                    {
                        detailRange.Style.Fill.BackgroundColor = XLColor.FromArgb(245, 247, 250);
                    }

                    alternateViagem = !alternateViagem;
                    row++;
                }

                worksheet.Column(1).Width = 22;
                worksheet.Column(2).Width = 26;
                worksheet.Column(3).Width = 38;
                worksheet.Column(4).Width = 12;
                worksheet.Column(5).Width = 16;
                worksheet.Column(6).Width = 16;
                worksheet.Column(7).Width = 16;
                worksheet.Column(8).Width = 4;

                worksheet.SheetView.FreezeRows(detailHeaderRow);

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar relatório de despesas em Excel");
                throw;
            }
        }

        #endregion

        #region Relatório de Despesas - PDF

        public byte[] ExportarDespesasPdf(RelatorioDespesasResumoDto dados, RelatorioDespesasFiltroDto filtros)
        {
            try
            {
                _logger.LogWarning("🎨 [PDF DESPESAS] MÉTODO MODERNO EXECUTANDO - Build: {BuildDate}", DateTime.Now);
                _logger.LogWarning("🎨 [PDF DESPESAS] Total de viagens: {Total}", dados.TotalViagens);
                
                var culture = new CultureInfo("pt-BR");
                var orientation = DecideDespesasOrientation(dados);
                var pageSize = orientation == PdfOrientation.Landscape ? PageSize.A4.Rotate() : PageSize.A4;

                using var stream = new MemoryStream();
                var document = new Document(pageSize, 36f, 36f, 72f, 54f);
                var writer = PdfWriter.GetInstance(document, stream);

                var dataGeracao = DateTime.Now;
                var rodapeTexto = "Relatório gerado automaticamente pelo Sistema Irrigação Penápolis";
                writer.PageEvent = new ReportFooterPageEvent(_pdfStyles, rodapeTexto, dataGeracao);

                document.Open();

                _logger.LogWarning("🎨 [PDF DESPESAS] Chamando BuildDespesasHeader...");
                BuildDespesasHeader(document, dados, filtros, dataGeracao, culture);

                var saldoMedio = dados.TotalViagens > 0 ? dados.SaldoLiquidoGeral / dados.TotalViagens : 0m;

                var despesasResumo = new List<SummaryItem>
                {
                    new SummaryItem("Total de viagens", dados.TotalViagens.ToString(culture), _pdfStyles.SecondaryColor, "Registros consolidados"),
                    new SummaryItem("Receita total", dados.ReceitaTotalGeral.ToString("C2", culture), _pdfStyles.SuccessColor),
                    new SummaryItem("Despesas totais", dados.DespesaTotalGeral.ToString("C2", culture), _pdfStyles.DangerColor),
                    new SummaryItem("Saldo líquido", dados.SaldoLiquidoGeral.ToString("C2", culture), dados.SaldoLiquidoGeral >= 0 ? _pdfStyles.SuccessColor : _pdfStyles.DangerColor)
                };

                _logger.LogWarning("🎨 [PDF DESPESAS] Chamando AddSummarySection...");
                AddSummarySection(document, "Resumo geral", despesasResumo, $"Saldo médio por viagem: {saldoMedio.ToString("C2", culture)}");

                _logger.LogWarning("🎨 [PDF DESPESAS] Chamando BuildDespesasPorTipo...");
                BuildDespesasPorTipo(document, dados, culture);
                
                _logger.LogWarning("🎨 [PDF DESPESAS] Chamando BuildDespesasCards (LAYOUT MODERNO)...");
                BuildDespesasCards(document, dados, culture);
                
                _logger.LogWarning("🎨 [PDF DESPESAS] PDF gerado com sucesso!");

                document.Close();
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar Relatório de despesas em PDF");
                throw;
            }
        }

        #endregion

        #region Métodos Assíncronos

        public async Task<byte[]> ExportarManutencaoExcelAsync(SistemaContext context, RelatorioManutencaoFiltroDto filtros)
        {
            try
            {
                var query = context.ManutencaoVeiculos
                    .Include(m => m.Veiculo)
                    .Include(m => m.Fornecedor)
                    .Include(m => m.Pecas)
                    .AsQueryable();

                if (filtros.DataInicio.HasValue)
                    query = query.Where(m => m.DataManutencao >= filtros.DataInicio.Value);

                if (filtros.DataFim.HasValue)
                    query = query.Where(m => m.DataManutencao <= filtros.DataFim.Value);

                if (!string.IsNullOrWhiteSpace(filtros.Placa))
                {
                    var placaLower = filtros.Placa.ToLower();
                    query = query.Where(m => m.Veiculo != null && m.Veiculo.Placa.ToLower().Contains(placaLower));
                }

                if (!string.IsNullOrWhiteSpace(filtros.Peca))
                {
                    var pecaLower = filtros.Peca.ToLower();
                    query = query.Where(m => m.Pecas.Any(p => p.DescricaoPeca.ToLower().Contains(pecaLower)));
                }

                if (filtros.FornecedorId.HasValue)
                    query = query.Where(m => m.FornecedorId == filtros.FornecedorId.Value);

                var totalManutencoes = await query.CountAsync();
                var valorTotalMaoObra = await query.SumAsync(m => m.ValorMaoObra);
                
                // Carregar peças em memória antes de calcular ValorTotal (propriedade NotMapped)
                var todasPecasExcel = await query
                    .SelectMany(m => m.Pecas)
                    .Select(p => new { p.Quantidade, p.ValorUnitario })
                    .ToListAsync();
                var valorTotalPecas = todasPecasExcel.Sum(p => p.Quantidade * p.ValorUnitario);
                var valorTotalGeral = valorTotalMaoObra + valorTotalPecas;

                var manutencoes = await query
                    .OrderByDescending(m => m.DataManutencao)
                    .Take(10000)
                    .ToListAsync();

                var resumo = new RelatorioManutencaoResumoDto
                {
                    TotalManutencoes = totalManutencoes,
                    ValorTotalMaoObra = valorTotalMaoObra,
                    ValorTotalPecas = valorTotalPecas,
                    ValorTotalGeral = valorTotalGeral,
                    Manutencoes = manutencoes.Select(m => new RelatorioManutencaoItemDto
                    {
                        Id = m.Id,
                        DataManutencao = m.DataManutencao,
                        VeiculoPlaca = m.Veiculo?.Placa ?? string.Empty,
                        VeiculoMarca = m.Veiculo?.Marca ?? string.Empty,
                        VeiculoDescricao = m.Veiculo != null ? $"{m.Veiculo.Placa ?? string.Empty}{(!string.IsNullOrWhiteSpace(m.Veiculo.Marca) ? $" - {m.Veiculo.Marca}" : string.Empty)}" : string.Empty,
                        Descricao = m.Descricao,
                        FornecedorNome = m.Fornecedor?.Nome,
                        ValorMaoObra = m.ValorMaoObra,
                        ValorPecas = m.Pecas?.Sum(p => p.ValorTotal) ?? 0,
                        ValorTotal = m.ValorMaoObra + (m.Pecas?.Sum(p => p.ValorTotal) ?? 0),
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
                    }).ToList()
                };

                return ExportarManutencaoExcel(resumo, filtros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar Relatório de Manutenção para Excel (async)");
                throw;
            }
        }

        public async Task<byte[]> ExportarManutencaoPdfAsync(SistemaContext context, RelatorioManutencaoFiltroDto filtros)
        {
            try
            {
                var query = context.ManutencaoVeiculos
                    .Include(m => m.Veiculo)
                    .Include(m => m.Fornecedor)
                    .Include(m => m.Pecas)
                    .AsQueryable();

                if (filtros.DataInicio.HasValue)
                    query = query.Where(m => m.DataManutencao >= filtros.DataInicio.Value);

                if (filtros.DataFim.HasValue)
                    query = query.Where(m => m.DataManutencao <= filtros.DataFim.Value);

                if (!string.IsNullOrWhiteSpace(filtros.Placa))
                {
                    var placaLower = filtros.Placa.ToLower();
                    query = query.Where(m => m.Veiculo != null && m.Veiculo.Placa.ToLower().Contains(placaLower));
                }

                if (!string.IsNullOrWhiteSpace(filtros.Peca))
                {
                    var pecaLower = filtros.Peca.ToLower();
                    query = query.Where(m => m.Pecas.Any(p => p.DescricaoPeca.ToLower().Contains(pecaLower)));
                }

                if (filtros.FornecedorId.HasValue)
                    query = query.Where(m => m.FornecedorId == filtros.FornecedorId.Value);

                var totalManutencoes = await query.CountAsync();
                var valorTotalMaoObra = await query.SumAsync(m => m.ValorMaoObra);
                
                // Corrigido: Carregar peças em memória antes de calcular ValorTotal (propriedade NotMapped)
                var todasPecas = await query
                    .SelectMany(m => m.Pecas)
                    .Select(p => new { p.Quantidade, p.ValorUnitario })
                    .ToListAsync();
                var valorTotalPecas = todasPecas.Sum(p => p.Quantidade * p.ValorUnitario);
                var valorTotalGeral = valorTotalMaoObra + valorTotalPecas;

                var manutencoes = await query
                    .OrderByDescending(m => m.DataManutencao)
                    .Take(10000)
                    .ToListAsync();

                var resumo = new RelatorioManutencaoResumoDto
                {
                    TotalManutencoes = totalManutencoes,
                    ValorTotalMaoObra = valorTotalMaoObra,
                    ValorTotalPecas = valorTotalPecas,
                    ValorTotalGeral = valorTotalGeral,
                    Manutencoes = manutencoes.Select(m => new RelatorioManutencaoItemDto
                    {
                        Id = m.Id,
                        DataManutencao = m.DataManutencao,
                        VeiculoPlaca = m.Veiculo?.Placa ?? string.Empty,
                        VeiculoMarca = m.Veiculo?.Marca ?? string.Empty,
                        VeiculoDescricao = m.Veiculo != null ? $"{m.Veiculo.Placa ?? string.Empty}{(!string.IsNullOrWhiteSpace(m.Veiculo.Marca) ? $" - {m.Veiculo.Marca}" : string.Empty)}" : string.Empty,
                        Descricao = m.Descricao,
                        FornecedorNome = m.Fornecedor?.Nome,
                        ValorMaoObra = m.ValorMaoObra,
                        ValorPecas = m.Pecas?.Sum(p => p.ValorTotal) ?? 0,
                        ValorTotal = m.ValorMaoObra + (m.Pecas?.Sum(p => p.ValorTotal) ?? 0),
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
                    }).ToList()
                };

                return ExportarManutencaoPdf(resumo, filtros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar Relatório de Manutenção para PDF (async)");
                throw;
            }
        }

        public async Task<byte[]> ExportarDespesasExcelAsync(SistemaContext context, RelatorioDespesasFiltroDto filtros)
        {
            try
            {
                var query = context.Viagens
                    .Include(v => v.Veiculo)
                    .Include(v => v.Despesas)
                    .AsQueryable();

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
                    var tipoDespesaLower = filtros.TipoDespesa.ToLower();
                    query = query.Where(v => v.Despesas.Any(d => d.TipoDespesa.ToLower().Contains(tipoDespesaLower)));
                }

                var totalViagens = await query.CountAsync();
                var receitaTotalGeral = await query.SumAsync(v => v.ReceitaTotal);
                var despesaTotalGeral = await query.SelectMany(v => v.Despesas).SumAsync(d => d.Valor);
                var saldoLiquidoGeral = receitaTotalGeral - despesaTotalGeral;

                var despesasPorTipo = await query
                    .SelectMany(v => v.Despesas)
                    .GroupBy(d => d.TipoDespesa)
                    .Select(g => new { TipoDespesa = g.Key, Total = g.Sum(d => d.Valor) })
                    .ToDictionaryAsync(g => g.TipoDespesa, g => g.Total);

                var viagens = await query
                    .OrderByDescending(v => v.DataInicio)
                    .Take(10000)
                    .ToListAsync();

                var resumo = new RelatorioDespesasResumoDto
                {
                    TotalViagens = totalViagens,
                    ReceitaTotalGeral = receitaTotalGeral,
                    DespesaTotalGeral = despesaTotalGeral,
                    SaldoLiquidoGeral = saldoLiquidoGeral,
                    DespesasPorTipo = despesasPorTipo,
                    Viagens = viagens.Select(v => new RelatorioDespesasItemDto
                    {
                        Id = v.Id,
                        VeiculoPlaca = v.Veiculo?.Placa ?? string.Empty,
                        VeiculoMarca = v.Veiculo?.Marca ?? string.Empty,
                        DataInicio = v.DataInicio,
                        DataFim = v.DataFim,
                        DuracaoDias = (v.DataFim - v.DataInicio).Days + 1,
                        OrigemDestino = v.OrigemDestino,
                        ReceitaTotal = v.ReceitaTotal,
                        TotalDespesas = v.Despesas?.Sum(d => d.Valor) ?? 0,
                        SaldoLiquido = v.ReceitaTotal - (v.Despesas?.Sum(d => d.Valor) ?? 0),
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
                    }).ToList()
                };

                return ExportarDespesasExcel(resumo, filtros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar Relatório de despesas para Excel (async)");
                throw;
            }
        }

        public async Task<byte[]> ExportarDespesasPdfAsync(SistemaContext context, RelatorioDespesasFiltroDto filtros)
        {
            try
            {
                _logger.LogWarning("📊📊📊 [EXPORT SERVICE ASYNC] ExportarDespesasPdfAsync INICIADO");
                
                var query = context.Viagens
                    .Include(v => v.Veiculo)
                    .Include(v => v.Despesas)
                    .AsQueryable();

                _logger.LogWarning("📊 [EXPORT SERVICE ASYNC] Query criada, aplicando filtros...");

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
                    var tipoDespesaLower = filtros.TipoDespesa.ToLower();
                    query = query.Where(v => v.Despesas.Any(d => d.TipoDespesa.ToLower().Contains(tipoDespesaLower)));
                }

                var totalViagens = await query.CountAsync();
                var receitaTotalGeral = await query.SumAsync(v => v.ReceitaTotal);
                var despesaTotalGeral = await query.SelectMany(v => v.Despesas).SumAsync(d => d.Valor);
                var saldoLiquidoGeral = receitaTotalGeral - despesaTotalGeral;

                var despesasPorTipo = await query
                    .SelectMany(v => v.Despesas)
                    .GroupBy(d => d.TipoDespesa)
                    .Select(g => new { TipoDespesa = g.Key, Total = g.Sum(d => d.Valor) })
                    .ToDictionaryAsync(g => g.TipoDespesa, g => g.Total);

                var viagens = await query
                    .OrderByDescending(v => v.DataInicio)
                    .Take(10000)
                    .ToListAsync();

                var resumo = new RelatorioDespesasResumoDto
                {
                    TotalViagens = totalViagens,
                    ReceitaTotalGeral = receitaTotalGeral,
                    DespesaTotalGeral = despesaTotalGeral,
                    SaldoLiquidoGeral = saldoLiquidoGeral,
                    DespesasPorTipo = despesasPorTipo,
                    Viagens = viagens.Select(v => new RelatorioDespesasItemDto
                    {
                        Id = v.Id,
                        VeiculoPlaca = v.Veiculo?.Placa ?? string.Empty,
                        VeiculoMarca = v.Veiculo?.Marca ?? string.Empty,
                        DataInicio = v.DataInicio,
                        DataFim = v.DataFim,
                        DuracaoDias = (v.DataFim - v.DataInicio).Days + 1,
                        OrigemDestino = v.OrigemDestino,
                        ReceitaTotal = v.ReceitaTotal,
                        TotalDespesas = v.Despesas?.Sum(d => d.Valor) ?? 0,
                        SaldoLiquido = v.ReceitaTotal - (v.Despesas?.Sum(d => d.Valor) ?? 0),
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
                    }).ToList()
                };

                _logger.LogWarning("📊 [EXPORT SERVICE ASYNC] Resumo montado, chamando ExportarDespesasPdf...");
                _logger.LogWarning("📊 [EXPORT SERVICE ASYNC] Total de viagens: {Total}", resumo.TotalViagens);
                
                var resultado = ExportarDespesasPdf(resumo, filtros);
                
                _logger.LogWarning("📊 [EXPORT SERVICE ASYNC] PDF retornado com {Size} bytes", resultado.Length);
                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "📊❌ [EXPORT SERVICE ASYNC] ERRO ao exportar Relatório de despesas para PDF (async)");
                throw;
            }
        }

        #endregion

        #region Métodos Auxiliares PDF - Cabeçalho e Resumo

        private void BuildManutencaoHeader(Document document, RelatorioManutencaoResumoDto dados, RelatorioManutencaoFiltroDto filtros, DateTime dataGeracao, CultureInfo culture)
        {
            var headerTable = new PdfPTable(2) { WidthPercentage = 100 };
            headerTable.SetWidths(new float[] { 15f, 85f });

            var logoPath = ObterCaminhoLogo();
            if (!string.IsNullOrEmpty(logoPath) && File.Exists(logoPath))
            {
                var logo = Image.GetInstance(logoPath);
                logo.ScaleToFit(70f, 70f);
                var logoCell = new PdfPCell(logo) { Border = Rectangle.NO_BORDER, HorizontalAlignment = Element.ALIGN_CENTER, VerticalAlignment = Element.ALIGN_MIDDLE };
                headerTable.AddCell(logoCell);
            }
            else
            {
                headerTable.AddCell(new PdfPCell(new Phrase(" ", _pdfStyles.TextFont)) { Border = Rectangle.NO_BORDER });
            }

            var headerContent = new PdfPTable(1) { WidthPercentage = 100 };
            headerContent.AddCell(new PdfPCell(new Phrase(filtros.TituloRelatorio ?? "Relatório de Manutenção de Veículos", _pdfStyles.TitleFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingBottom = 4f
            });

            headerContent.AddCell(new PdfPCell(new Phrase($"Período: {filtros.DataInicio?.ToString("dd/MM/yyyy", culture) ?? "Não especificado"} até {filtros.DataFim?.ToString("dd/MM/yyyy", culture) ?? "Não especificado"}", _pdfStyles.SubtitleFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingBottom = 2f
            });

            headerContent.AddCell(new PdfPCell(new Phrase($"Gerado em: {dataGeracao:dd/MM/yyyy HH:mm}", _pdfStyles.MetaFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingBottom = 2f
            });

            if (!string.IsNullOrEmpty(filtros.UsuarioSolicitante))
            {
                headerContent.AddCell(new PdfPCell(new Phrase($"Solicitante: {filtros.UsuarioSolicitante}", _pdfStyles.MetaFont))
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_LEFT
                });
            }

            headerTable.AddCell(new PdfPCell(headerContent) { Border = Rectangle.NO_BORDER });
            document.Add(headerTable);
            document.Add(new Paragraph(" ", _pdfStyles.TextFont) { SpacingAfter = 8f });
        }

        private void BuildDespesasHeader(Document document, RelatorioDespesasResumoDto dados, RelatorioDespesasFiltroDto filtros, DateTime dataGeracao, CultureInfo culture)
        {
            var headerTable = new PdfPTable(2) { WidthPercentage = 100 };
            headerTable.SetWidths(new float[] { 15f, 85f });

            var logoPath = ObterCaminhoLogo();
            if (!string.IsNullOrEmpty(logoPath) && File.Exists(logoPath))
            {
                var logo = Image.GetInstance(logoPath);
                logo.ScaleToFit(70f, 70f);
                var logoCell = new PdfPCell(logo) { Border = Rectangle.NO_BORDER, HorizontalAlignment = Element.ALIGN_CENTER, VerticalAlignment = Element.ALIGN_MIDDLE };
                headerTable.AddCell(logoCell);
            }
            else
            {
                headerTable.AddCell(new PdfPCell(new Phrase(" ", _pdfStyles.TextFont)) { Border = Rectangle.NO_BORDER });
            }

            var headerContent = new PdfPTable(1) { WidthPercentage = 100 };
            headerContent.AddCell(new PdfPCell(new Phrase(filtros.TituloRelatorio ?? "Relatório de Despesas/Receitas de Viagens", _pdfStyles.TitleFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingBottom = 4f
            });

            headerContent.AddCell(new PdfPCell(new Phrase($"Período: {filtros.DataInicio?.ToString("dd/MM/yyyy", culture) ?? "Não especificado"} até {filtros.DataFim?.ToString("dd/MM/yyyy", culture) ?? "Não especificado"}", _pdfStyles.SubtitleFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingBottom = 2f
            });

            headerContent.AddCell(new PdfPCell(new Phrase($"Gerado em: {dataGeracao:dd/MM/yyyy HH:mm}", _pdfStyles.MetaFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingBottom = 2f
            });

            if (!string.IsNullOrEmpty(filtros.UsuarioSolicitante))
            {
                headerContent.AddCell(new PdfPCell(new Phrase($"Solicitante: {filtros.UsuarioSolicitante}", _pdfStyles.MetaFont))
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_LEFT
                });
            }

            headerTable.AddCell(new PdfPCell(headerContent) { Border = Rectangle.NO_BORDER });
            document.Add(headerTable);
            document.Add(new Paragraph(" ", _pdfStyles.TextFont) { SpacingAfter = 8f });
        }

        private void AddSummarySection(Document document, string titulo, List<SummaryItem> items, string? rodape = null)
        {
            var sectionTitle = new Paragraph(titulo, _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 12f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            var summaryTable = new PdfPTable(items.Count) { WidthPercentage = 100 };
            summaryTable.SetWidths(Enumerable.Repeat(1f, items.Count).ToArray());
            summaryTable.SpacingAfter = 8f;

            foreach (var item in items)
            {
                var cardTable = new PdfPTable(1) { WidthPercentage = 100 };

                var titleCell = new PdfPCell(new Phrase(item.Label, _pdfStyles.CardTitleFont))
                {
                    BackgroundColor = item.Color,
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    Padding = 8f,
                    PaddingBottom = 4f
                };
                cardTable.AddCell(titleCell);

                var valueCell = new PdfPCell(new Phrase(item.Value, _pdfStyles.CardValueFont))
                {
                    BackgroundColor = item.Color,
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    Padding = 8f,
                    PaddingTop = 4f,
                    PaddingBottom = 6f
                };
                cardTable.AddCell(valueCell);

                if (!string.IsNullOrEmpty(item.Subtitle))
                {
                    var subtitleCell = new PdfPCell(new Phrase(item.Subtitle, _pdfStyles.CardSubtitleFont))
                    {
                        BackgroundColor = item.Color,
                        Border = Rectangle.NO_BORDER,
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        Padding = 8f,
                        PaddingTop = 0f
                    };
                    cardTable.AddCell(subtitleCell);
                }

                var cardCell = new PdfPCell(cardTable)
                {
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 1.5f,
                    Padding = 0f
                };
                summaryTable.AddCell(cardCell);
            }

            document.Add(summaryTable);

            if (!string.IsNullOrEmpty(rodape))
            {
                var rodapeP = new Paragraph(rodape, _pdfStyles.SmallFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 12f
                };
                document.Add(rodapeP);
            }
        }

        #endregion

        #region Métodos Auxiliares PDF - Manutenção

        private void BuildManutencaoPecasResumo(Document document, RelatorioManutencaoResumoDto dados, CultureInfo culture)
        {
            var pecasAgrupadas = dados.Manutencoes
                .SelectMany(m => m.Pecas ?? new List<ManutencaoPecaDto>())
                .GroupBy(p => p.DescricaoPeca)
                .Select(g => new
                {
                    Descricao = g.Key,
                    Quantidade = g.Sum(p => p.Quantidade),
                    ValorTotal = g.Sum(p => p.ValorTotal)
                })
                .OrderByDescending(p => p.ValorTotal)
                .Take(10)
                .ToList();

            if (!pecasAgrupadas.Any())
                return;

            var sectionTitle = new Paragraph("Top 10 Peças mais custosas", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 12f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            var pecasTable = new PdfPTable(3) { WidthPercentage = 100 };
            pecasTable.SetWidths(new float[] { 60f, 20f, 20f });
            pecasTable.SpacingAfter = 12f;

            pecasTable.AddCell(CreateHeaderCell("Peça"));
            pecasTable.AddCell(CreateHeaderCell("Quantidade"));
            pecasTable.AddCell(CreateHeaderCell("Valor Total"));

            foreach (var peca in pecasAgrupadas)
            {
                pecasTable.AddCell(CreateDataCell(peca.Descricao));
                pecasTable.AddCell(CreateDataCell(peca.Quantidade.ToString("N2", culture), Element.ALIGN_RIGHT));
                pecasTable.AddCell(CreateDataCell(peca.ValorTotal.ToString("C2", culture), Element.ALIGN_RIGHT));
            }

            document.Add(pecasTable);
        }

        private void BuildManutencaoCards(Document document, RelatorioManutencaoResumoDto dados, CultureInfo culture)
        {
            var sectionTitle = new Paragraph("Detalhamento de manutenções", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 12f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            var isAlternate = false;
            foreach (var manutencao in dados.Manutencoes.Take(50))
            {
                var bgColor = isAlternate ? _pdfStyles.AlternateRowColor : _pdfStyles.White;

                var cardTable = new PdfPTable(1) { WidthPercentage = 100 };
                cardTable.SpacingAfter = 8f;

                var headerTable = new PdfPTable(2) { WidthPercentage = 100 };
                headerTable.SetWidths(new float[] { 70f, 30f });

                var veiculoText = $"{manutencao.VeiculoPlaca} - {manutencao.VeiculoMarca}";
                headerTable.AddCell(new PdfPCell(new Phrase(veiculoText, _pdfStyles.CardHeaderFont))
                {
                    Border = Rectangle.NO_BORDER,
                    BackgroundColor = bgColor,
                    Padding = 8f
                });

                headerTable.AddCell(new PdfPCell(new Phrase(manutencao.DataManutencao.ToString("dd/MM/yyyy", culture), _pdfStyles.CardDateFont))
                {
                    Border = Rectangle.NO_BORDER,
                    BackgroundColor = bgColor,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 8f
                });

                cardTable.AddCell(new PdfPCell(headerTable)
                {
                    Border = Rectangle.NO_BORDER,
                    BackgroundColor = bgColor,
                    Padding = 0f
                });

                var detailsTable = new PdfPTable(2) { WidthPercentage = 100 };
                detailsTable.SetWidths(new float[] { 30f, 70f });

                detailsTable.AddCell(CreateCardLabelCell("Descrição:", bgColor));
                detailsTable.AddCell(CreateCardValueCell(manutencao.Descricao, bgColor));

                detailsTable.AddCell(CreateCardLabelCell("Fornecedor:", bgColor));
                detailsTable.AddCell(CreateCardValueCell(manutencao.FornecedorNome ?? "Não informado", bgColor));

                detailsTable.AddCell(CreateCardLabelCell("Mão de obra:", bgColor));
                detailsTable.AddCell(CreateCardValueCell(manutencao.ValorMaoObra.ToString("C2", culture), bgColor));

                detailsTable.AddCell(CreateCardLabelCell("Peças:", bgColor));
                detailsTable.AddCell(CreateCardValueCell(manutencao.ValorPecas.ToString("C2", culture), bgColor));

                detailsTable.AddCell(CreateCardLabelCell("Total:", bgColor));
                detailsTable.AddCell(CreateCardValueCell(manutencao.ValorTotal.ToString("C2", culture), bgColor, _pdfStyles.CardValueBoldFont));

                cardTable.AddCell(new PdfPCell(detailsTable)
                {
                    Border = Rectangle.NO_BORDER,
                    BackgroundColor = bgColor,
                    Padding = 0f
                });

                if (manutencao.Pecas != null && manutencao.Pecas.Any())
                {
                    var pecasTitle = new PdfPCell(new Phrase("Peças utilizadas:", _pdfStyles.SmallBoldFont))
                    {
                        Border = Rectangle.NO_BORDER,
                        BackgroundColor = bgColor,
                        Padding = 8f,
                        PaddingTop = 4f
                    };
                    cardTable.AddCell(pecasTitle);

                    var pecasTable = new PdfPTable(4) { WidthPercentage = 95 };
                    pecasTable.SetWidths(new float[] { 50f, 15f, 15f, 20f });

                    foreach (var peca in manutencao.Pecas)
                    {
                        pecasTable.AddCell(CreateSmallCell(peca.DescricaoPeca, bgColor));
                        pecasTable.AddCell(CreateSmallCell($"{peca.Quantidade:N2}", bgColor, Element.ALIGN_RIGHT));
                        pecasTable.AddCell(CreateSmallCell(peca.ValorUnitario.ToString("C2", culture), bgColor, Element.ALIGN_RIGHT));
                        pecasTable.AddCell(CreateSmallCell(peca.ValorTotal.ToString("C2", culture), bgColor, Element.ALIGN_RIGHT));
                    }

                    cardTable.AddCell(new PdfPCell(pecasTable)
                    {
                        Border = Rectangle.NO_BORDER,
                        BackgroundColor = bgColor,
                        Padding = 8f,
                        PaddingTop = 0f
                    });
                }

                var cardCell = new PdfPCell(cardTable)
                {
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 1f,
                    Padding = 0f
                };
                var cardWrapper = new PdfPTable(1) { WidthPercentage = 100 };
                cardWrapper.AddCell(cardCell);
                document.Add(cardWrapper);

                isAlternate = !isAlternate;
            }
        }

        #endregion

        #region Métodos Auxiliares PDF - Despesas

        private void BuildDespesasPorTipo(Document document, RelatorioDespesasResumoDto dados, CultureInfo culture)
        {
            if (!dados.DespesasPorTipo.Any())
                return;

            var sectionTitle = new Paragraph("Despesas por tipo", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 12f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            var tiposTable = new PdfPTable(2) { WidthPercentage = 100 };
            tiposTable.SetWidths(new float[] { 60f, 40f });
            tiposTable.SpacingAfter = 12f;

            tiposTable.AddCell(CreateHeaderCell("Tipo de despesa"));
            tiposTable.AddCell(CreateHeaderCell("Valor total"));

            foreach (var tipo in dados.DespesasPorTipo.OrderByDescending(d => d.Value))
            {
                tiposTable.AddCell(CreateDataCell(tipo.Key));
                tiposTable.AddCell(CreateDataCell(tipo.Value.ToString("C2", culture), Element.ALIGN_RIGHT));
            }

            document.Add(tiposTable);
        }

        private void BuildDespesasCards(Document document, RelatorioDespesasResumoDto dados, CultureInfo culture)
        {
            var sectionTitle = new Paragraph("Detalhamento de viagens", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 12f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            var isAlternate = false;
            foreach (var viagem in dados.Viagens.Take(50))
            {
                var bgColor = isAlternate ? _pdfStyles.AlternateRowColor : _pdfStyles.White;

                var cardTable = new PdfPTable(1) { WidthPercentage = 100 };
                cardTable.SpacingAfter = 8f;

                var headerTable = new PdfPTable(2) { WidthPercentage = 100 };
                headerTable.SetWidths(new float[] { 70f, 30f });

                var veiculoText = $"{viagem.VeiculoPlaca} - {viagem.VeiculoMarca}";
                headerTable.AddCell(new PdfPCell(new Phrase(veiculoText, _pdfStyles.CardHeaderFont))
                {
                    Border = Rectangle.NO_BORDER,
                    BackgroundColor = bgColor,
                    Padding = 8f
                });

                var periodoText = $"{viagem.DataInicio:dd/MM/yyyy} a {viagem.DataFim:dd/MM/yyyy}";
                headerTable.AddCell(new PdfPCell(new Phrase(periodoText, _pdfStyles.CardDateFont))
                {
                    Border = Rectangle.NO_BORDER,
                    BackgroundColor = bgColor,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 8f
                });

                cardTable.AddCell(new PdfPCell(headerTable)
                {
                    Border = Rectangle.NO_BORDER,
                    BackgroundColor = bgColor,
                    Padding = 0f
                });

                var detailsTable = new PdfPTable(2) { WidthPercentage = 100 };
                detailsTable.SetWidths(new float[] { 30f, 70f });

                detailsTable.AddCell(CreateCardLabelCell("Origem/Destino:", bgColor));
                detailsTable.AddCell(CreateCardValueCell(viagem.OrigemDestino ?? "Não informado", bgColor));

                detailsTable.AddCell(CreateCardLabelCell("Duração:", bgColor));
                detailsTable.AddCell(CreateCardValueCell($"{viagem.DuracaoDias} dias", bgColor));

                detailsTable.AddCell(CreateCardLabelCell("Receita:", bgColor));
                detailsTable.AddCell(CreateCardValueCell(viagem.ReceitaTotal.ToString("C2", culture), bgColor));

                detailsTable.AddCell(CreateCardLabelCell("Despesas:", bgColor));
                detailsTable.AddCell(CreateCardValueCell(viagem.TotalDespesas.ToString("C2", culture), bgColor));

                detailsTable.AddCell(CreateCardLabelCell("Saldo:", bgColor));
                var saldoFont = viagem.SaldoLiquido >= 0 ? _pdfStyles.SuccessFont : _pdfStyles.DangerFont;
                detailsTable.AddCell(CreateCardValueCell(viagem.SaldoLiquido.ToString("C2", culture), bgColor, saldoFont));

                cardTable.AddCell(new PdfPCell(detailsTable)
                {
                    Border = Rectangle.NO_BORDER,
                    BackgroundColor = bgColor,
                    Padding = 0f
                });

                if (viagem.Despesas != null && viagem.Despesas.Any())
                {
                    var despesasTitle = new PdfPCell(new Phrase("Despesas detalhadas:", _pdfStyles.SmallBoldFont))
                    {
                        Border = Rectangle.NO_BORDER,
                        BackgroundColor = bgColor,
                        Padding = 8f,
                        PaddingTop = 4f
                    };
                    cardTable.AddCell(despesasTitle);

                    var despesasTable = new PdfPTable(4) { WidthPercentage = 95 };
                    despesasTable.SetWidths(new float[] { 25f, 40f, 15f, 20f });

                    foreach (var despesa in viagem.Despesas)
                    {
                        despesasTable.AddCell(CreateSmallCell(despesa.DataDespesa.ToString("dd/MM/yyyy", culture), bgColor));
                        despesasTable.AddCell(CreateSmallCell($"{despesa.TipoDespesa} - {despesa.Descricao}", bgColor));
                        despesasTable.AddCell(CreateSmallCell(despesa.Local ?? "-", bgColor));
                        despesasTable.AddCell(CreateSmallCell(despesa.Valor.ToString("C2", culture), bgColor, Element.ALIGN_RIGHT));
                    }

                    cardTable.AddCell(new PdfPCell(despesasTable)
                    {
                        Border = Rectangle.NO_BORDER,
                        BackgroundColor = bgColor,
                        Padding = 8f,
                        PaddingTop = 0f
                    });
                }

                var cardCell = new PdfPCell(cardTable)
                {
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 1f,
                    Padding = 0f
                };
                var cardWrapper = new PdfPTable(1) { WidthPercentage = 100 };
                cardWrapper.AddCell(cardCell);
                document.Add(cardWrapper);

                isAlternate = !isAlternate;
            }
        }

        #endregion

        #region Métodos Auxiliares - Células e Formatação

        private PdfPCell CreateHeaderCell(string text)
        {
            return new PdfPCell(new Phrase(text, _pdfStyles.TableHeaderFont))
            {
                BackgroundColor = _pdfStyles.PrimaryColor,
                HorizontalAlignment = Element.ALIGN_CENTER,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 8f,
                Border = Rectangle.BOX,
                BorderColor = _pdfStyles.BorderColor
            };
        }

        private PdfPCell CreateDataCell(string text, int alignment = Element.ALIGN_LEFT)
        {
            return new PdfPCell(new Phrase(text, _pdfStyles.TextFont))
            {
                HorizontalAlignment = alignment,
                VerticalAlignment = Element.ALIGN_MIDDLE,
                Padding = 6f,
                Border = Rectangle.BOX,
                BorderColor = _pdfStyles.BorderColor
            };
        }

        private PdfPCell CreateCardLabelCell(string text, BaseColor bgColor)
        {
            return new PdfPCell(new Phrase(text, _pdfStyles.SmallBoldFont))
            {
                Border = Rectangle.NO_BORDER,
                BackgroundColor = bgColor,
                HorizontalAlignment = Element.ALIGN_LEFT,
                Padding = 8f,
                PaddingTop = 4f,
                PaddingBottom = 4f
            };
        }

        private PdfPCell CreateCardValueCell(string text, BaseColor bgColor, Font? customFont = null)
        {
            var font = customFont ?? _pdfStyles.TextFont;
            return new PdfPCell(new Phrase(text, font))
            {
                Border = Rectangle.NO_BORDER,
                BackgroundColor = bgColor,
                HorizontalAlignment = Element.ALIGN_LEFT,
                Padding = 8f,
                PaddingTop = 4f,
                PaddingBottom = 4f
            };
        }

        private PdfPCell CreateSmallCell(string text, BaseColor bgColor, int alignment = Element.ALIGN_LEFT)
        {
            return new PdfPCell(new Phrase(text, _pdfStyles.SmallFont))
            {
                Border = Rectangle.NO_BORDER,
                BackgroundColor = bgColor,
                HorizontalAlignment = alignment,
                Padding = 4f
            };
        }

        #endregion

        #region Métodos Auxiliares - Utilitários

        private string ObterCaminhoLogo()
        {
            try
            {
                var empresaId = _contextoEmpresa.IdentificadorEmpresa;
                if (string.IsNullOrEmpty(empresaId))
                    return string.Empty;

                var logoPath = Path.Combine(_environment.WebRootPath, "logos", $"{empresaId}.png");
                return File.Exists(logoPath) ? logoPath : string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }

        private PdfOrientation DecideManutencaoOrientation(RelatorioManutencaoResumoDto dados)
        {
            var temMuitasPecas = dados.Manutencoes.Any(m => (m.Pecas?.Count ?? 0) > 3);
            return temMuitasPecas ? PdfOrientation.Landscape : PdfOrientation.Portrait;
        }

        private PdfOrientation DecideDespesasOrientation(RelatorioDespesasResumoDto dados)
        {
            var temMuitasDespesas = dados.Viagens.Any(v => (v.Despesas?.Count ?? 0) > 5);
            return temMuitasDespesas ? PdfOrientation.Landscape : PdfOrientation.Portrait;
        }

        #endregion

        #region Classes Auxiliares

        private enum PdfOrientation
        {
            Portrait,
            Landscape
        }

        private class SummaryItem
        {
            public string Label { get; set; }
            public string Value { get; set; }
            public BaseColor Color { get; set; }
            public string? Subtitle { get; set; }

            public SummaryItem(string label, string value, BaseColor color, string? subtitle = null)
            {
                Label = label;
                Value = value;
                Color = color;
                Subtitle = subtitle;
            }
        }

        private class PdfStyleCatalog
        {
            // Cores
            public BaseColor PrimaryColor { get; } = new BaseColor(41, 128, 185);      // Azul profissional
            public BaseColor SecondaryColor { get; } = new BaseColor(52, 73, 94);      // Cinza escuro
            public BaseColor SuccessColor { get; } = new BaseColor(39, 174, 96);       // Verde
            public BaseColor DangerColor { get; } = new BaseColor(231, 76, 60);        // Vermelho
            public BaseColor WarningColor { get; } = new BaseColor(243, 156, 18);      // Laranja
            public BaseColor InfoColor { get; } = new BaseColor(52, 152, 219);         // Azul claro
            public BaseColor LightGray { get; } = new BaseColor(236, 240, 241);        // Cinza claro
            public BaseColor DarkGray { get; } = new BaseColor(149, 165, 166);         // Cinza médio
            public BaseColor BorderColor { get; } = new BaseColor(189, 195, 199);      // Cinza borda
            public BaseColor AlternateRowColor { get; } = new BaseColor(250, 250, 250); // Branco gelo
            public BaseColor White { get; } = new BaseColor(255, 255, 255);

            // Fontes com suporte a caracteres acentuados usando CP1252
            public Font TitleFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.EMBEDDED, 18, Font.NORMAL, new BaseColor(0, 0, 0));
            public Font SubtitleFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.EMBEDDED, 11, Font.NORMAL, new BaseColor(52, 73, 94));
            public Font MetaFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.EMBEDDED, 9, Font.NORMAL, new BaseColor(149, 165, 166));
            public Font SectionTitleFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.EMBEDDED, 14, Font.NORMAL, new BaseColor(52, 73, 94));
            public Font CardTitleFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.EMBEDDED, 10, Font.NORMAL, new BaseColor(255, 255, 255));
            public Font CardValueFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.EMBEDDED, 16, Font.NORMAL, new BaseColor(255, 255, 255));
            public Font CardValueBoldFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.EMBEDDED, 11, Font.NORMAL, new BaseColor(0, 0, 0));
            public Font CardSubtitleFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.EMBEDDED, 8, Font.NORMAL, new BaseColor(255, 255, 255));
            public Font CardHeaderFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.EMBEDDED, 11, Font.NORMAL, new BaseColor(0, 0, 0));
            public Font CardDateFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.EMBEDDED, 9, Font.NORMAL, new BaseColor(149, 165, 166));
            public Font TableHeaderFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.EMBEDDED, 10, Font.NORMAL, new BaseColor(255, 255, 255));
            public Font TextFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.EMBEDDED, 9, Font.NORMAL, new BaseColor(0, 0, 0));
            public Font SmallFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.EMBEDDED, 8, Font.NORMAL, new BaseColor(0, 0, 0));
            public Font SmallBoldFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.EMBEDDED, 8, Font.NORMAL, new BaseColor(0, 0, 0));
            public Font SuccessFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.EMBEDDED, 11, Font.NORMAL, new BaseColor(39, 174, 96));
            public Font DangerFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.EMBEDDED, 11, Font.NORMAL, new BaseColor(231, 76, 60));
            public Font FooterFont { get; } = FontFactory.GetFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.EMBEDDED, 8, Font.NORMAL, new BaseColor(149, 165, 166));
        }

        private class ReportFooterPageEvent : PdfPageEventHelper
        {
            private readonly PdfStyleCatalog _styles;
            private readonly string _footerText;
            private readonly DateTime _dataGeracao;

            public ReportFooterPageEvent(PdfStyleCatalog styles, string footerText, DateTime dataGeracao)
            {
                _styles = styles;
                _footerText = footerText;
                _dataGeracao = dataGeracao;
            }

            public override void OnEndPage(PdfWriter writer, Document document)
            {
                var cb = writer.DirectContent;
                var pageSize = document.PageSize;

                var line = new LineSeparator(0.5f, 100f, _styles.BorderColor, Element.ALIGN_CENTER, -2f);
                var linePhrase = new Phrase();
                linePhrase.Add(line);
                var lineTable = new PdfPTable(1) { TotalWidth = pageSize.Width - document.LeftMargin - document.RightMargin };
                lineTable.AddCell(new PdfPCell(linePhrase) { Border = Rectangle.NO_BORDER, Padding = 0 });
                lineTable.WriteSelectedRows(0, -1, document.LeftMargin, document.BottomMargin + 24f, cb);

                var footerTable = new PdfPTable(2) { TotalWidth = pageSize.Width - document.LeftMargin - document.RightMargin };
                footerTable.SetWidths(new float[] { 1f, 1f });

                footerTable.AddCell(new PdfPCell(new Phrase(_footerText, _styles.FooterFont))
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_LEFT,
                    VerticalAlignment = Element.ALIGN_MIDDLE
                });

                footerTable.AddCell(new PdfPCell(new Phrase($"Página {writer.PageNumber}", _styles.FooterFont))
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE
                });

                footerTable.WriteSelectedRows(0, -1, document.LeftMargin, document.BottomMargin + 12f, cb);
            }
        }

        #endregion

    }
}

