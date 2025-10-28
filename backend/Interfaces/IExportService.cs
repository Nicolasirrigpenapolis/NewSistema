using Backend.Api.Data;
using Backend.Api.DTOs;

namespace Backend.Api.Interfaces
{
    public interface IExportService
    {
        // Exportação de Relatório de Manutenção (métodos legados - mantidos para compatibilidade)
        byte[] ExportarManutencaoExcel(RelatorioManutencaoResumoDto dados, RelatorioManutencaoFiltroDto filtros);
        byte[] ExportarManutencaoPdf(RelatorioManutencaoResumoDto dados, RelatorioManutencaoFiltroDto filtros);

        // Exportação de Relatório de Viagem (métodos legados - mantidos para compatibilidade)
        byte[] ExportarViagemExcel(RelatorioViagemResumoDto dados, RelatorioViagemFiltroDto filtros);
        byte[] ExportarViagemPdf(RelatorioViagemResumoDto dados, RelatorioViagemFiltroDto filtros);

        // Métodos otimizados - fazem queries diretas no banco
        Task<byte[]> ExportarManutencaoExcelAsync(SistemaContext context, RelatorioManutencaoFiltroDto filtros);
        Task<byte[]> ExportarManutencaoPdfAsync(SistemaContext context, RelatorioManutencaoFiltroDto filtros);
        Task<byte[]> ExportarViagemExcelAsync(SistemaContext context, RelatorioViagemFiltroDto filtros);
        Task<byte[]> ExportarViagemPdfAsync(SistemaContext context, RelatorioViagemFiltroDto filtros);
    }
}
