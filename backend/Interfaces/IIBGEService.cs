using Backend.Api.DTOs;

namespace Backend.Api.Interfaces
{
    public interface IIBGEService
    {
        Task<int> ObterCodigoMunicipioAsync(string nomeMunicipio, string uf);
        Task<List<EstadoDto>> ObterEstadosAsync();
        Task<List<MunicipioIBGEDto>> ObterMunicipiosPorEstadoAsync(string uf);
        Task<List<MunicipioIBGE>> ImportarTodosMunicipiosAsync();
    }
}
