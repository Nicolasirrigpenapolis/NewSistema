using Backend.Api.DTOs;
using Backend.Api.Models;
using Backend.Api.Utils;

namespace Backend.Api.Interfaces
{
    public interface IMDFeBusinessService
    {
        Task<PagedResult<MDFeResponseDto>> GetMDFesAsync(int? emitenteId, int pagina, int tamanhoPagina);
        Task<MDFe?> GetMDFeByIdAsync(int id);
        Task<MDFe?> UpdateMDFeAsync(int id, MDFeCreateDto mdfeDto);
        Task<bool> DeleteMDFeAsync(int id);
        Task<int> GetProximoNumeroAsync(string? emitenteCnpj = null);
        Task<MDFe> CreateMDFeAsync(MDFeCreateDto mdfeDto);
        Task<MDFe> CreateBlankMDFeAsync();
        Task<MDFe> SalvarRascunhoAsync(SalvarRascunhoDto rascunhoDto);
    }
}
