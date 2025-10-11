using System.Text.Json;
using System.Linq;
using Backend.Api.Interfaces;
using Backend.Api.DTOs;

namespace Backend.Api.Services
{
    public class IBGEService : IIBGEService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<IBGEService> _logger;
        private static readonly Dictionary<string, int> _cacheCodigosMunicipio = new();
        private readonly ICacheService? _cacheService;

        public IBGEService(HttpClient httpClient, ILogger<IBGEService> logger, ICacheService? cacheService = null)
        {
            _httpClient = httpClient;
            _logger = logger;
            _cacheService = cacheService;
        }

        public async Task<int> ObterCodigoMunicipioAsync(string nomeMunicipio, string uf)
        {
            if (string.IsNullOrWhiteSpace(nomeMunicipio) || string.IsNullOrWhiteSpace(uf))
                return 0;

            var chaveCache = $"{nomeMunicipio.ToUpperInvariant()}-{uf.ToUpperInvariant()}";
            
            if (_cacheCodigosMunicipio.TryGetValue(chaveCache, out var codigoCache))
                return codigoCache;

            try
            {
                var url = $"https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios";
                var response = await _httpClient.GetStringAsync(url);
                var municipios = JsonSerializer.Deserialize<MunicipioIBGE[]>(response, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                var municipio = municipios?.FirstOrDefault(m => 
                    string.Equals(m.Nome, nomeMunicipio, StringComparison.OrdinalIgnoreCase));

                if (municipio != null)
                {
                    _cacheCodigosMunicipio[chaveCache] = municipio.Id;
                    _logger.LogInformation($"Código do município {nomeMunicipio}/{uf}: {municipio.Id}");
                    return municipio.Id;
                }

                _logger.LogWarning($"Município não encontrado: {nomeMunicipio}/{uf}");
                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erro ao buscar código do município {nomeMunicipio}/{uf}");
                return 0;
            }
        }

        public async Task<List<EstadoDto>> ObterEstadosAsync()
        {
            try
            {
                const string cacheKey = "ibge_estados_v1";
                var cached = _cacheService?.Get<List<EstadoDto>>(cacheKey);
                if (cached != null && cached.Count > 0)
                {
                    _logger.LogDebug("Estados retornados do cache ({Count})", cached.Count);
                    return cached;
                }
                var url = "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome";
                var response = await _httpClient.GetStringAsync(url);
                var estados = JsonSerializer.Deserialize<EstadoIBGE[]>(response, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                var result = estados?.Select(e => new EstadoDto
                {
                    Id = e.Id,
                    Sigla = e.Sigla,
                    Nome = e.Nome
                }).ToList() ?? new List<EstadoDto>();

                _logger.LogInformation("Estados carregados da API IBGE: {Count} estados", result.Count);
                _cacheService?.Set(cacheKey, result, TimeSpan.FromHours(12));
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar lista de estados");
                return _cacheService?.Get<List<EstadoDto>>("ibge_estados_v1") ?? new List<EstadoDto>();
            }
        }

        public async Task<List<MunicipioIBGEDto>> ObterMunicipiosPorEstadoAsync(string uf)
        {
            try
            {
                var url = $"https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios?orderBy=nome";
                var response = await _httpClient.GetStringAsync(url);
                var municipios = JsonSerializer.Deserialize<MunicipioIBGE[]>(response, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                var result = municipios?.Select(m => new MunicipioIBGEDto
                {
                    Id = m.Id,
                    Nome = m.Nome,
                    UF = uf
                }).ToList() ?? new List<MunicipioIBGEDto>();

                _logger.LogInformation("Municípios carregados da API IBGE para {UF}: {Count} municípios", uf, result.Count);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar municípios do estado {UF}", uf);
                return new List<MunicipioIBGEDto>();
            }
        }

        public async Task<List<MunicipioIBGE>> ImportarTodosMunicipiosAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando import de todos os municípios do Brasil");
                
                var todosMunicipios = new List<MunicipioIBGE>();
                var estados = await ObterEstadosAsync();
                
                _logger.LogInformation($"Encontrados {estados.Count} estados para processar");

                foreach (var estado in estados)
                {
                    try
                    {
                        _logger.LogInformation($"Processando municípios do estado {estado.Sigla}");
                        
                        var url = $"https://servicodados.ibge.gov.br/api/v1/localidades/estados/{estado.Sigla}/municipios?orderBy=nome";
                        var response = await _httpClient.GetStringAsync(url);
                        var municipios = JsonSerializer.Deserialize<MunicipioIBGE[]>(response, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                        if (municipios != null && municipios.Length > 0)
                        {
                            foreach (var municipio in municipios)
                            {
                                municipio.UF = estado.Sigla;
                            }
                            
                            todosMunicipios.AddRange(municipios);
                            _logger.LogInformation($"Adicionados {municipios.Length} municípios do estado {estado.Sigla}");
                        }

                        await Task.Delay(100);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Erro ao processar municípios do estado {estado.Sigla}");
                    }
                }

                _logger.LogInformation($"Import concluído. Total de municípios: {todosMunicipios.Count}");
                return todosMunicipios;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro geral no import de municípios");
                return new List<MunicipioIBGE>();
            }
        }
    }
}
