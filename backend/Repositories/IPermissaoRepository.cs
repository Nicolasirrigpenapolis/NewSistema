using Backend.Api.Models;

namespace Backend.Api.Repositories
{
    public interface IPermissaoRepository : IGenericRepository<Permissao>
    {
        Task<IEnumerable<Permissao>> GetPermissoesByCargoIdAsync(int cargoId);
        Task<IEnumerable<Permissao>> GetPermissoesByModuloAsync(string modulo);
        Task<Permissao?> GetByCodigoAsync(string codigo);
        Task<bool> CargoHasPermissaoAsync(int cargoId, string codigoPermissao);
        Task<IEnumerable<string>> GetCodigosPermissoesByCargoIdAsync(int cargoId);
    }
}
