using Microsoft.AspNetCore.Mvc;
using Backend.Api.DTOs;

namespace Backend.Api.Controllers
{
    /// <summary>
    /// Controller para cálculos de rotas interestaduais
    /// Backend responsável por toda lógica de roteamento
    /// </summary>
    [ApiController]
    [Route("api/rotas")]
    public class RotasController : ControllerBase
    {
        private readonly ILogger<RotasController> _logger;

        // Mapeamento de conexões interestaduais (dados geográficos)
        private static readonly Dictionary<string, string[]> ConexoesInterestaduais = new()
        {
            {"AC", new[] {"AM", "RO"}},
            {"AL", new[] {"PE", "SE", "BA"}},
            {"AP", new[] {"PA"}},
            {"AM", new[] {"RR", "PA", "MT", "RO", "AC"}},
            {"BA", new[] {"PE", "AL", "SE", "MG", "ES", "GO", "TO", "PI"}},
            {"CE", new[] {"PI", "PE", "PB", "RN"}},
            {"DF", new[] {"GO"}},
            {"ES", new[] {"MG", "RJ", "BA"}},
            {"GO", new[] {"MT", "MS", "MG", "BA", "TO", "DF"}},
            {"MA", new[] {"PI", "TO", "PA"}},
            {"MT", new[] {"RO", "AM", "PA", "TO", "GO", "MS"}},
            {"MS", new[] {"MT", "GO", "MG", "SP", "PR"}},
            {"MG", new[] {"SP", "RJ", "ES", "BA", "GO", "MS"}},
            {"PA", new[] {"AM", "RR", "AP", "MA", "TO", "MT"}},
            {"PB", new[] {"PE", "CE", "RN"}},
            {"PR", new[] {"SP", "SC", "MS"}},
            {"PE", new[] {"AL", "BA", "PI", "CE", "PB"}},
            {"PI", new[] {"MA", "TO", "BA", "PE", "CE"}},
            {"RJ", new[] {"SP", "MG", "ES"}},
            {"RN", new[] {"CE", "PB"}},
            {"RS", new[] {"SC"}},
            {"RO", new[] {"AC", "AM", "MT"}},
            {"RR", new[] {"AM", "PA"}},
            {"SC", new[] {"PR", "RS"}},
            {"SP", new[] {"MG", "RJ", "PR", "MS"}},
            {"SE", new[] {"AL", "BA"}},
            {"TO", new[] {"MT", "PA", "MA", "PI", "BA", "GO"}}
        };

        private static readonly Dictionary<string, string> NomesEstados = new()
        {
            {"AC", "Acre"}, {"AL", "Alagoas"}, {"AP", "Amapá"}, {"AM", "Amazonas"},
            {"BA", "Bahia"}, {"CE", "Ceará"}, {"DF", "Distrito Federal"}, {"ES", "Espírito Santo"},
            {"GO", "Goiás"}, {"MA", "Maranhão"}, {"MT", "Mato Grosso"}, {"MS", "Mato Grosso do Sul"},
            {"MG", "Minas Gerais"}, {"PA", "Pará"}, {"PB", "Paraíba"}, {"PR", "Paraná"},
            {"PE", "Pernambuco"}, {"PI", "Piauí"}, {"RJ", "Rio de Janeiro"}, {"RN", "Rio Grande do Norte"},
            {"RS", "Rio Grande do Sul"}, {"RO", "Rondônia"}, {"RR", "Roraima"}, {"SC", "Santa Catarina"},
            {"SP", "São Paulo"}, {"SE", "Sergipe"}, {"TO", "Tocantins"}
        };

        public RotasController(ILogger<RotasController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Calcular rotas alternativas entre origem e destino
        /// </summary>
        [HttpGet("calcular/{ufOrigem}/{ufDestino}")]
        public ActionResult<ApiResponse<List<OpcaoRotaDto>>> CalcularRotas(string ufOrigem, string ufDestino)
        {
            try
            {
                ufOrigem = ufOrigem.ToUpper();
                ufDestino = ufDestino.ToUpper();

                if (!ConexoesInterestaduais.ContainsKey(ufOrigem) || !ConexoesInterestaduais.ContainsKey(ufDestino))
                {
                    return BadRequest(new ApiResponse<List<OpcaoRotaDto>>
                    {
                        Success = false,
                        Message = "UF de origem ou destino inválida"
                    });
                }

                var rotas = CalcularRotasAlternativas(ufOrigem, ufDestino);
                var opcoesRotas = GerarOpcoesRotas(rotas, ufOrigem, ufDestino);

                return Ok(new ApiResponse<List<OpcaoRotaDto>>
                {
                    Success = true,
                    Message = "Rotas calculadas com sucesso",
                    Data = opcoesRotas
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao calcular rotas entre {UfOrigem} e {UfDestino}", ufOrigem, ufDestino);
                return StatusCode(500, new ApiResponse<List<OpcaoRotaDto>>
                {
                    Success = false,
                    Message = "Erro interno do servidor"
                });
            }
        }

        /// <summary>
        /// Obter lista de estados com nomes formatados
        /// </summary>
        [HttpGet("estados")]
        public ActionResult<ApiResponse<List<EstadoDto>>> GetEstados()
        {
            try
            {
                var estados = NomesEstados.Select(kvp => new EstadoDto
                {
                    Id = Array.IndexOf(NomesEstados.Keys.ToArray(), kvp.Key) + 1,
                    Sigla = kvp.Key,
                    Nome = kvp.Value
                }).ToList();

                return Ok(new ApiResponse<List<EstadoDto>>
                {
                    Success = true,
                    Message = "Estados obtidos com sucesso",
                    Data = estados
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter estados");
                return StatusCode(500, new ApiResponse<List<EstadoDto>>
                {
                    Success = false,
                    Message = "Erro interno do servidor"
                });
            }
        }

        // Algoritmos de roteamento centralizados no backend
        private List<string[]> CalcularRotasAlternativas(string ufOrigem, string ufDestino)
        {
            if (ufOrigem == ufDestino)
            {
                return new List<string[]> { new[] { ufOrigem } };
            }

            // Verificar conexão direta
            var vizinhosOrigem = ConexoesInterestaduais.GetValueOrDefault(ufOrigem, Array.Empty<string>());
            if (vizinhosOrigem.Contains(ufDestino))
            {
                var rotasEncontradas = new List<string[]> { new[] { ufOrigem, ufDestino } };

                // Adicionar rotas alternativas
                var rotasIndiretas = BuscarRotasIndiretas(ufOrigem, ufDestino, 2);
                rotasEncontradas.AddRange(rotasIndiretas.Take(2));

                return rotasEncontradas;
            }

            return BuscarRotasIndiretas(ufOrigem, ufDestino, 3);
        }

        private List<string[]> BuscarRotasIndiretas(string ufOrigem, string ufDestino, int maxRotas)
        {
            var rotasEncontradas = new List<string[]>();
            const int maxDistancia = 5;

            void BuscarRotas(string ufAtual, string ufDestino, List<string> caminhoAtual, HashSet<string> visitados)
            {
                if (caminhoAtual.Count > maxDistancia || rotasEncontradas.Count >= maxRotas)
                    return;

                if (ufAtual == ufDestino)
                {
                    rotasEncontradas.Add(caminhoAtual.ToArray());
                    return;
                }

                var vizinhos = ConexoesInterestaduais.GetValueOrDefault(ufAtual, Array.Empty<string>());

                // Priorizar vizinhos que conectam ao destino
                var vizinhosOrdenados = vizinhos
                    .OrderBy(v => ConexoesInterestaduais.GetValueOrDefault(v, Array.Empty<string>()).Contains(ufDestino) ? 0 : 1)
                    .ToArray();

                foreach (var vizinho in vizinhosOrdenados)
                {
                    if (!visitados.Contains(vizinho) && rotasEncontradas.Count < maxRotas)
                    {
                        var novosVisitados = new HashSet<string>(visitados) { vizinho };
                        var novoCaminho = new List<string>(caminhoAtual) { vizinho };
                        BuscarRotas(vizinho, ufDestino, novoCaminho, novosVisitados);
                    }
                }
            }

            var visitadosIniciais = new HashSet<string> { ufOrigem };
            BuscarRotas(ufOrigem, ufDestino, new List<string> { ufOrigem }, visitadosIniciais);

            return rotasEncontradas.OrderBy(r => r.Length).ToList();
        }

        private List<OpcaoRotaDto> GerarOpcoesRotas(List<string[]> rotas, string ufOrigem, string ufDestino)
        {
            return rotas.Select((rota, index) =>
            {
                var estadosPercurso = rota.Skip(1).Take(rota.Length - 2).ToArray();
                var distanciaEstimada = (rota.Length - 1) * 500; // Estimativa em km

                string nomeRota;
                if (estadosPercurso.Length == 0)
                {
                    nomeRota = "Rota Direta";
                }
                else if (index == 0)
                {
                    nomeRota = "Rota Recomendada";
                }
                else
                {
                    nomeRota = $"Rota Alternativa {index}";
                }

                // Adicionar características da rota
                if (estadosPercurso.Any(uf => new[] { "SP", "MG" }.Contains(uf)))
                    nomeRota += " (Via Grandes Centros)";
                else if (estadosPercurso.Any(uf => new[] { "GO", "DF" }.Contains(uf)))
                    nomeRota += " (Via Centro-Oeste)";

                return new OpcaoRotaDto
                {
                    Id = $"rota_{index}",
                    Nome = nomeRota,
                    Percurso = rota.ToList(),
                    DistanciaKm = distanciaEstimada,
                    NumeroEstados = rota.Length,
                    Recomendada = index == 0
                };
            }).ToList();
        }
    }

    // DTOs para rotas
    public class OpcaoRotaDto
    {
        public string Id { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public List<string> Percurso { get; set; } = new();
        public int DistanciaKm { get; set; }
        public int NumeroEstados { get; set; }
        public bool Recomendada { get; set; }
    }

    // EstadoDto removido - usando o do MunicipiosController para evitar duplicação
}
