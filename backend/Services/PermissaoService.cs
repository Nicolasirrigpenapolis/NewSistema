using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Models;
using Backend.Api.Repositories;

namespace Backend.Api.Services
{
    public class PermissaoService : IPermissaoService
    {
        private readonly IPermissaoRepository _permissaoRepository;
        private readonly SistemaContext _context;
        private readonly ICacheService? _cache;

        public PermissaoService(IPermissaoRepository permissaoRepository, SistemaContext context, ICacheService? cache = null)
        {
            _permissaoRepository = permissaoRepository;
            _context = context;
            _cache = cache;
        }

        public async Task<IEnumerable<Permissao>> GetAllPermissoesAsync()
        {
            const string key = "permissoes:all";
            var cached = _cache?.Get<IEnumerable<Permissao>>(key);
            if (cached != null)
                return cached;

            var data = await _permissaoRepository.GetAllAsync();
            _cache?.Set(key, data.ToList(), TimeSpan.FromMinutes(30));
            return data;
        }

        public async Task<IEnumerable<Permissao>> GetPermissoesByCargoIdAsync(int cargoId)
        {
            var key = $"permissoes:cargo:{cargoId}";
            var cached = _cache?.Get<IEnumerable<Permissao>>(key);
            if (cached != null)
                return cached;
            var list = (await _permissaoRepository.GetPermissoesByCargoIdAsync(cargoId)).ToList();
            _cache?.Set(key, list, TimeSpan.FromMinutes(30));
            return list;
        }

        public async Task<IEnumerable<Permissao>> GetPermissoesByModuloAsync(string modulo)
        {
            return await _permissaoRepository.GetPermissoesByModuloAsync(modulo);
        }

        public async Task<bool> UserHasPermissionAsync(int? cargoId, string codigoPermissao)
        {
            if (!cargoId.HasValue)
                return false;

            // Otimização: tentar usar cache de códigos
            var codes = await GetUserPermissionsAsync(cargoId);
            if (codes.Any())
                return codes.Contains(codigoPermissao);
            return await _permissaoRepository.CargoHasPermissaoAsync(cargoId.Value, codigoPermissao);
        }

        public async Task<IEnumerable<string>> GetUserPermissionsAsync(int? cargoId)
        {
            if (!cargoId.HasValue)
                return new List<string>();

            var key = $"permissoes:cargo:{cargoId}:codigos";
            var cached = _cache?.Get<IEnumerable<string>>(key);
            if (cached != null)
                return cached;
            var codes = await _permissaoRepository.GetCodigosPermissoesByCargoIdAsync(cargoId.Value);
            _cache?.Set(key, codes.ToList(), TimeSpan.FromMinutes(30));
            return codes;
        }

        public async Task AtribuirPermissaoToCargoAsync(int cargoId, int permissaoId)
        {
            var existeRelacao = await _context.CargoPermissoes
                .AnyAsync(cp => cp.CargoId == cargoId && cp.PermissaoId == permissaoId);

            if (!existeRelacao)
            {
                var cargoPermissao = new CargoPermissao
                {
                    CargoId = cargoId,
                    PermissaoId = permissaoId,
                    DataCriacao = DateTime.Now
                };

                _context.CargoPermissoes.Add(cargoPermissao);
                await _context.SaveChangesAsync();
            }
            // Invalida cache relacionado ao cargo
            _cache?.Remove($"permissoes:cargo:{cargoId}");
            _cache?.Remove($"permissoes:cargo:{cargoId}:codigos");
            _cache?.Remove("permissoes:all");
        }

        public async Task RemoverPermissaoFromCargoAsync(int cargoId, int permissaoId)
        {
            var cargoPermissao = await _context.CargoPermissoes
                .FirstOrDefaultAsync(cp => cp.CargoId == cargoId && cp.PermissaoId == permissaoId);

            if (cargoPermissao != null)
            {
                _context.CargoPermissoes.Remove(cargoPermissao);
                await _context.SaveChangesAsync();
            }
            // Invalida cache relacionado
            _cache?.Remove($"permissoes:cargo:{cargoId}");
            _cache?.Remove($"permissoes:cargo:{cargoId}:codigos");
            _cache?.Remove("permissoes:all");
        }

        public async Task<IEnumerable<string>> GetModulosAsync()
        {
            return await _context.Permissoes
                .Where(p => p.Ativo)
                .Select(p => p.Modulo)
                .Distinct()
                .OrderBy(m => m)
                .ToListAsync();
        }
    }
}
