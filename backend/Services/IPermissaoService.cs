using Backend.Api.Models;

namespace Backend.Api.Services
{
    public interface IPermissaoService
    {
        Task<IEnumerable<Permissao>> GetAllPermissoesAsync();
        Task<IEnumerable<Permissao>> GetPermissoesByCargoIdAsync(int cargoId);
        Task<IEnumerable<Permissao>> GetPermissoesByModuloAsync(string modulo);
        Task<bool> UserHasPermissionAsync(int? cargoId, string codigoPermissao);
        Task<IEnumerable<string>> GetUserPermissionsAsync(int? cargoId);
        Task AtribuirPermissaoToCargoAsync(int cargoId, int permissaoId);
        Task RemoverPermissaoFromCargoAsync(int cargoId, int permissaoId);
        Task<IEnumerable<string>> GetModulosAsync();
    }
}
