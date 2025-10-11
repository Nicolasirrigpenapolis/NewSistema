using Backend.Api.Data;
using Backend.Api.DTOs;

namespace Backend.Api.Interfaces
{
    public interface IExportService
    {
        // Exportação de Relatório de Manutenção (métodos legados - mantidos para compatibilidade)
        byte[] ExportarManutencaoExcel(RelatorioManutencaoResumoDto dados, RelatorioManutencaoFiltroDto filtros);
        byte[] ExportarManutencaoPdf(RelatorioManutencaoResumoDto dados, RelatorioManutencaoFiltroDto filtros);

        // Exportação de Relatório de Despesas (métodos legados - mantidos para compatibilidade)
        byte[] ExportarDespesasExcel(RelatorioDespesasResumoDto dados, RelatorioDespesasFiltroDto filtros);
        byte[] ExportarDespesasPdf(RelatorioDespesasResumoDto dados, RelatorioDespesasFiltroDto filtros);

        // Métodos otimizados - fazem queries diretas no banco
        Task<byte[]> ExportarManutencaoExcelAsync(SistemaContext context, RelatorioManutencaoFiltroDto filtros);
        Task<byte[]> ExportarManutencaoPdfAsync(SistemaContext context, RelatorioManutencaoFiltroDto filtros);
        Task<byte[]> ExportarDespesasExcelAsync(SistemaContext context, RelatorioDespesasFiltroDto filtros);
        Task<byte[]> ExportarDespesasPdfAsync(SistemaContext context, RelatorioDespesasFiltroDto filtros);
    }
}
