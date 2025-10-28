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

                // Cores minimalistas
                var darkGray = XLColor.FromArgb(52, 58, 64);      // Cinza escuro para cabeçalhos
                var lightGray = XLColor.FromArgb(248, 249, 250);  // Cinza muito claro para alternância
                var mediumGray = XLColor.FromArgb(108, 117, 125); // Cinza médio para textos secundários

                var row = 1;

                // Título principal - simples e elegante
                var titleRange = worksheet.Range("A1:G1");
                titleRange.Merge();
                titleRange.Value = filtros.TituloRelatorio ?? "RELATÓRIO DE MANUTENÇÃO DE VEÍCULOS";
                titleRange.Style.Font.Bold = true;
                titleRange.Style.Font.FontSize = 14;
                titleRange.Style.Font.FontColor = darkGray;
                titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                worksheet.Row(1).Height = 24;
                row++;

                // Período
                var periodo = $"Período: {filtros.DataInicio?.ToString("dd/MM/yyyy") ?? "Todos"} até {filtros.DataFim?.ToString("dd/MM/yyyy") ?? "Todos"}";
                worksheet.Cell(row, 1).Value = periodo;
                worksheet.Cell(row, 1).Style.Font.FontSize = 9;
                worksheet.Cell(row, 1).Style.Font.FontColor = mediumGray;
                row++;

                // Solicitante e data de geração
                if (!string.IsNullOrWhiteSpace(filtros.UsuarioSolicitante))
                {
                    worksheet.Cell(row, 1).Value = $"Solicitante: {filtros.UsuarioSolicitante}";
                    worksheet.Cell(row, 1).Style.Font.FontSize = 9;
                    worksheet.Cell(row, 1).Style.Font.FontColor = mediumGray;
                    row++;
                }

                worksheet.Cell(row, 1).Value = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}";
                worksheet.Cell(row, 1).Style.Font.FontSize = 9;
                worksheet.Cell(row, 1).Style.Font.FontColor = mediumGray;
                row += 2;

                // Resumo em formato de tabela limpa
                var ticketMedio = dados.TotalManutencoes > 0 ? dados.ValorTotalGeral / dados.TotalManutencoes : 0m;

                var summaryData = new (string Label, string Value)[]
                {
                    ("Total de manutenções", dados.TotalManutencoes.ToString("#,##0")),
                    ("Mão de obra", dados.ValorTotalMaoObra.ToString("C2")),
                    ("Peças", dados.ValorTotalPecas.ToString("C2")),
                    ("Total geral", dados.ValorTotalGeral.ToString("C2")),
                    ("Ticket médio", ticketMedio.ToString("C2"))
                };

                foreach (var (label, value) in summaryData)
                {
                    worksheet.Cell(row, 1).Value = label;
                    worksheet.Cell(row, 1).Style.Font.FontSize = 10;
                    worksheet.Cell(row, 1).Style.Font.FontColor = darkGray;

                    worksheet.Cell(row, 2).Value = value;
                    worksheet.Cell(row, 2).Style.Font.FontSize = 10;
                    worksheet.Cell(row, 2).Style.Font.Bold = true;
                    worksheet.Cell(row, 2).Style.Font.FontColor = darkGray;

                    row++;
                }

                row += 2;

                // Cabeçalho da tabela de detalhamento
                var detailHeaders = new[] { "Data", "Veículo", "Descrição", "Fornecedor", "Mão de obra", "Peças", "Total" };
                for (var i = 0; i < detailHeaders.Length; i++)
                {
                    var cell = worksheet.Cell(row, i + 1);
                    cell.Value = detailHeaders[i];
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.FontSize = 10;
                    cell.Style.Font.FontColor = XLColor.White;
                    cell.Style.Fill.BackgroundColor = darkGray;
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    cell.Style.Border.OutsideBorderColor = darkGray;
                }

                var detailHeaderRow = row;
                row++;

                // Linhas de dados - alternadas com cinza muito claro
                var alternate = false;
                foreach (var manutencao in dados.Manutencoes)
                {
                    worksheet.Cell(row, 1).Value = manutencao.DataManutencao.ToString("dd/MM/yyyy");
                    worksheet.Cell(row, 2).Value = $"{manutencao.VeiculoPlaca} - {manutencao.VeiculoMarca}";
                    worksheet.Cell(row, 3).Value = manutencao.Descricao;
                    worksheet.Cell(row, 4).Value = manutencao.FornecedorNome ?? "Não informado";
                    worksheet.Cell(row, 5).Value = manutencao.ValorMaoObra;
                    worksheet.Cell(row, 6).Value = manutencao.ValorPecas;
                    worksheet.Cell(row, 7).Value = manutencao.ValorTotal;

                    // Formatação monetária
                    worksheet.Cell(row, 5).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 6).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 7).Style.NumberFormat.Format = "R$ #,##0.00";

                    var detailRange = worksheet.Range(row, 1, row, 7);
                    detailRange.Style.Font.FontSize = 9;
                    detailRange.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
                    detailRange.Style.Border.BottomBorderColor = XLColor.FromArgb(222, 226, 230);
                    detailRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    
                    if (alternate)
                    {
                        detailRange.Style.Fill.BackgroundColor = lightGray;
                    }

                    alternate = !alternate;
                    row++;
                }

                // Ajuste de largura das colunas para paisagem A4
                worksheet.Column(1).Width = 11;  // Data
                worksheet.Column(2).Width = 22;  // Veículo
                worksheet.Column(3).Width = 38;  // Descrição
                worksheet.Column(4).Width = 24;  // Fornecedor
                worksheet.Column(5).Width = 13;  // Mão de obra
                worksheet.Column(6).Width = 13;  // Peças
                worksheet.Column(7).Width = 13;  // Total

                // Congelar linha do cabeçalho
                worksheet.SheetView.FreezeRows(detailHeaderRow);

                // Configurar página para paisagem A4
                worksheet.PageSetup.PageOrientation = XLPageOrientation.Landscape;
                worksheet.PageSetup.PaperSize = XLPaperSize.A4Paper;
                worksheet.PageSetup.FitToPages(1, 0); // Ajustar largura em 1 página
                worksheet.PageSetup.Margins.Left = 0.5;
                worksheet.PageSetup.Margins.Right = 0.5;
                worksheet.PageSetup.Margins.Top = 0.75;
                worksheet.PageSetup.Margins.Bottom = 0.75;
                worksheet.PageSetup.PrintAreas.Add($"A1:G{row - 1}");

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
                var pageSize = PageSize.A4; // Sempre vertical

                using var stream = new MemoryStream();
                var document = new Document(pageSize, 40f, 40f, 50f, 50f);
                var writer = PdfWriter.GetInstance(document, stream);

                var dataGeracao = DateTime.Now;
                var rodapeTexto = "Relatório gerado automaticamente pelo Sistema Irrigação Penápolis";
                writer.PageEvent = new ReportFooterPageEvent(_pdfStyles, rodapeTexto, dataGeracao);

                document.Open();

                BuildManutencaoHeaderClean(document, dados, filtros, dataGeracao, culture);

                var ticketMedio = dados.TotalManutencoes > 0
                    ? dados.ValorTotalGeral / dados.TotalManutencoes
                    : 0m;

                AddManutencaoSummaryClean(document, dados, ticketMedio, culture);

                BuildManutencaoPecasResumoClean(document, dados, culture);
                BuildManutencaoListClean(document, dados, culture);

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

        #region Relatório de Viagem - Excel

        public byte[] ExportarViagemExcel(RelatorioViagemResumoDto dados, RelatorioViagemFiltroDto filtros)
        {
            try
            {
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("RelatorioViagens");

                // Cores minimalistas
                var darkGray = XLColor.FromArgb(52, 58, 64);      // Cinza escuro para cabeçalhos
                var lightGray = XLColor.FromArgb(248, 249, 250);  // Cinza muito claro para alternância
                var mediumGray = XLColor.FromArgb(108, 117, 125); // Cinza médio para textos secundários
                var successGreen = XLColor.FromArgb(40, 167, 69); // Verde para valores positivos
                var dangerRed = XLColor.FromArgb(220, 53, 69);    // Vermelho para valores negativos

                var row = 1;

                // Título principal - simples e elegante
                var titleRange = worksheet.Range("A1:G1");
                titleRange.Merge();
                titleRange.Value = filtros.TituloRelatorio ?? "RELATÓRIO DE VIAGENS - RECEITAS E DESPESAS";
                titleRange.Style.Font.Bold = true;
                titleRange.Style.Font.FontSize = 14;
                titleRange.Style.Font.FontColor = darkGray;
                titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                worksheet.Row(1).Height = 24;
                row++;

                // Período
                var periodo = $"Período: {filtros.DataInicio?.ToString("dd/MM/yyyy") ?? "Todos"} até {filtros.DataFim?.ToString("dd/MM/yyyy") ?? "Todos"}";
                worksheet.Cell(row, 1).Value = periodo;
                worksheet.Cell(row, 1).Style.Font.FontSize = 9;
                worksheet.Cell(row, 1).Style.Font.FontColor = mediumGray;
                row++;

                // Solicitante e data de geração
                if (!string.IsNullOrWhiteSpace(filtros.UsuarioSolicitante))
                {
                    worksheet.Cell(row, 1).Value = $"Solicitante: {filtros.UsuarioSolicitante}";
                    worksheet.Cell(row, 1).Style.Font.FontSize = 9;
                    worksheet.Cell(row, 1).Style.Font.FontColor = mediumGray;
                    row++;
                }

                worksheet.Cell(row, 1).Value = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}";
                worksheet.Cell(row, 1).Style.Font.FontSize = 9;
                worksheet.Cell(row, 1).Style.Font.FontColor = mediumGray;
                row += 2;

                // Resumo em formato de tabela limpa
                var saldoMedio = dados.TotalViagens > 0 ? dados.SaldoLiquidoGeral / dados.TotalViagens : 0m;

                var summaryData = new (string Label, string Value, bool IsHighlight)[]
                {
                    ("Total de viagens", dados.TotalViagens.ToString("#,##0"), false),
                    ("Receita total", dados.ReceitaTotalGeral.ToString("C2"), false),
                    ("Despesas totais", dados.DespesaTotalGeral.ToString("C2"), false),
                    ("Saldo líquido", dados.SaldoLiquidoGeral.ToString("C2"), true),
                    ("Saldo médio", saldoMedio.ToString("C2"), false)
                };

                foreach (var (label, value, isHighlight) in summaryData)
                {
                    worksheet.Cell(row, 1).Value = label;
                    worksheet.Cell(row, 1).Style.Font.FontSize = 10;
                    worksheet.Cell(row, 1).Style.Font.FontColor = darkGray;

                    worksheet.Cell(row, 2).Value = value;
                    worksheet.Cell(row, 2).Style.Font.FontSize = 10;
                    worksheet.Cell(row, 2).Style.Font.Bold = isHighlight;
                    
                    if (isHighlight && label.Contains("líquido"))
                    {
                        worksheet.Cell(row, 2).Style.Font.FontColor = dados.SaldoLiquidoGeral >= 0 ? successGreen : dangerRed;
                    }
                    else
                    {
                        worksheet.Cell(row, 2).Style.Font.FontColor = darkGray;
                    }

                    row++;
                }

                row += 2;

                // Despesas por tipo (se houver)
                if (dados.DespesasPorTipo.Any())
                {
                    worksheet.Cell(row, 1).Value = "Despesas por tipo";
                    worksheet.Cell(row, 1).Style.Font.Bold = true;
                    worksheet.Cell(row, 1).Style.Font.FontSize = 11;
                    worksheet.Cell(row, 1).Style.Font.FontColor = darkGray;
                    row++;

                    // Cabeçalho
                    worksheet.Cell(row, 1).Value = "Tipo";
                    worksheet.Cell(row, 2).Value = "Valor";
                    var headerRange = worksheet.Range(row, 1, row, 2);
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Font.FontSize = 10;
                    headerRange.Style.Font.FontColor = XLColor.White;
                    headerRange.Style.Fill.BackgroundColor = darkGray;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    headerRange.Style.Border.OutsideBorderColor = darkGray;
                    row++;

                    var alternateTipo = false;
                    foreach (var despesaTipo in dados.DespesasPorTipo.OrderByDescending(d => d.Value))
                    {
                        worksheet.Cell(row, 1).Value = despesaTipo.Key;
                        worksheet.Cell(row, 2).Value = despesaTipo.Value;
                        worksheet.Cell(row, 2).Style.NumberFormat.Format = "R$ #,##0.00";

                        var despesaRange = worksheet.Range(row, 1, row, 2);
                        despesaRange.Style.Font.FontSize = 9;
                        despesaRange.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
                        despesaRange.Style.Border.BottomBorderColor = XLColor.FromArgb(222, 226, 230);
                        
                        if (alternateTipo)
                        {
                            despesaRange.Style.Fill.BackgroundColor = lightGray;
                        }

                        alternateTipo = !alternateTipo;
                        row++;
                    }

                    row += 2;
                }

                // Detalhamento de viagens
                worksheet.Cell(row, 1).Value = "Detalhamento de viagens";
                worksheet.Cell(row, 1).Style.Font.Bold = true;
                worksheet.Cell(row, 1).Style.Font.FontSize = 11;
                worksheet.Cell(row, 1).Style.Font.FontColor = darkGray;
                row++;

                var detailHeaders = new[] { "Período", "Veículo", "Origem/Destino", "Duração", "Receita", "Despesas", "Saldo" };
                for (var i = 0; i < detailHeaders.Length; i++)
                {
                    var cell = worksheet.Cell(row, i + 1);
                    cell.Value = detailHeaders[i];
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.FontSize = 10;
                    cell.Style.Font.FontColor = XLColor.White;
                    cell.Style.Fill.BackgroundColor = darkGray;
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    cell.Style.Border.OutsideBorderColor = darkGray;
                }

                var detailHeaderRow = row;
                row++;

                // Linhas de dados
                var alternateViagem = false;
                foreach (var viagem in dados.Viagens)
                {
                    worksheet.Cell(row, 1).Value = $"{viagem.DataInicio:dd/MM/yyyy} - {viagem.DataFim:dd/MM/yyyy}";
                    worksheet.Cell(row, 2).Value = $"{viagem.VeiculoPlaca} - {viagem.VeiculoMarca}";
                    worksheet.Cell(row, 3).Value = viagem.OrigemDestino ?? "Não informado";
                    worksheet.Cell(row, 4).Value = $"{viagem.DuracaoDias} dias";
                    worksheet.Cell(row, 5).Value = viagem.ReceitaTotal;
                    worksheet.Cell(row, 6).Value = viagem.TotalDespesas;
                    worksheet.Cell(row, 7).Value = viagem.SaldoLiquido;

                    worksheet.Cell(row, 5).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 6).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 7).Style.NumberFormat.Format = "R$ #,##0.00";
                    worksheet.Cell(row, 7).Style.Font.FontColor = viagem.SaldoLiquido >= 0 ? successGreen : dangerRed;

                    var detailRange = worksheet.Range(row, 1, row, 7);
                    detailRange.Style.Font.FontSize = 9;
                    detailRange.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
                    detailRange.Style.Border.BottomBorderColor = XLColor.FromArgb(222, 226, 230);
                    detailRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    
                    if (alternateViagem)
                    {
                        detailRange.Style.Fill.BackgroundColor = lightGray;
                    }

                    alternateViagem = !alternateViagem;
                    row++;
                }

                // Ajuste de largura das colunas para paisagem A4
                worksheet.Column(1).Width = 18;  // Período
                worksheet.Column(2).Width = 22;  // Veículo
                worksheet.Column(3).Width = 35;  // Origem/Destino
                worksheet.Column(4).Width = 10;  // Duração
                worksheet.Column(5).Width = 13;  // Receita
                worksheet.Column(6).Width = 13;  // Despesas
                worksheet.Column(7).Width = 13;  // Saldo

                // Congelar linha do cabeçalho
                worksheet.SheetView.FreezeRows(detailHeaderRow);

                // Configurar página para paisagem A4
                worksheet.PageSetup.PageOrientation = XLPageOrientation.Landscape;
                worksheet.PageSetup.PaperSize = XLPaperSize.A4Paper;
                worksheet.PageSetup.FitToPages(1, 0); // Ajustar largura em 1 página
                worksheet.PageSetup.Margins.Left = 0.5;
                worksheet.PageSetup.Margins.Right = 0.5;
                worksheet.PageSetup.Margins.Top = 0.75;
                worksheet.PageSetup.Margins.Bottom = 0.75;
                worksheet.PageSetup.PrintAreas.Add($"A1:G{row - 1}");

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

        #region Relatório de Viagem - PDF

        public byte[] ExportarViagemPdf(RelatorioViagemResumoDto dados, RelatorioViagemFiltroDto filtros)
        {
            try
            {
                _logger.LogWarning("🎨 [PDF VIAGEM] MÉTODO MODERNO EXECUTANDO - Build: {BuildDate}", DateTime.Now);
                _logger.LogWarning("🎨 [PDF VIAGEM] Total de viagens: {Total}", dados.TotalViagens);
                
                var culture = new CultureInfo("pt-BR");
                var pageSize = PageSize.A4; // Sempre vertical, igual ao de manutenção

                using var stream = new MemoryStream();
                var document = new Document(pageSize, 40f, 40f, 50f, 50f);
                var writer = PdfWriter.GetInstance(document, stream);

                var dataGeracao = DateTime.Now;
                var rodapeTexto = "Relatório gerado automaticamente pelo Sistema Irrigação Penápolis";
                writer.PageEvent = new ReportFooterPageEvent(_pdfStyles, rodapeTexto, dataGeracao);

                document.Open();

                BuildViagemHeaderClean(document, dados, filtros, dataGeracao, culture);

                var saldoMedio = dados.TotalViagens > 0 ? dados.SaldoLiquidoGeral / dados.TotalViagens : 0m;

                AddViagemSummaryClean(document, dados, saldoMedio, culture);
                BuildViagemDespesasResumoClean(document, dados, culture);
                BuildViagemListClean(document, dados, culture);

                document.Close();
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar Relatório de viagens em PDF");
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

        public async Task<byte[]> ExportarViagemExcelAsync(SistemaContext context, RelatorioViagemFiltroDto filtros)
        {
            try
            {
                var query = context.Viagens
                    .Include(v => v.Veiculo)
                    .Include(v => v.Condutor)
                    .Include(v => v.Despesas)
                    .AsQueryable();

                // Filtros básicos
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

                // Novos filtros avançados
                if (filtros.CondutorId.HasValue)
                    query = query.Where(v => v.CondutorId == filtros.CondutorId.Value);

                var totalViagens = await query.CountAsync();
                var receitaTotalGeral = await query.SumAsync(v => v.ReceitaTotal);
                var despesaTotalGeral = await query.SelectMany(v => v.Despesas).SumAsync(d => d.Valor);
                var saldoLiquidoGeral = receitaTotalGeral - despesaTotalGeral;

                var despesasPorTipo = await query
                    .SelectMany(v => v.Despesas)
                    .GroupBy(d => d.TipoDespesa)
                    .Select(g => new { TipoDespesa = g.Key, Total = g.Sum(d => d.Valor) })
                    .ToDictionaryAsync(g => g.TipoDespesa, g => g.Total);

                // Aplicar ordenação e limitar a 10000 registros para evitar problemas de performance
                var viagensQuery = query
                    .OrderByDescending(v => v.DataInicio)
                    .Take(10000);

                var viagens = await viagensQuery.ToListAsync();

                var resumo = new RelatorioViagemResumoDto
                {
                    TotalViagens = totalViagens,
                    ReceitaTotalGeral = receitaTotalGeral,
                    DespesaTotalGeral = despesaTotalGeral,
                    SaldoLiquidoGeral = saldoLiquidoGeral,
                    DespesasPorTipo = despesasPorTipo,
                    Viagens = viagens.Select(v => new RelatorioViagemItemDto
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
                        // Incluir detalhes de despesas
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

                return ExportarViagemExcel(resumo, filtros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao exportar Relatório de viagens para Excel (async)");
                throw;
            }
        }

        public async Task<byte[]> ExportarViagemPdfAsync(SistemaContext context, RelatorioViagemFiltroDto filtros)
        {
            try
            {
                _logger.LogWarning("📊📊📊 [EXPORT SERVICE ASYNC] ExportarViagemPdfAsync INICIADO");
                
                var query = context.Viagens
                    .Include(v => v.Veiculo)
                    .Include(v => v.Condutor)
                    .Include(v => v.Despesas)
                    .AsQueryable();

                _logger.LogWarning("📊 [EXPORT SERVICE ASYNC] Query criada, aplicando filtros...");

                // Filtros básicos
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

                // Filtro avançado
                if (filtros.CondutorId.HasValue)
                    query = query.Where(v => v.CondutorId == filtros.CondutorId.Value);

                var totalViagens = await query.CountAsync();
                var receitaTotalGeral = await query.SumAsync(v => v.ReceitaTotal);
                var despesaTotalGeral = await query.SelectMany(v => v.Despesas).SumAsync(d => d.Valor);
                var saldoLiquidoGeral = receitaTotalGeral - despesaTotalGeral;

                var despesasPorTipo = await query
                    .SelectMany(v => v.Despesas)
                    .GroupBy(d => d.TipoDespesa)
                    .Select(g => new { TipoDespesa = g.Key, Total = g.Sum(d => d.Valor) })
                    .ToDictionaryAsync(g => g.TipoDespesa, g => g.Total);

                // Aplicar ordenação e limitar a 10000 registros para evitar problemas de performance
                var viagensQuery = query
                    .OrderByDescending(v => v.DataInicio)
                    .Take(10000);

                var viagens = await viagensQuery.ToListAsync();

                var resumo = new RelatorioViagemResumoDto
                {
                    TotalViagens = totalViagens,
                    ReceitaTotalGeral = receitaTotalGeral,
                    DespesaTotalGeral = despesaTotalGeral,
                    SaldoLiquidoGeral = saldoLiquidoGeral,
                    DespesasPorTipo = despesasPorTipo,
                    Viagens = viagens.Select(v => new RelatorioViagemItemDto
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
                        // Incluir detalhes de despesas
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

                _logger.LogWarning("📊 [EXPORT SERVICE ASYNC] Resumo montado, chamando ExportarViagemPdf...");
                _logger.LogWarning("📊 [EXPORT SERVICE ASYNC] Total de viagens: {Total}", resumo.TotalViagens);
                
                var resultado = ExportarViagemPdf(resumo, filtros);
                
                _logger.LogWarning("📊 [EXPORT SERVICE ASYNC] PDF retornado com {Size} bytes", resultado.Length);
                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "📊❌ [EXPORT SERVICE ASYNC] ERRO ao exportar Relatório de viagens para PDF (async)");
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

        private void BuildViagemHeader(Document document, RelatorioViagemResumoDto dados, RelatorioViagemFiltroDto filtros, DateTime dataGeracao, CultureInfo culture)
        {
            var headerTable = new PdfPTable(2) { WidthPercentage = 100 };
            headerTable.SetWidths(new float[] { 12f, 88f }); // Logo menor, mais próxima

            var logoPath = ObterCaminhoLogo();
            if (!string.IsNullOrEmpty(logoPath) && File.Exists(logoPath))
            {
                var logo = Image.GetInstance(logoPath);
                logo.ScaleToFit(50f, 50f); // Logo um pouco menor
                var logoCell = new PdfPCell(logo) 
                { 
                    Border = Rectangle.NO_BORDER, 
                    HorizontalAlignment = Element.ALIGN_LEFT, 
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    PaddingRight = 8f, // Menos espaço à direita
                    PaddingLeft = 0f
                };
                headerTable.AddCell(logoCell);
            }
            else
            {
                headerTable.AddCell(new PdfPCell(new Phrase(" ", _pdfStyles.TextFont)) { Border = Rectangle.NO_BORDER });
            }

            var headerContent = new PdfPTable(1) { WidthPercentage = 100 };
            headerContent.AddCell(new PdfPCell(new Phrase(filtros.TituloRelatorio ?? "Relatório de Viagens - Receitas e Despesas", _pdfStyles.TitleFont))
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

        private void BuildViagemDespesasPorTipo(Document document, RelatorioViagemResumoDto dados, CultureInfo culture)
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

        private void BuildViagemCards(Document document, RelatorioViagemResumoDto dados, CultureInfo culture)
        {
            var sectionTitle = new Paragraph("Detalhamento de viagens", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 12f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            // Tabela principal sem cores
            var table = new PdfPTable(7) { WidthPercentage = 100 };
            table.SetWidths(new float[] { 18f, 20f, 23f, 10f, 13f, 13f, 13f });
            table.SpacingAfter = 12f;

            // Cabeçalhos
            var headers = new[] { "Período", "Veículo", "Origem/Destino", "Duração", "Receita", "Despesas", "Saldo" };
            foreach (var header in headers)
            {
                var cell = new PdfPCell(new Phrase(header, _pdfStyles.TableHeaderFont))
                {
                    BackgroundColor = _pdfStyles.PrimaryColor,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 6f,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor
                };
                table.AddCell(cell);
            }

            // Linhas de dados sem cores alternadas
            foreach (var viagem in dados.Viagens.Take(50))
            {
                // Período
                table.AddCell(new PdfPCell(new Phrase($"{viagem.DataInicio:dd/MM/yyyy}\na {viagem.DataFim:dd/MM/yyyy}", _pdfStyles.SmallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 5f,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor
                });

                // Veículo
                table.AddCell(new PdfPCell(new Phrase($"{viagem.VeiculoPlaca}\n{viagem.VeiculoMarca}", _pdfStyles.SmallFont))
                {
                    HorizontalAlignment = Element.ALIGN_LEFT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 5f,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor
                });

                // Origem/Destino
                table.AddCell(new PdfPCell(new Phrase(viagem.OrigemDestino ?? "Não informado", _pdfStyles.SmallFont))
                {
                    HorizontalAlignment = Element.ALIGN_LEFT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 5f,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor
                });

                // Duração
                table.AddCell(new PdfPCell(new Phrase($"{viagem.DuracaoDias} dias", _pdfStyles.SmallFont))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 5f,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor
                });

                // Receita
                table.AddCell(new PdfPCell(new Phrase(viagem.ReceitaTotal.ToString("C2", culture), _pdfStyles.SmallFont))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 5f,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor
                });

                // Despesas
                table.AddCell(new PdfPCell(new Phrase(viagem.TotalDespesas.ToString("C2", culture), _pdfStyles.SmallFont))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 5f,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor
                });

                // Saldo (com cor verde ou vermelha apenas no texto)
                var saldoFont = viagem.SaldoLiquido >= 0 ? _pdfStyles.SuccessFont : _pdfStyles.DangerFont;
                table.AddCell(new PdfPCell(new Phrase(viagem.SaldoLiquido.ToString("C2", culture), saldoFont))
                {
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 5f,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor
                });
            }

            document.Add(table);
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
                _logger.LogInformation("[LOGO] IdentificadorEmpresa obtido: {EmpresaId}", empresaId ?? "NULL");
                
                if (string.IsNullOrEmpty(empresaId))
                {
                    _logger.LogWarning("[LOGO] IdentificadorEmpresa está vazio ou nulo");
                    return string.Empty;
                }

                // Tentar múltiplos caminhos possíveis para a logo
                var possiblePaths = new List<string>();
                
                // 1. Caminho backend/wwwroot/logos
                var backendLogoPath = Path.Combine(_environment.WebRootPath, "logos", $"{empresaId}.png");
                possiblePaths.Add(backendLogoPath);
                
                // 2. Caminho backend/wwwroot/logos com nome específico
                if (empresaId == "irrigacao")
                {
                    var ipLogoPath = Path.Combine(_environment.WebRootPath, "logos", "logo_IP.png");
                    possiblePaths.Add(ipLogoPath);
                }
                else if (empresaId == "chinellato")
                {
                    var chinellatoLogoPath = Path.Combine(_environment.WebRootPath, "logos", "logo_chinellato.png");
                    possiblePaths.Add(chinellatoLogoPath);
                }
                
                // 3. Caminho frontend/public/imagens (caso esteja em desenvolvimento)
                var frontendPath = Path.Combine(_environment.ContentRootPath, "..", "frontend", "public", "imagens");
                var normalizedFrontendPath = Path.GetFullPath(frontendPath);
                
                if (Directory.Exists(normalizedFrontendPath))
                {
                    if (empresaId == "irrigacao")
                    {
                        var ipFrontendPath = Path.Combine(normalizedFrontendPath, "logo_IP.png");
                        possiblePaths.Add(ipFrontendPath);
                    }
                    else if (empresaId == "chinellato")
                    {
                        var chinellatoFrontendPath = Path.Combine(normalizedFrontendPath, "logo_chinellato.png");
                        possiblePaths.Add(chinellatoFrontendPath);
                    }
                    
                    // Tentar também com o nome genérico
                    var genericFrontendPath = Path.Combine(normalizedFrontendPath, $"{empresaId}.png");
                    possiblePaths.Add(genericFrontendPath);
                }
                
                // Tentar cada caminho até encontrar um arquivo existente
                foreach (var path in possiblePaths)
                {
                    _logger.LogInformation("[LOGO] Tentando caminho: {Path}", path);
                    if (File.Exists(path))
                    {
                        _logger.LogInformation("[LOGO] ✅ Logo encontrada em: {Path}", path);
                        return path;
                    }
                }
                
                _logger.LogWarning("[LOGO] ❌ Nenhuma logo encontrada em {Count} caminhos testados", possiblePaths.Count);
                return string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[LOGO] Erro ao obter caminho da logo");
                return string.Empty;
            }
        }

        private PdfOrientation DecideManutencaoOrientation(RelatorioManutencaoResumoDto dados)
        {
            var temMuitasPecas = dados.Manutencoes.Any(m => (m.Pecas?.Count ?? 0) > 3);
            return temMuitasPecas ? PdfOrientation.Landscape : PdfOrientation.Portrait;
        }

        private PdfOrientation DecideViagemOrientation(RelatorioViagemResumoDto dados)
        {
            var temMuitasDespesas = dados.Viagens.Any(v => (v.Despesas?.Count ?? 0) > 5);
            return temMuitasDespesas ? PdfOrientation.Landscape : PdfOrientation.Portrait;
        }

        #endregion

        #region Métodos Clean Design - Manutenção

        private void BuildManutencaoHeaderClean(Document document, RelatorioManutencaoResumoDto dados, RelatorioManutencaoFiltroDto filtros, DateTime dataGeracao, CultureInfo culture)
        {
            // Logo e título em linha simples
            var headerTable = new PdfPTable(2) { WidthPercentage = 100 };
            headerTable.SetWidths(new float[] { 12f, 88f }); // Logo menor, mais próxima

            var logoPath = ObterCaminhoLogo();
            if (!string.IsNullOrEmpty(logoPath) && File.Exists(logoPath))
            {
                var logo = Image.GetInstance(logoPath);
                logo.ScaleToFit(50f, 50f); // Logo um pouco menor
                var logoCell = new PdfPCell(logo) 
                { 
                    Border = Rectangle.NO_BORDER, 
                    HorizontalAlignment = Element.ALIGN_LEFT, 
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    PaddingRight = 8f, // Menos espaço à direita
                    PaddingLeft = 0f
                };
                headerTable.AddCell(logoCell);
            }
            else
            {
                headerTable.AddCell(new PdfPCell(new Phrase(" ", _pdfStyles.TextFont)) { Border = Rectangle.NO_BORDER });
            }

            // Informações do relatório
            var infoTable = new PdfPTable(1) { WidthPercentage = 100 };
            
            var titulo = new Phrase(filtros.TituloRelatorio ?? "Relatório de Manutenção de Veículos", _pdfStyles.TitleFont);
            infoTable.AddCell(new PdfPCell(titulo) 
            { 
                Border = Rectangle.NO_BORDER, 
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingBottom = 3f
            });

            var periodo = $"Período: {filtros.DataInicio?.ToString("dd/MM/yyyy", culture) ?? "Não especificado"} até {filtros.DataFim?.ToString("dd/MM/yyyy", culture) ?? "Não especificado"}";
            infoTable.AddCell(new PdfPCell(new Phrase(periodo, _pdfStyles.SubtitleFont)) 
            { 
                Border = Rectangle.NO_BORDER, 
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingBottom = 2f
            });

            var meta = $"Gerado em: {dataGeracao:dd/MM/yyyy HH:mm}";
            if (!string.IsNullOrEmpty(filtros.UsuarioSolicitante))
            {
                meta += $" | Solicitante: {filtros.UsuarioSolicitante}";
            }
            infoTable.AddCell(new PdfPCell(new Phrase(meta, _pdfStyles.MetaFont)) 
            { 
                Border = Rectangle.NO_BORDER, 
                HorizontalAlignment = Element.ALIGN_LEFT
            });

            headerTable.AddCell(new PdfPCell(infoTable) { Border = Rectangle.NO_BORDER });
            document.Add(headerTable);

            // Linha divisória
            var line = new LineSeparator(1f, 100f, _pdfStyles.BorderColor, Element.ALIGN_CENTER, -5f);
            document.Add(new Chunk(line));
            document.Add(new Paragraph(" ") { SpacingAfter = 10f });
        }

        private void AddManutencaoSummaryClean(Document document, RelatorioManutencaoResumoDto dados, decimal ticketMedio, CultureInfo culture)
        {
            // Título da seção
            var sectionTitle = new Paragraph("RESUMO FINANCEIRO", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 5f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            // Tabela de resumo sem cores
            var summaryTable = new PdfPTable(4) { WidthPercentage = 100 };
            summaryTable.SetWidths(new float[] { 1f, 1f, 1f, 1f });
            summaryTable.SpacingAfter = 5f;

            // Cabeçalhos
            var headers = new[] { "Total de Manutenções", "Mão de Obra", "Peças", "Total Geral" };
            foreach (var header in headers)
            {
                var cell = new PdfPCell(new Phrase(header, _pdfStyles.SmallBoldFont))
                {
                    BackgroundColor = _pdfStyles.LightGray,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 6f
                };
                summaryTable.AddCell(cell);
            }

            // Valores
            var valores = new[] 
            { 
                dados.TotalManutencoes.ToString(culture),
                dados.ValorTotalMaoObra.ToString("C2", culture),
                dados.ValorTotalPecas.ToString("C2", culture),
                dados.ValorTotalGeral.ToString("C2", culture)
            };

            foreach (var valor in valores)
            {
                var cell = new PdfPCell(new Phrase(valor, _pdfStyles.CardValueBoldFont))
                {
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 8f
                };
                summaryTable.AddCell(cell);
            }

            document.Add(summaryTable);

            // Ticket médio
            var ticketText = new Paragraph($"Ticket médio por manutenção: {ticketMedio.ToString("C2", culture)}", _pdfStyles.MetaFont)
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingAfter = 15f
            };
            document.Add(ticketText);
        }

        private void BuildManutencaoPecasResumoClean(Document document, RelatorioManutencaoResumoDto dados, CultureInfo culture)
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

            var sectionTitle = new Paragraph("TOP 10 PEÇAS MAIS CUSTOSAS", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 10f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            var pecasTable = new PdfPTable(3) { WidthPercentage = 100 };
            pecasTable.SetWidths(new float[] { 60f, 20f, 20f });
            pecasTable.SpacingAfter = 15f;

            // Cabeçalhos
            var headers = new[] { "Peça", "Quantidade", "Valor Total" };
            foreach (var header in headers)
            {
                var cell = new PdfPCell(new Phrase(header, _pdfStyles.TableHeaderFont))
                {
                    BackgroundColor = _pdfStyles.SecondaryColor,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 6f
                };
                pecasTable.AddCell(cell);
            }

            // Dados
            var isAlternate = false;
            foreach (var peca in pecasAgrupadas)
            {
                var bgColor = isAlternate ? _pdfStyles.AlternateRowColor : _pdfStyles.White;

                pecasTable.AddCell(new PdfPCell(new Phrase(peca.Descricao, _pdfStyles.TextFont))
                {
                    BackgroundColor = bgColor,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    Padding = 5f
                });

                pecasTable.AddCell(new PdfPCell(new Phrase(peca.Quantidade.ToString("N2", culture), _pdfStyles.TextFont))
                {
                    BackgroundColor = bgColor,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 5f
                });

                pecasTable.AddCell(new PdfPCell(new Phrase(peca.ValorTotal.ToString("C2", culture), _pdfStyles.TextFont))
                {
                    BackgroundColor = bgColor,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 5f
                });

                isAlternate = !isAlternate;
            }

            document.Add(pecasTable);
        }

        private void BuildManutencaoListClean(Document document, RelatorioManutencaoResumoDto dados, CultureInfo culture)
        {
            var sectionTitle = new Paragraph("DETALHAMENTO DE MANUTENÇÕES", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 10f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            foreach (var manutencao in dados.Manutencoes.Take(50))
            {
                // Tabela principal da manutenção com borda única
                var cardTable = new PdfPTable(1) { WidthPercentage = 100 };
                cardTable.SpacingAfter = 10f;

                // Cabeçalho: Veículo e Data
                var headerTable = new PdfPTable(2) { WidthPercentage = 100 };
                headerTable.SetWidths(new float[] { 70f, 30f });

                var veiculoText = $"{manutencao.VeiculoPlaca} - {manutencao.VeiculoMarca}";
                headerTable.AddCell(new PdfPCell(new Phrase(veiculoText, _pdfStyles.CardHeaderFont))
                {
                    BackgroundColor = _pdfStyles.LightGray,
                    Border = Rectangle.NO_BORDER,
                    Padding = 6f
                });

                headerTable.AddCell(new PdfPCell(new Phrase(manutencao.DataManutencao.ToString("dd/MM/yyyy", culture), _pdfStyles.TextFont))
                {
                    BackgroundColor = _pdfStyles.LightGray,
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 6f
                });

                var headerCell = new PdfPCell(headerTable) 
                { 
                    Border = Rectangle.NO_BORDER,
                    Padding = 0f
                };
                cardTable.AddCell(headerCell);

                // Detalhes
                var detailsTable = new PdfPTable(2) { WidthPercentage = 100 };
                detailsTable.SetWidths(new float[] { 30f, 70f });

                // Descrição
                detailsTable.AddCell(new PdfPCell(new Phrase("Descrição:", _pdfStyles.SmallBoldFont))
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 5f,
                    PaddingLeft = 8f
                });
                detailsTable.AddCell(new PdfPCell(new Phrase(manutencao.Descricao, _pdfStyles.TextFont))
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 5f
                });

                // Fornecedor
                detailsTable.AddCell(new PdfPCell(new Phrase("Fornecedor:", _pdfStyles.SmallBoldFont))
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 5f,
                    PaddingLeft = 8f
                });
                detailsTable.AddCell(new PdfPCell(new Phrase(manutencao.FornecedorNome ?? "Não informado", _pdfStyles.TextFont))
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 5f
                });

                // Valores em linha
                var valuesTable = new PdfPTable(3) { WidthPercentage = 100 };
                valuesTable.SetWidths(new float[] { 1f, 1f, 1f });

                var valorLabels = new[] { "Mão de Obra:", "Peças:", "Total:" };
                var valorValues = new[] 
                { 
                    manutencao.ValorMaoObra.ToString("C2", culture),
                    manutencao.ValorPecas.ToString("C2", culture),
                    manutencao.ValorTotal.ToString("C2", culture)
                };

                for (int i = 0; i < 3; i++)
                {
                    var valueCell = new PdfPTable(1) { WidthPercentage = 100 };
                    valueCell.AddCell(new PdfPCell(new Phrase(valorLabels[i], _pdfStyles.SmallFont))
                    {
                        Border = Rectangle.NO_BORDER,
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        Padding = 2f
                    });
                    valueCell.AddCell(new PdfPCell(new Phrase(valorValues[i], i == 2 ? _pdfStyles.CardValueBoldFont : _pdfStyles.TextFont))
                    {
                        Border = Rectangle.NO_BORDER,
                        HorizontalAlignment = Element.ALIGN_CENTER,
                        Padding = 2f
                    });

                    valuesTable.AddCell(new PdfPCell(valueCell)
                    {
                        Border = Rectangle.NO_BORDER,
                        Padding = 5f
                    });
                }

                detailsTable.AddCell(new PdfPCell(valuesTable)
                {
                    Border = Rectangle.NO_BORDER,
                    Colspan = 2,
                    Padding = 5f
                });

                var detailsCell = new PdfPCell(detailsTable) 
                { 
                    Border = Rectangle.NO_BORDER,
                    Padding = 0f
                };
                cardTable.AddCell(detailsCell);

                // Peças (se houver)
                if (manutencao.Pecas != null && manutencao.Pecas.Any())
                {
                    var pecasTable = new PdfPTable(4) { WidthPercentage = 95 };
                    pecasTable.SetWidths(new float[] { 50f, 15f, 15f, 20f });
                    pecasTable.HorizontalAlignment = Element.ALIGN_CENTER;

                    // Cabeçalho das peças
                    var pecasHeaders = new[] { "Peça", "Qtd", "Valor Unit.", "Total" };
                    foreach (var header in pecasHeaders)
                    {
                        pecasTable.AddCell(new PdfPCell(new Phrase(header, _pdfStyles.SmallBoldFont))
                        {
                            BackgroundColor = _pdfStyles.AlternateRowColor,
                            Border = Rectangle.BOX,
                            BorderColor = _pdfStyles.BorderColor,
                            BorderWidth = 0.5f,
                            HorizontalAlignment = Element.ALIGN_CENTER,
                            Padding = 3f
                        });
                    }

                    // Dados das peças
                    foreach (var peca in manutencao.Pecas)
                    {
                        pecasTable.AddCell(new PdfPCell(new Phrase(peca.DescricaoPeca, _pdfStyles.SmallFont))
                        {
                            Border = Rectangle.BOX,
                            BorderColor = _pdfStyles.BorderColor,
                            BorderWidth = 0.5f,
                            Padding = 3f
                        });

                        pecasTable.AddCell(new PdfPCell(new Phrase($"{peca.Quantidade:N2}", _pdfStyles.SmallFont))
                        {
                            Border = Rectangle.BOX,
                            BorderColor = _pdfStyles.BorderColor,
                            BorderWidth = 0.5f,
                            HorizontalAlignment = Element.ALIGN_RIGHT,
                            Padding = 3f
                        });

                        pecasTable.AddCell(new PdfPCell(new Phrase(peca.ValorUnitario.ToString("C2", culture), _pdfStyles.SmallFont))
                        {
                            Border = Rectangle.BOX,
                            BorderColor = _pdfStyles.BorderColor,
                            BorderWidth = 0.5f,
                            HorizontalAlignment = Element.ALIGN_RIGHT,
                            Padding = 3f
                        });

                        pecasTable.AddCell(new PdfPCell(new Phrase(peca.ValorTotal.ToString("C2", culture), _pdfStyles.SmallFont))
                        {
                            Border = Rectangle.BOX,
                            BorderColor = _pdfStyles.BorderColor,
                            BorderWidth = 0.5f,
                            HorizontalAlignment = Element.ALIGN_RIGHT,
                            Padding = 3f
                        });
                    }

                    var pecasCell = new PdfPCell(pecasTable)
                    {
                        Border = Rectangle.NO_BORDER,
                        Padding = 8f,
                        PaddingTop = 5f
                    };
                    cardTable.AddCell(pecasCell);
                }

                // Envolver tudo em um card com borda
                var finalCard = new PdfPCell(cardTable)
                {
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    Padding = 0f
                };

                var wrapperTable = new PdfPTable(1) { WidthPercentage = 100 };
                wrapperTable.SpacingAfter = 10f;
                wrapperTable.AddCell(finalCard);
                
                document.Add(wrapperTable);
            }
        }

        #endregion

        #region Métodos Clean para Viagem - Layout Moderno

        private void BuildViagemHeaderClean(Document document, RelatorioViagemResumoDto dados, RelatorioViagemFiltroDto filtros, DateTime dataGeracao, CultureInfo culture)
        {
            // Logo e título em linha simples
            var headerTable = new PdfPTable(2) { WidthPercentage = 100 };
            headerTable.SetWidths(new float[] { 12f, 88f }); // Logo menor, mais próxima

            var logoPath = ObterCaminhoLogo();
            if (!string.IsNullOrEmpty(logoPath) && File.Exists(logoPath))
            {
                var logo = Image.GetInstance(logoPath);
                logo.ScaleToFit(50f, 50f); // Logo um pouco menor
                var logoCell = new PdfPCell(logo) 
                { 
                    Border = Rectangle.NO_BORDER, 
                    HorizontalAlignment = Element.ALIGN_LEFT, 
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    PaddingRight = 8f, // Menos espaço à direita
                    PaddingLeft = 0f
                };
                headerTable.AddCell(logoCell);
            }
            else
            {
                headerTable.AddCell(new PdfPCell(new Phrase(" ", _pdfStyles.TextFont)) { Border = Rectangle.NO_BORDER });
            }

            // Informações do relatório
            var infoTable = new PdfPTable(1) { WidthPercentage = 100 };
            
            var titulo = new Phrase(filtros.TituloRelatorio ?? "Relatório de Viagens", _pdfStyles.TitleFont);
            infoTable.AddCell(new PdfPCell(titulo) 
            { 
                Border = Rectangle.NO_BORDER, 
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingBottom = 3f
            });

            var periodo = $"Período: {filtros.DataInicio?.ToString("dd/MM/yyyy", culture) ?? "Não especificado"} até {filtros.DataFim?.ToString("dd/MM/yyyy", culture) ?? "Não especificado"}";
            infoTable.AddCell(new PdfPCell(new Phrase(periodo, _pdfStyles.SubtitleFont)) 
            { 
                Border = Rectangle.NO_BORDER, 
                HorizontalAlignment = Element.ALIGN_LEFT,
                PaddingBottom = 2f
            });

            var meta = $"Gerado em: {dataGeracao:dd/MM/yyyy HH:mm}";
            if (!string.IsNullOrEmpty(filtros.UsuarioSolicitante))
            {
                meta += $" | Solicitante: {filtros.UsuarioSolicitante}";
            }
            infoTable.AddCell(new PdfPCell(new Phrase(meta, _pdfStyles.MetaFont)) 
            { 
                Border = Rectangle.NO_BORDER, 
                HorizontalAlignment = Element.ALIGN_LEFT
            });

            headerTable.AddCell(new PdfPCell(infoTable) { Border = Rectangle.NO_BORDER });
            document.Add(headerTable);

            // Linha divisória
            var line = new LineSeparator(1f, 100f, _pdfStyles.BorderColor, Element.ALIGN_CENTER, -5f);
            document.Add(new Chunk(line));
            document.Add(new Paragraph(" ") { SpacingAfter = 10f });
        }

        private void AddViagemSummaryClean(Document document, RelatorioViagemResumoDto dados, decimal saldoMedio, CultureInfo culture)
        {
            // Título da seção
            var sectionTitle = new Paragraph("RESUMO FINANCEIRO", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 5f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            // Tabela de resumo sem cores
            var summaryTable = new PdfPTable(4) { WidthPercentage = 100 };
            summaryTable.SetWidths(new float[] { 1f, 1f, 1f, 1f });
            summaryTable.SpacingAfter = 5f;

            // Cabeçalhos
            var headers = new[] { "Total de Viagens", "Receita Total", "Despesas Totais", "Saldo Líquido" };
            foreach (var header in headers)
            {
                var cell = new PdfPCell(new Phrase(header, _pdfStyles.SmallBoldFont))
                {
                    BackgroundColor = _pdfStyles.LightGray,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 6f
                };
                summaryTable.AddCell(cell);
            }

            // Valores
            var valores = new[] 
            { 
                dados.TotalViagens.ToString(culture),
                dados.ReceitaTotalGeral.ToString("C2", culture),
                dados.DespesaTotalGeral.ToString("C2", culture),
                dados.SaldoLiquidoGeral.ToString("C2", culture)
            };

            foreach (var valor in valores)
            {
                var cell = new PdfPCell(new Phrase(valor, _pdfStyles.CardValueBoldFont))
                {
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 8f
                };
                summaryTable.AddCell(cell);
            }

            document.Add(summaryTable);

            // Saldo médio
            var saldoMedioText = new Paragraph($"Saldo médio por viagem: {saldoMedio.ToString("C2", culture)}", _pdfStyles.MetaFont)
            {
                Alignment = Element.ALIGN_CENTER,
                SpacingAfter = 15f
            };
            document.Add(saldoMedioText);
        }

        private void BuildViagemDespesasResumoClean(Document document, RelatorioViagemResumoDto dados, CultureInfo culture)
        {
            if (!dados.DespesasPorTipo.Any())
                return;

            var despesasOrdenadas = dados.DespesasPorTipo
                .OrderByDescending(d => d.Value)
                .Take(10)
                .ToList();

            var sectionTitle = new Paragraph("DESPESAS POR TIPO", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 10f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            var despesasTable = new PdfPTable(3) { WidthPercentage = 100 };
            despesasTable.SetWidths(new float[] { 50f, 30f, 20f });
            despesasTable.SpacingAfter = 15f;

            // Cabeçalhos
            var headers = new[] { "Tipo de Despesa", "Valor Total", "%" };
            foreach (var header in headers)
            {
                var cell = new PdfPCell(new Phrase(header, _pdfStyles.TableHeaderFont))
                {
                    BackgroundColor = _pdfStyles.SecondaryColor,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    Padding = 6f
                };
                despesasTable.AddCell(cell);
            }

            // Dados
            var isAlternate = false;
            foreach (var despesa in despesasOrdenadas)
            {
                var bgColor = isAlternate ? _pdfStyles.AlternateRowColor : _pdfStyles.White;
                var percentual = dados.DespesaTotalGeral > 0 
                    ? (despesa.Value / dados.DespesaTotalGeral * 100) 
                    : 0;

                despesasTable.AddCell(new PdfPCell(new Phrase(despesa.Key, _pdfStyles.TextFont))
                {
                    BackgroundColor = bgColor,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    Padding = 5f
                });

                despesasTable.AddCell(new PdfPCell(new Phrase(despesa.Value.ToString("C2", culture), _pdfStyles.TextFont))
                {
                    BackgroundColor = bgColor,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 5f
                });

                despesasTable.AddCell(new PdfPCell(new Phrase($"{percentual:N1}%", _pdfStyles.TextFont))
                {
                    BackgroundColor = bgColor,
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 5f
                });

                isAlternate = !isAlternate;
            }

            document.Add(despesasTable);
        }

        private void BuildViagemListClean(Document document, RelatorioViagemResumoDto dados, CultureInfo culture)
        {
            var sectionTitle = new Paragraph("DETALHAMENTO DE VIAGENS", _pdfStyles.SectionTitleFont)
            {
                SpacingBefore = 10f,
                SpacingAfter = 8f
            };
            document.Add(sectionTitle);

            foreach (var viagem in dados.Viagens.Take(50))
            {
                // Tabela principal da viagem com borda única
                var cardTable = new PdfPTable(1) { WidthPercentage = 100 };
                cardTable.SpacingAfter = 10f;

                // Cabeçalho (placa e data)
                var headerTable = new PdfPTable(2) { WidthPercentage = 100 };
                headerTable.SetWidths(new float[] { 70f, 30f });

                var veiculoText = $"🚗 {viagem.VeiculoPlaca}";
                if (!string.IsNullOrEmpty(viagem.VeiculoMarca))
                {
                    veiculoText += $" - {viagem.VeiculoMarca}";
                }

                headerTable.AddCell(new PdfPCell(new Phrase(veiculoText, _pdfStyles.CardHeaderFont))
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 8f,
                    BackgroundColor = _pdfStyles.LightGray
                });

                var dataText = $"{viagem.DataInicio:dd/MM/yyyy} até {viagem.DataFim:dd/MM/yyyy}";
                headerTable.AddCell(new PdfPCell(new Phrase(dataText, _pdfStyles.CardDateFont))
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 8f,
                    BackgroundColor = _pdfStyles.LightGray
                });

                var headerCell = new PdfPCell(headerTable)
                {
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 1f,
                    Padding = 0f
                };
                cardTable.AddCell(headerCell);

                // Detalhes da viagem
                var detailsTable = new PdfPTable(2) { WidthPercentage = 100 };
                detailsTable.SetWidths(new float[] { 50f, 50f });

                // Coluna esquerda
                var leftDetails = new PdfPTable(1) { WidthPercentage = 100 };
                
                if (!string.IsNullOrEmpty(viagem.OrigemDestino))
                {
                    leftDetails.AddCell(new PdfPCell(new Phrase($"Rota: {viagem.OrigemDestino}", _pdfStyles.SmallFont))
                    {
                        Border = Rectangle.NO_BORDER,
                        Padding = 3f
                    });
                }

                leftDetails.AddCell(new PdfPCell(new Phrase($"Duração: {viagem.DuracaoDias} dia(s)", _pdfStyles.SmallFont))
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 3f
                });

                // Coluna direita - valores
                var rightDetails = new PdfPTable(1) { WidthPercentage = 100 };
                
                rightDetails.AddCell(new PdfPCell(new Phrase($"Receita: {viagem.ReceitaTotal.ToString("C2", culture)}", _pdfStyles.SmallFont))
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 3f
                });

                rightDetails.AddCell(new PdfPCell(new Phrase($"Despesas: {viagem.TotalDespesas.ToString("C2", culture)}", _pdfStyles.SmallFont))
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 3f
                });

                var saldoFont = viagem.SaldoLiquido >= 0 ? _pdfStyles.SuccessFont : _pdfStyles.DangerFont;
                rightDetails.AddCell(new PdfPCell(new Phrase($"Saldo: {viagem.SaldoLiquido.ToString("C2", culture)}", saldoFont))
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    Padding = 3f
                });

                detailsTable.AddCell(new PdfPCell(leftDetails) 
                { 
                    Border = Rectangle.NO_BORDER,
                    Padding = 5f
                });
                detailsTable.AddCell(new PdfPCell(rightDetails) 
                { 
                    Border = Rectangle.NO_BORDER,
                    Padding = 5f
                });

                var detailsCell = new PdfPCell(detailsTable) 
                { 
                    Border = Rectangle.BOX,
                    BorderColor = _pdfStyles.BorderColor,
                    BorderWidth = 0.5f,
                    Padding = 0f
                };
                cardTable.AddCell(detailsCell);

                // Despesas (se houver)
                if (viagem.Despesas != null && viagem.Despesas.Any())
                {
                    var despesasTable = new PdfPTable(4) { WidthPercentage = 95 };
                    despesasTable.SetWidths(new float[] { 30f, 35f, 15f, 20f });
                    despesasTable.HorizontalAlignment = Element.ALIGN_CENTER;

                    // Cabeçalho das despesas
                    var despesasHeaders = new[] { "Tipo", "Descrição", "Data", "Valor" };
                    foreach (var header in despesasHeaders)
                    {
                        despesasTable.AddCell(new PdfPCell(new Phrase(header, _pdfStyles.SmallBoldFont))
                        {
                            BackgroundColor = _pdfStyles.AlternateRowColor,
                            Border = Rectangle.BOX,
                            BorderColor = _pdfStyles.BorderColor,
                            BorderWidth = 0.5f,
                            HorizontalAlignment = Element.ALIGN_CENTER,
                            Padding = 3f
                        });
                    }

                    // Dados das despesas
                    foreach (var despesa in viagem.Despesas)
                    {
                        despesasTable.AddCell(new PdfPCell(new Phrase(despesa.TipoDespesa, _pdfStyles.SmallFont))
                        {
                            Border = Rectangle.BOX,
                            BorderColor = _pdfStyles.BorderColor,
                            BorderWidth = 0.5f,
                            Padding = 3f
                        });

                        despesasTable.AddCell(new PdfPCell(new Phrase(despesa.Descricao ?? "-", _pdfStyles.SmallFont))
                        {
                            Border = Rectangle.BOX,
                            BorderColor = _pdfStyles.BorderColor,
                            BorderWidth = 0.5f,
                            Padding = 3f
                        });

                        despesasTable.AddCell(new PdfPCell(new Phrase(despesa.DataDespesa.ToString("dd/MM/yy", culture), _pdfStyles.SmallFont))
                        {
                            Border = Rectangle.BOX,
                            BorderColor = _pdfStyles.BorderColor,
                            BorderWidth = 0.5f,
                            HorizontalAlignment = Element.ALIGN_CENTER,
                            Padding = 3f
                        });

                        despesasTable.AddCell(new PdfPCell(new Phrase(despesa.Valor.ToString("C2", culture), _pdfStyles.SmallFont))
                        {
                            Border = Rectangle.BOX,
                            BorderColor = _pdfStyles.BorderColor,
                            BorderWidth = 0.5f,
                            HorizontalAlignment = Element.ALIGN_RIGHT,
                            Padding = 3f
                        });
                    }

                    var despesasCell = new PdfPCell(despesasTable)
                    {
                        Border = Rectangle.BOX,
                        BorderColor = _pdfStyles.BorderColor,
                        BorderWidth = 0.5f,
                        Padding = 5f,
                        Colspan = 1
                    };
                    cardTable.AddCell(despesasCell);
                }

                document.Add(cardTable);
            }
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

