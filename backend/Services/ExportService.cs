using ClosedXML.Excel;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Backend.Api.Services
{
    public class ExportService : IExportService
    {
        private readonly ILogger<ExportService> _logger;

        public ExportService(ILogger<ExportService> logger)
        {
            _logger = logger;
        }

        #region Relatório de Manutenção

    public byte[] ExportarManutencaoExcel(RelatorioManutencaoResumoDto dados, RelatorioManutencaoFiltroDto filtros)
        {
            try
            {
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Relatório de Manutenção");

                // Configurar estilo do cabeçalho principal
                var headerStyle = workbook.Style;
                headerStyle.Font.Bold = true;
                headerStyle.Font.FontSize = 14;
                headerStyle.Fill.BackgroundColor = XLColor.LightBlue;
                headerStyle.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                // Título do relatório
                worksheet.Cell("A1").Value = "RELATÓRIO DE MANUTENÇÃO DE VEÍCULOS";
                worksheet.Range("A1:G1").Merge().Style = headerStyle;

                // Informações dos filtros
                var row = 3;
                worksheet.Cell($"A{row}").Value = "Filtros Aplicados:";
                worksheet.Cell($"A{row}").Style.Font.Bold = true;
                row++;

                if (filtros.DataInicio.HasValue)
                {
                    worksheet.Cell($"A{row}").Value = $"Data Início: {filtros.DataInicio:dd/MM/yyyy}";
                    row++;
                }

                if (filtros.DataFim.HasValue)
                {
                    worksheet.Cell($"A{row}").Value = $"Data Fim: {filtros.DataFim:dd/MM/yyyy}";
                    row++;
                }

                if (!string.IsNullOrEmpty(filtros.Placa))
                {
                    worksheet.Cell($"A{row}").Value = $"Placa: {filtros.Placa}";
                    row++;
                }

                if (!string.IsNullOrEmpty(filtros.Peca))
                {
                    worksheet.Cell($"A{row}").Value = $"Peça: {filtros.Peca}";
                    row++;
                }

                row += 2; // Espaço entre filtros e resumo

                // Resumo
                worksheet.Cell($"A{row}").Value = "RESUMO GERAL";
                worksheet.Cell($"A{row}").Style.Font.Bold = true;
                worksheet.Cell($"A{row}").Style.Font.FontSize = 12;
                row++;

                worksheet.Cell($"A{row}").Value = "Total de Manutenções:";
                worksheet.Cell($"B{row}").Value = dados.TotalManutencoes;
                worksheet.Cell($"B{row}").Style.NumberFormat.Format = "#,##0";
                row++;

                worksheet.Cell($"A{row}").Value = "Valor Total Mão de Obra:";
                worksheet.Cell($"B{row}").Value = dados.ValorTotalMaoObra;
                worksheet.Cell($"B{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                row++;

                worksheet.Cell($"A{row}").Value = "Valor Total Peças:";
                worksheet.Cell($"B{row}").Value = dados.ValorTotalPecas;
                worksheet.Cell($"B{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                row++;

                worksheet.Cell($"A{row}").Value = "Valor Total Geral:";
                worksheet.Cell($"B{row}").Value = dados.ValorTotalGeral;
                worksheet.Cell($"B{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                worksheet.Cell($"B{row}").Style.Font.Bold = true;
                row += 3;

                // Cabeçalho da tabela
                worksheet.Cell($"A{row}").Value = "Data";
                worksheet.Cell($"B{row}").Value = "Veículo";
                worksheet.Cell($"C{row}").Value = "Descrição";
                worksheet.Cell($"D{row}").Value = "Fornecedor";
                worksheet.Cell($"E{row}").Value = "Mão de Obra";
                worksheet.Cell($"F{row}").Value = "Peças";
                worksheet.Cell($"G{row}").Value = "Total";

                var headerRange = worksheet.Range($"A{row}:G{row}");
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
                headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                row++;

                // Dados das manutenções
                foreach (var manutencao in dados.Manutencoes)
                {
                    worksheet.Cell($"A{row}").Value = manutencao.DataManutencao.ToString("dd/MM/yyyy");
                    worksheet.Cell($"B{row}").Value = $"{manutencao.VeiculoPlaca} - {manutencao.VeiculoMarca}";
                    worksheet.Cell($"C{row}").Value = manutencao.Descricao;
                    worksheet.Cell($"D{row}").Value = manutencao.FornecedorNome ?? "Não informado";
                    worksheet.Cell($"E{row}").Value = manutencao.ValorMaoObra;
                    worksheet.Cell($"F{row}").Value = manutencao.ValorPecas;
                    worksheet.Cell($"G{row}").Value = manutencao.ValorTotal;

                    // Formatação de valores
                    worksheet.Cell($"E{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell($"F{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell($"G{row}").Style.NumberFormat.Format = "R$ #,##0.00";

                    // Bordas
                    worksheet.Range($"A{row}:G{row}").Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

                    row++;
                }

                // Auto ajustar colunas
                worksheet.Columns().AdjustToContents();

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

    public byte[] ExportarManutencaoPdf(RelatorioManutencaoResumoDto dados, RelatorioManutencaoFiltroDto filtros)
        {
            try
            {
                using var stream = new MemoryStream();
                var document = new Document(PageSize.A4.Rotate(), 25, 25, 30, 30);
                var writer = PdfWriter.GetInstance(document, stream);

                document.Open();

                // Fontes
                var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16, new BaseColor(64, 64, 64));
                var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.Black);
                var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, BaseColor.Black);
                var smallFont = FontFactory.GetFont(FontFactory.HELVETICA, 8, BaseColor.Black);

                // Título
                var titleParagraph = new Paragraph("RELATÓRIO DE MANUTENÇÃO DE VEÍCULOS", titleFont);
                titleParagraph.Alignment = Element.ALIGN_CENTER;
                titleParagraph.SpacingAfter = 20f;
                document.Add(titleParagraph);

                // Data de geração
                var dataParagraph = new Paragraph($"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}", normalFont);
                dataParagraph.Alignment = Element.ALIGN_RIGHT;
                dataParagraph.SpacingAfter = 15f;
                document.Add(dataParagraph);

                // Filtros aplicados
                if (filtros.DataInicio.HasValue || filtros.DataFim.HasValue || !string.IsNullOrEmpty(filtros.Placa) || !string.IsNullOrEmpty(filtros.Peca))
                {
                    document.Add(new Paragraph("FILTROS APLICADOS:", headerFont));

                    if (filtros.DataInicio.HasValue)
                        document.Add(new Paragraph($"• Data Início: {filtros.DataInicio:dd/MM/yyyy}", normalFont));

                    if (filtros.DataFim.HasValue)
                        document.Add(new Paragraph($"• Data Fim: {filtros.DataFim:dd/MM/yyyy}", normalFont));

                    if (!string.IsNullOrEmpty(filtros.Placa))
                        document.Add(new Paragraph($"• Placa: {filtros.Placa}", normalFont));

                    if (!string.IsNullOrEmpty(filtros.Peca))
                        document.Add(new Paragraph($"• Peça: {filtros.Peca}", normalFont));

                    document.Add(new Paragraph(" ", normalFont)); // Espaço
                }

                // Resumo
                var resumoTable = new PdfPTable(2);
                resumoTable.WidthPercentage = 50;
                resumoTable.HorizontalAlignment = Element.ALIGN_LEFT;
                resumoTable.SetWidths(new float[] { 3f, 2f });

                resumoTable.AddCell(new PdfPCell(new Phrase("RESUMO GERAL", headerFont))
                {
                    Colspan = 2,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    BackgroundColor = new BaseColor(240, 240, 240),
                    Padding = 8
                });

                resumoTable.AddCell(new PdfPCell(new Phrase("Total de Manutenções:", normalFont)) { Padding = 5 });
                resumoTable.AddCell(new PdfPCell(new Phrase(dados.TotalManutencoes.ToString("N0"), normalFont)) { Padding = 5 });

                resumoTable.AddCell(new PdfPCell(new Phrase("Valor Total Mão de Obra:", normalFont)) { Padding = 5 });
                resumoTable.AddCell(new PdfPCell(new Phrase(dados.ValorTotalMaoObra.ToString("C2", new CultureInfo("pt-BR")), normalFont)) { Padding = 5 });

                resumoTable.AddCell(new PdfPCell(new Phrase("Valor Total Peças:", normalFont)) { Padding = 5 });
                resumoTable.AddCell(new PdfPCell(new Phrase(dados.ValorTotalPecas.ToString("C2", new CultureInfo("pt-BR")), normalFont)) { Padding = 5 });

                resumoTable.AddCell(new PdfPCell(new Phrase("Valor Total Geral:", headerFont)) { Padding = 5 });
                resumoTable.AddCell(new PdfPCell(new Phrase(dados.ValorTotalGeral.ToString("C2", new CultureInfo("pt-BR")), headerFont)) { Padding = 5 });

                document.Add(resumoTable);
                document.Add(new Paragraph(" ", normalFont)); // Espaço

                // Tabela de manutenções
                if (dados.Manutencoes.Any())
                {
                    var table = new PdfPTable(7);
                    table.WidthPercentage = 100;
                    table.SetWidths(new float[] { 1.5f, 2f, 3f, 2f, 1.5f, 1.5f, 1.5f });

                    // Cabeçalho
                    var headers = new[] { "Data", "Veículo", "Descrição", "Fornecedor", "Mão Obra", "Peças", "Total" };
                    foreach (var header in headers)
                    {
                        var cell = new PdfPCell(new Phrase(header, headerFont));
                        cell.BackgroundColor = new BaseColor(240, 240, 240);
                        cell.HorizontalAlignment = Element.ALIGN_CENTER;
                        cell.Padding = 8;
                        table.AddCell(cell);
                    }

                    // Dados
                    foreach (var manutencao in dados.Manutencoes)
                    {
                        table.AddCell(new PdfPCell(new Phrase(manutencao.DataManutencao.ToString("dd/MM/yyyy"), smallFont)) { Padding = 5 });
                        table.AddCell(new PdfPCell(new Phrase($"{manutencao.VeiculoPlaca}\n{manutencao.VeiculoMarca}", smallFont)) { Padding = 5 });
                        table.AddCell(new PdfPCell(new Phrase(manutencao.Descricao, smallFont)) { Padding = 5 });
                        table.AddCell(new PdfPCell(new Phrase(manutencao.FornecedorNome ?? "Não informado", smallFont)) { Padding = 5 });
                        table.AddCell(new PdfPCell(new Phrase(manutencao.ValorMaoObra.ToString("C2", new CultureInfo("pt-BR")), smallFont)) { Padding = 5, HorizontalAlignment = Element.ALIGN_RIGHT });
                        table.AddCell(new PdfPCell(new Phrase(manutencao.ValorPecas.ToString("C2", new CultureInfo("pt-BR")), smallFont)) { Padding = 5, HorizontalAlignment = Element.ALIGN_RIGHT });
                        table.AddCell(new PdfPCell(new Phrase(manutencao.ValorTotal.ToString("C2", new CultureInfo("pt-BR")), smallFont)) { Padding = 5, HorizontalAlignment = Element.ALIGN_RIGHT });
                    }

                    document.Add(table);
                }

                document.Close();
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar relatório de manutenção em PDF");
                throw;
            }
        }

        #endregion

        #region Relatório de Despesas

    public byte[] ExportarDespesasExcel(RelatorioDespesasResumoDto dados, RelatorioDespesasFiltroDto filtros)
        {
            try
            {
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Relatório de Despesas");

                // Configurar estilo do cabeçalho principal
                var headerStyle = workbook.Style;
                headerStyle.Font.Bold = true;
                headerStyle.Font.FontSize = 14;
                headerStyle.Fill.BackgroundColor = XLColor.LightGreen;
                headerStyle.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                // Título do relatório
                worksheet.Cell("A1").Value = "RELATÓRIO DE DESPESAS/RECEITAS DE VIAGENS";
                worksheet.Range("A1:H1").Merge().Style = headerStyle;

                // Informações dos filtros
                var row = 3;
                worksheet.Cell($"A{row}").Value = "Filtros Aplicados:";
                worksheet.Cell($"A{row}").Style.Font.Bold = true;
                row++;

                if (filtros.DataInicio.HasValue)
                {
                    worksheet.Cell($"A{row}").Value = $"Data Início: {filtros.DataInicio:dd/MM/yyyy}";
                    row++;
                }

                if (filtros.DataFim.HasValue)
                {
                    worksheet.Cell($"A{row}").Value = $"Data Fim: {filtros.DataFim:dd/MM/yyyy}";
                    row++;
                }

                if (!string.IsNullOrEmpty(filtros.Placa))
                {
                    worksheet.Cell($"A{row}").Value = $"Placa: {filtros.Placa}";
                    row++;
                }

                if (!string.IsNullOrEmpty(filtros.TipoDespesa))
                {
                    worksheet.Cell($"A{row}").Value = $"Tipo Despesa: {filtros.TipoDespesa}";
                    row++;
                }

                row += 2; // Espaço entre filtros e resumo

                // Resumo
                worksheet.Cell($"A{row}").Value = "RESUMO GERAL";
                worksheet.Cell($"A{row}").Style.Font.Bold = true;
                worksheet.Cell($"A{row}").Style.Font.FontSize = 12;
                row++;

                worksheet.Cell($"A{row}").Value = "Total de Viagens:";
                worksheet.Cell($"B{row}").Value = dados.TotalViagens;
                worksheet.Cell($"B{row}").Style.NumberFormat.Format = "#,##0";
                row++;

                worksheet.Cell($"A{row}").Value = "Receita Total Geral:";
                worksheet.Cell($"B{row}").Value = dados.ReceitaTotalGeral;
                worksheet.Cell($"B{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                row++;

                worksheet.Cell($"A{row}").Value = "Despesa Total Geral:";
                worksheet.Cell($"B{row}").Value = dados.DespesaTotalGeral;
                worksheet.Cell($"B{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                row++;

                worksheet.Cell($"A{row}").Value = "Saldo Líquido Geral:";
                worksheet.Cell($"B{row}").Value = dados.SaldoLiquidoGeral;
                worksheet.Cell($"B{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                worksheet.Cell($"B{row}").Style.Font.Bold = true;
                if (dados.SaldoLiquidoGeral >= 0)
                    worksheet.Cell($"B{row}").Style.Font.FontColor = XLColor.Green;
                else
                    worksheet.Cell($"B{row}").Style.Font.FontColor = XLColor.Red;
                row += 3;

                // Despesas por tipo
                if (dados.DespesasPorTipo.Any())
                {
                    worksheet.Cell($"A{row}").Value = "DESPESAS POR TIPO";
                    worksheet.Cell($"A{row}").Style.Font.Bold = true;
                    worksheet.Cell($"A{row}").Style.Font.FontSize = 12;
                    row++;

                    foreach (var despesaTipo in dados.DespesasPorTipo.OrderByDescending(d => d.Value))
                    {
                        worksheet.Cell($"A{row}").Value = despesaTipo.Key + ":";
                        worksheet.Cell($"B{row}").Value = despesaTipo.Value;
                        worksheet.Cell($"B{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                        row++;
                    }
                    row += 2;
                }

                // Cabeçalho da tabela
                worksheet.Cell($"A{row}").Value = "Período";
                worksheet.Cell($"B{row}").Value = "Veículo";
                worksheet.Cell($"C{row}").Value = "Origem/Destino";
                worksheet.Cell($"D{row}").Value = "Duração";
                worksheet.Cell($"E{row}").Value = "Receita";
                worksheet.Cell($"F{row}").Value = "Despesas";
                worksheet.Cell($"G{row}").Value = "Saldo";

                var headerRange = worksheet.Range($"A{row}:G{row}");
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
                headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                row++;

                // Dados das viagens
                foreach (var viagem in dados.Viagens)
                {
                    worksheet.Cell($"A{row}").Value = $"{viagem.DataInicio:dd/MM/yyyy} - {viagem.DataFim:dd/MM/yyyy}";
                    worksheet.Cell($"B{row}").Value = $"{viagem.VeiculoPlaca} - {viagem.VeiculoMarca}";
                    worksheet.Cell($"C{row}").Value = viagem.OrigemDestino ?? "Não informado";
                    worksheet.Cell($"D{row}").Value = $"{viagem.DuracaoDias} dias";
                    worksheet.Cell($"E{row}").Value = viagem.ReceitaTotal;
                    worksheet.Cell($"F{row}").Value = viagem.TotalDespesas;
                    worksheet.Cell($"G{row}").Value = viagem.SaldoLiquido;

                    // Formatação de valores
                    worksheet.Cell($"E{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell($"F{row}").Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell($"G{row}").Style.NumberFormat.Format = "R$ #,##0.00";

                    // Cor do saldo
                    if (viagem.SaldoLiquido >= 0)
                        worksheet.Cell($"G{row}").Style.Font.FontColor = XLColor.Green;
                    else
                        worksheet.Cell($"G{row}").Style.Font.FontColor = XLColor.Red;

                    // Bordas
                    worksheet.Range($"A{row}:G{row}").Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

                    row++;
                }

                // Auto ajustar colunas
                worksheet.Columns().AdjustToContents();

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

    public byte[] ExportarDespesasPdf(RelatorioDespesasResumoDto dados, RelatorioDespesasFiltroDto filtros)
        {
            try
            {
                using var stream = new MemoryStream();
                var document = new Document(PageSize.A4.Rotate(), 25, 25, 30, 30);
                var writer = PdfWriter.GetInstance(document, stream);

                document.Open();

                // Fontes
                var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16, new BaseColor(64, 64, 64));
                var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.Black);
                var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, BaseColor.Black);
                var smallFont = FontFactory.GetFont(FontFactory.HELVETICA, 8, BaseColor.Black);

                // Título
                var titleParagraph = new Paragraph("RELATÓRIO DE DESPESAS/RECEITAS DE VIAGENS", titleFont);
                titleParagraph.Alignment = Element.ALIGN_CENTER;
                titleParagraph.SpacingAfter = 20f;
                document.Add(titleParagraph);

                // Data de geração
                var dataParagraph = new Paragraph($"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}", normalFont);
                dataParagraph.Alignment = Element.ALIGN_RIGHT;
                dataParagraph.SpacingAfter = 15f;
                document.Add(dataParagraph);

                // Filtros aplicados
                if (filtros.DataInicio.HasValue || filtros.DataFim.HasValue || !string.IsNullOrEmpty(filtros.Placa) || !string.IsNullOrEmpty(filtros.TipoDespesa))
                {
                    document.Add(new Paragraph("FILTROS APLICADOS:", headerFont));

                    if (filtros.DataInicio.HasValue)
                        document.Add(new Paragraph($"• Data Início: {filtros.DataInicio:dd/MM/yyyy}", normalFont));

                    if (filtros.DataFim.HasValue)
                        document.Add(new Paragraph($"• Data Fim: {filtros.DataFim:dd/MM/yyyy}", normalFont));

                    if (!string.IsNullOrEmpty(filtros.Placa))
                        document.Add(new Paragraph($"• Placa: {filtros.Placa}", normalFont));

                    if (!string.IsNullOrEmpty(filtros.TipoDespesa))
                        document.Add(new Paragraph($"• Tipo Despesa: {filtros.TipoDespesa}", normalFont));

                    document.Add(new Paragraph(" ", normalFont)); // Espaço
                }

                // Resumo
                var resumoTable = new PdfPTable(2);
                resumoTable.WidthPercentage = 50;
                resumoTable.HorizontalAlignment = Element.ALIGN_LEFT;
                resumoTable.SetWidths(new float[] { 3f, 2f });

                resumoTable.AddCell(new PdfPCell(new Phrase("RESUMO GERAL", headerFont))
                {
                    Colspan = 2,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    BackgroundColor = new BaseColor(240, 240, 240),
                    Padding = 8
                });

                resumoTable.AddCell(new PdfPCell(new Phrase("Total de Viagens:", normalFont)) { Padding = 5 });
                resumoTable.AddCell(new PdfPCell(new Phrase(dados.TotalViagens.ToString("N0"), normalFont)) { Padding = 5 });

                resumoTable.AddCell(new PdfPCell(new Phrase("Receita Total Geral:", normalFont)) { Padding = 5 });
                resumoTable.AddCell(new PdfPCell(new Phrase(dados.ReceitaTotalGeral.ToString("C2", new CultureInfo("pt-BR")), normalFont)) { Padding = 5 });

                resumoTable.AddCell(new PdfPCell(new Phrase("Despesa Total Geral:", normalFont)) { Padding = 5 });
                resumoTable.AddCell(new PdfPCell(new Phrase(dados.DespesaTotalGeral.ToString("C2", new CultureInfo("pt-BR")), normalFont)) { Padding = 5 });

                var saldoColor = dados.SaldoLiquidoGeral >= 0 ? new BaseColor(0, 128, 0) : new BaseColor(255, 0, 0);
                var saldoFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, saldoColor);
                resumoTable.AddCell(new PdfPCell(new Phrase("Saldo Líquido Geral:", headerFont)) { Padding = 5 });
                resumoTable.AddCell(new PdfPCell(new Phrase(dados.SaldoLiquidoGeral.ToString("C2", new CultureInfo("pt-BR")), saldoFont)) { Padding = 5 });

                document.Add(resumoTable);
                document.Add(new Paragraph(" ", normalFont)); // Espaço

                // Tabela de viagens
                if (dados.Viagens.Any())
                {
                    var table = new PdfPTable(7);
                    table.WidthPercentage = 100;
                    table.SetWidths(new float[] { 2f, 2f, 2.5f, 1f, 1.5f, 1.5f, 1.5f });

                    // Cabeçalho
                    var headers = new[] { "Período", "Veículo", "Origem/Destino", "Duração", "Receita", "Despesas", "Saldo" };
                    foreach (var header in headers)
                    {
                        var cell = new PdfPCell(new Phrase(header, headerFont));
                        cell.BackgroundColor = new BaseColor(240, 240, 240);
                        cell.HorizontalAlignment = Element.ALIGN_CENTER;
                        cell.Padding = 8;
                        table.AddCell(cell);
                    }

                    // Dados
                    foreach (var viagem in dados.Viagens)
                    {
                        table.AddCell(new PdfPCell(new Phrase($"{viagem.DataInicio:dd/MM/yyyy}\n{viagem.DataFim:dd/MM/yyyy}", smallFont)) { Padding = 5 });
                        table.AddCell(new PdfPCell(new Phrase($"{viagem.VeiculoPlaca}\n{viagem.VeiculoMarca}", smallFont)) { Padding = 5 });
                        table.AddCell(new PdfPCell(new Phrase(viagem.OrigemDestino ?? "Não informado", smallFont)) { Padding = 5 });
                        table.AddCell(new PdfPCell(new Phrase($"{viagem.DuracaoDias} dias", smallFont)) { Padding = 5, HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase(viagem.ReceitaTotal.ToString("C2", new CultureInfo("pt-BR")), smallFont)) { Padding = 5, HorizontalAlignment = Element.ALIGN_RIGHT });
                        table.AddCell(new PdfPCell(new Phrase(viagem.TotalDespesas.ToString("C2", new CultureInfo("pt-BR")), smallFont)) { Padding = 5, HorizontalAlignment = Element.ALIGN_RIGHT });

                        var saldoViagemColor = viagem.SaldoLiquido >= 0 ? new BaseColor(0, 128, 0) : new BaseColor(255, 0, 0);
                        var saldoViagemFont = FontFactory.GetFont(FontFactory.HELVETICA, 8, saldoViagemColor);
                        table.AddCell(new PdfPCell(new Phrase(viagem.SaldoLiquido.ToString("C2", new CultureInfo("pt-BR")), saldoViagemFont)) { Padding = 5, HorizontalAlignment = Element.ALIGN_RIGHT });
                    }

                    document.Add(table);
                }

                document.Close();
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar relatório de despesas em PDF");
                throw;
            }
        }

        #endregion

        #region Métodos Assíncronos Otimizados

        public async Task<byte[]> ExportarManutencaoExcelAsync(SistemaContext context, RelatorioManutencaoFiltroDto filtros)
        {
            try
            {
                // Buscar dados otimizados diretamente do banco
                var query = context.ManutencaoVeiculos
                    .Include(m => m.Veiculo)
                    .Include(m => m.Fornecedor)
                    .Include(m => m.Pecas)
                    .AsQueryable();

                // Aplicar filtros
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

                // Calcular totais
                var totalManutencoes = await query.CountAsync();
                var valorTotalMaoObra = await query.SumAsync(m => m.ValorMaoObra);
                var valorTotalPecas = await query.SelectMany(m => m.Pecas).SumAsync(p => p.ValorTotal);
                var valorTotalGeral = valorTotalMaoObra + valorTotalPecas;

                // Buscar as manutenções (limitado para exportação)
                var manutencoes = await query
                    .OrderByDescending(m => m.DataManutencao)
                    .Take(10000) // Limite de segurança
                    .ToListAsync();

                // Montar resumo
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
                        VeiculoPlaca = m.Veiculo?.Placa ?? "",
                        VeiculoMarca = m.Veiculo?.Marca ?? "",
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

                // Chamar método legado
                return ExportarManutencaoExcel(resumo, filtros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar relatório de manutenção para Excel (async)");
                throw;
            }
        }

        public async Task<byte[]> ExportarManutencaoPdfAsync(SistemaContext context, RelatorioManutencaoFiltroDto filtros)
        {
            try
            {
                // Buscar dados otimizados diretamente do banco
                var query = context.ManutencaoVeiculos
                    .Include(m => m.Veiculo)
                    .Include(m => m.Fornecedor)
                    .Include(m => m.Pecas)
                    .AsQueryable();

                // Aplicar filtros
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

                // Calcular totais
                var totalManutencoes = await query.CountAsync();
                var valorTotalMaoObra = await query.SumAsync(m => m.ValorMaoObra);
                var valorTotalPecas = await query.SelectMany(m => m.Pecas).SumAsync(p => p.ValorTotal);
                var valorTotalGeral = valorTotalMaoObra + valorTotalPecas;

                // Buscar as manutenções (limitado para exportação)
                var manutencoes = await query
                    .OrderByDescending(m => m.DataManutencao)
                    .Take(10000) // Limite de segurança
                    .ToListAsync();

                // Montar resumo
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
                        VeiculoPlaca = m.Veiculo?.Placa ?? "",
                        VeiculoMarca = m.Veiculo?.Marca ?? "",
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

                // Chamar método legado
                return ExportarManutencaoPdf(resumo, filtros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar relatório de manutenção para PDF (async)");
                throw;
            }
        }

        public async Task<byte[]> ExportarDespesasExcelAsync(SistemaContext context, RelatorioDespesasFiltroDto filtros)
        {
            try
            {
                // Buscar dados otimizados diretamente do banco
                var query = context.Viagens
                    .Include(v => v.Veiculo)
                    .Include(v => v.Despesas)
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
                    var tipoDespesaLower = filtros.TipoDespesa.ToLower();
                    query = query.Where(v => v.Despesas.Any(d => d.TipoDespesa.ToLower().Contains(tipoDespesaLower)));
                }

                // Calcular totais
                var totalViagens = await query.CountAsync();
                var receitaTotalGeral = await query.SumAsync(v => v.ReceitaTotal);
                var despesaTotalGeral = await query.SelectMany(v => v.Despesas).SumAsync(d => d.Valor);
                var saldoLiquidoGeral = receitaTotalGeral - despesaTotalGeral;

                // Calcular despesas por tipo
                var despesasPorTipo = await query
                    .SelectMany(v => v.Despesas)
                    .GroupBy(d => d.TipoDespesa)
                    .Select(g => new { TipoDespesa = g.Key, Total = g.Sum(d => d.Valor) })
                    .ToDictionaryAsync(g => g.TipoDespesa, g => g.Total);

                // Buscar as viagens (limitado para exportação)
                var viagens = await query
                    .OrderByDescending(v => v.DataInicio)
                    .Take(10000) // Limite de segurança
                    .ToListAsync();

                // Montar resumo
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
                        VeiculoPlaca = v.Veiculo?.Placa ?? "",
                        VeiculoMarca = v.Veiculo?.Marca ?? "",
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

                // Chamar método legado
                return ExportarDespesasExcel(resumo, filtros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar relatório de despesas para Excel (async)");
                throw;
            }
        }

        public async Task<byte[]> ExportarDespesasPdfAsync(SistemaContext context, RelatorioDespesasFiltroDto filtros)
        {
            try
            {
                // Buscar dados otimizados diretamente do banco
                var query = context.Viagens
                    .Include(v => v.Veiculo)
                    .Include(v => v.Despesas)
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
                    var tipoDespesaLower = filtros.TipoDespesa.ToLower();
                    query = query.Where(v => v.Despesas.Any(d => d.TipoDespesa.ToLower().Contains(tipoDespesaLower)));
                }

                // Calcular totais
                var totalViagens = await query.CountAsync();
                var receitaTotalGeral = await query.SumAsync(v => v.ReceitaTotal);
                var despesaTotalGeral = await query.SelectMany(v => v.Despesas).SumAsync(d => d.Valor);
                var saldoLiquidoGeral = receitaTotalGeral - despesaTotalGeral;

                // Calcular despesas por tipo
                var despesasPorTipo = await query
                    .SelectMany(v => v.Despesas)
                    .GroupBy(d => d.TipoDespesa)
                    .Select(g => new { TipoDespesa = g.Key, Total = g.Sum(d => d.Valor) })
                    .ToDictionaryAsync(g => g.TipoDespesa, g => g.Total);

                // Buscar as viagens (limitado para exportação)
                var viagens = await query
                    .OrderByDescending(v => v.DataInicio)
                    .Take(10000) // Limite de segurança
                    .ToListAsync();

                // Montar resumo
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
                        VeiculoPlaca = v.Veiculo?.Placa ?? "",
                        VeiculoMarca = v.Veiculo?.Marca ?? "",
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

                // Chamar método legado
                return ExportarDespesasPdf(resumo, filtros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar relatório de despesas para PDF (async)");
                throw;
            }
        }

        #endregion
    }
}
