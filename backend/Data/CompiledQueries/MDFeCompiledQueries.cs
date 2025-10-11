using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using Backend.Api.Models;

namespace Backend.Api.Data.CompiledQueries;

public static class MDFeCompiledQueries
{
    // Query base (sem paginação) com includes principais
    public static readonly Func<SistemaContext, int?, IAsyncEnumerable<MDFe>> MDFesBase =
        EF.CompileAsyncQuery((SistemaContext ctx, int? emitenteId) =>
            ctx.MDFes
                .Include(m => m.Emitente)
                .Include(m => m.Veiculo)
                .Include(m => m.Condutor)
                .Where(m => !emitenteId.HasValue || m.EmitenteId == emitenteId));
}
