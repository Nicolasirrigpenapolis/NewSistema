using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Models;

namespace Backend.Api.Repositories
{
    public class PermissaoRepository : GenericRepository<Permissao>, IPermissaoRepository
    {
        public PermissaoRepository(SistemaContext context, ILogger<GenericRepository<Permissao>> logger) : base(context, logger)
        {
        }

        public async Task<IEnumerable<Permissao>> GetPermissoesByCargoIdAsync(int cargoId)
        {
            return await _context.CargoPermissoes
                .Where(cp => cp.CargoId == cargoId)
                .Select(cp => cp.Permissao)
                .Where(p => p.Ativo)
                .OrderBy(p => p.Modulo)
                .ThenBy(p => p.Nome)
                .ToListAsync();
        }

        public async Task<IEnumerable<Permissao>> GetPermissoesByModuloAsync(string modulo)
        {
            return await _context.Permissoes
                .Where(p => p.Modulo == modulo && p.Ativo)
                .OrderBy(p => p.Nome)
                .ToListAsync();
        }

        public async Task<Permissao?> GetByCodigoAsync(string codigo)
        {
            return await _context.Permissoes
                .FirstOrDefaultAsync(p => p.Codigo == codigo);
        }

        public async Task<bool> CargoHasPermissaoAsync(int cargoId, string codigoPermissao)
        {
            return await _context.CargoPermissoes
                .Include(cp => cp.Permissao)
                .AnyAsync(cp => cp.CargoId == cargoId &&
                              cp.Permissao.Codigo == codigoPermissao &&
                              cp.Permissao.Ativo);
        }

        public async Task<IEnumerable<string>> GetCodigosPermissoesByCargoIdAsync(int cargoId)
        {
            return await _context.CargoPermissoes
                .Include(cp => cp.Permissao)
                .Where(cp => cp.CargoId == cargoId && cp.Permissao.Ativo)
                .Select(cp => cp.Permissao.Codigo)
                .ToListAsync();
        }
    }
}
