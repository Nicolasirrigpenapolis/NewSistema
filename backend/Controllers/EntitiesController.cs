using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Models;
using Backend.Api.DTOs;

namespace Backend.Api.Controllers
{
    /// <summary>
    /// Controller para fornecer entidades formatadas para UI
    /// Backend responsável por transformações e formatação
    /// </summary>
    [ApiController]
    [Route("api/entities")]
    public class EntitiesController : ControllerBase
    {
        private readonly SistemaContext _context;
        private readonly ILogger<EntitiesController> _logger;

        public EntitiesController(SistemaContext context, ILogger<EntitiesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Obter dados completos do emitente por ID (para auto-popular formulário)
        /// </summary>
        [HttpGet("emitentes/{id}")]
        public async Task<ActionResult<ApiResponse<object>>> GetEmitenteById(int id)
        {
            try
            {
                var emitente = await _context.Emitentes
                    .Where(e => e.Id == id && e.Ativo)
                    .FirstOrDefaultAsync();

                if (emitente == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Emitente não encontrado"
                    });
                }

                var emitenteData = new
                {
                    id = emitente.Id,
                    uf = emitente.Uf,
                    municipio = emitente.Municipio,
                    codigoMunicipio = emitente.CodMunicipio,
                    razaoSocial = emitente.RazaoSocial,
                    cnpj = emitente.Cnpj,
                    ie = emitente.Ie,
                    modal = emitente.ModalTransporte,
                    tipoTransportador = emitente.TipoTransportador,
                    serie = emitente.SerieInicial
                };

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Dados do emitente obtidos com sucesso",
                    Data = emitenteData
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter dados do emitente {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Erro interno do servidor"
                });
            }
        }

        /// <summary>
        /// Obter emitentes formatados para combobox UI
        /// </summary>
        [HttpGet("emitentes")]
        public async Task<ActionResult> GetEmitentes()
        {
            try
            {
                var emitentes = await _context.Emitentes
                    .Where(e => e.Ativo)
                    .OrderBy(e => e.RazaoSocial)
                    .Take(100)
                    .Select(e => new EntityOption
                    {
                        Id = e.Id.ToString(),
                        Label = e.RazaoSocial ?? e.NomeFantasia ?? "",
                        Description = $"{FormatCNPJ(e.Cnpj ?? "")} - {e.Municipio}"
                    })
                    .ToListAsync();

                return Ok(new ApiResponse<List<EntityOption>>
                {
                    Success = true,
                    Message = "Emitentes obtidos com sucesso",
                    Data = emitentes
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter emitentes");
                return StatusCode(500, new ApiResponse<List<EntityOption>>
                {
                    Success = false,
                    Message = "Erro interno do servidor"
                });
            }
        }

        /// <summary>
        /// Obter condutores formatados para combobox UI
        /// </summary>
        [HttpGet("condutores")]
        public async Task<ActionResult<ApiResponse<List<EntityOption>>>> GetCondutores()
        {
            try
            {
                var condutores = await _context.Condutores
                    .Where(c => c.Ativo)
                    .OrderBy(c => c.Nome)
                    .Take(100)
                    .Select(c => new EntityOption
                    {
                        Id = c.Id.ToString(),
                        Label = c.Nome,
                        Description = $"CPF: {FormatCPF(c.Cpf)}"
                    })
                    .ToListAsync();

                return Ok(ApiResponse<List<EntityOption>>.CreateSuccess(condutores));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter condutores");
                return StatusCode(500, ApiResponse<List<EntityOption>>.CreateError("Erro interno do servidor"));
            }
        }

        /// <summary>
        /// Obter veículos formatados para combobox UI
        /// </summary>
        [HttpGet("veiculos")]
        public async Task<ActionResult<ApiResponse<List<EntityOption>>>> GetVeiculos()
        {
            try
            {
                var veiculos = await _context.Veiculos
                    .Where(v => v.Ativo)
                    .OrderBy(v => v.Placa)
                    .Take(100)
                    .Select(v => new EntityOption
                    {
                        Id = v.Id.ToString(),
                        Label = $"{v.Placa} - {v.TipoCarroceria ?? "Veículo"}",
                        Description = $"Tara: {v.Tara:F3}kg"
                    })
                    .ToListAsync();

                return Ok(ApiResponse<List<EntityOption>>.CreateSuccess(veiculos));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter veículos");
                return StatusCode(500, ApiResponse<List<EntityOption>>.CreateError("Erro interno do servidor"));
            }
        }

        /// <summary>
        /// Obter contratantes formatados para combobox UI
        /// </summary>
        [HttpGet("contratantes")]
        public async Task<ActionResult<ApiResponse<List<EntityOption>>>> GetContratantes()
        {
            try
            {
                var contratantes = await _context.Contratantes
                    .Where(c => c.Ativo)
                    .OrderBy(c => c.RazaoSocial)
                    .Take(100)
                    .Select(c => new EntityOption
                    {
                        Id = c.Id.ToString(),
                        Label = c.RazaoSocial ?? c.NomeFantasia ?? "",
                        Description = $"{(string.IsNullOrEmpty(c.Cnpj) ? FormatCPF(c.Cpf ?? "") : FormatCNPJ(c.Cnpj))} - {c.Municipio}"
                    })
                    .ToListAsync();

                return Ok(ApiResponse<List<EntityOption>>.CreateSuccess(contratantes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter contratantes");
                return StatusCode(500, ApiResponse<List<EntityOption>>.CreateError("Erro interno do servidor"));
            }
        }

        /// <summary>
        /// Obter seguradoras formatadas para combobox UI
        /// </summary>
        [HttpGet("seguradoras")]
        public async Task<ActionResult<ApiResponse<List<EntityOption>>>> GetSeguradoras()
        {
            try
            {
                var seguradoras = await _context.Seguradoras
                    .Where(s => s.Ativo)
                    .OrderBy(s => s.RazaoSocial)
                    .Take(100)
                    .Select(s => new EntityOption
                    {
                        Id = s.Id.ToString(),
                        Label = s.RazaoSocial,
                        Description = $"CNPJ: {FormatCNPJ(s.Cnpj)}"
                    })
                    .ToListAsync();

                return Ok(ApiResponse<List<EntityOption>>.CreateSuccess(seguradoras));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter seguradoras");
                return StatusCode(500, ApiResponse<List<EntityOption>>.CreateError("Erro interno do servidor"));
            }
        }

        /// <summary>
        /// Obter todas as entidades para o wizard em uma chamada
        /// Backend unifica e formata tudo
        /// </summary>
        [HttpGet("wizard")]
        public async Task<ActionResult<ApiResponse<WizardEntitiesResponse>>> GetWizardEntities()
        {
            try
            {
                var emitentes = await _context.Emitentes
                    .Where(e => e.Ativo)
                    .OrderBy(e => e.RazaoSocial)
                    .Take(100)
                    .Select(e => new EntityOption
                    {
                        Id = e.Id.ToString(),
                        Label = e.RazaoSocial ?? e.NomeFantasia ?? "",
                        Description = $"{FormatCNPJ(e.Cnpj ?? "")} - {e.Municipio}"
                    })
                    .ToListAsync();

                var condutores = await _context.Condutores
                    .Where(c => c.Ativo)
                    .OrderBy(c => c.Nome)
                    .Take(100)
                    .Select(c => new EntityOption
                    {
                        Id = c.Id.ToString(),
                        Label = c.Nome,
                        Description = $"CPF: {FormatCPF(c.Cpf)}"
                    })
                    .ToListAsync();

                var veiculos = await _context.Veiculos
                    .Where(v => v.Ativo)
                    .OrderBy(v => v.Placa)
                    .Take(100)
                    .Select(v => new EntityOption
                    {
                        Id = v.Id.ToString(),
                        Label = $"{v.Placa} - {v.TipoCarroceria ?? "Veículo"}",
                        Description = $"Tara: {v.Tara:F3}kg"
                    })
                    .ToListAsync();

                var contratantes = await _context.Contratantes
                    .Where(c => c.Ativo)
                    .OrderBy(c => c.RazaoSocial)
                    .Take(100)
                    .Select(c => new EntityOption
                    {
                        Id = c.Id.ToString(),
                        Label = c.RazaoSocial ?? c.NomeFantasia ?? "",
                        Description = $"{(string.IsNullOrEmpty(c.Cnpj) ? FormatCPF(c.Cpf ?? "") : FormatCNPJ(c.Cnpj))} - {c.Municipio}"
                    })
                    .ToListAsync();

                var seguradoras = await _context.Seguradoras
                    .Where(s => s.Ativo)
                    .OrderBy(s => s.RazaoSocial)
                    .Take(100)
                    .Select(s => new EntityOption
                    {
                        Id = s.Id.ToString(),
                        Label = s.RazaoSocial,
                        Description = $"CNPJ: {FormatCNPJ(s.Cnpj)}"
                    })
                    .ToListAsync();

                var response = new WizardEntitiesResponse
                {
                    Emitentes = emitentes,
                    Condutores = condutores,
                    Veiculos = veiculos,
                    Contratantes = contratantes,
                    Seguradoras = seguradoras
                };

                return Ok(ApiResponse<WizardEntitiesResponse>.CreateSuccess(response));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter entidades do wizard");
                return StatusCode(500, ApiResponse<WizardEntitiesResponse>.CreateError("Erro interno do servidor"));
            }
        }

        // Métodos de formatação centralizados no backend
        private static string FormatCNPJ(string cnpj)
        {
            if (string.IsNullOrEmpty(cnpj)) return "";
            var numbers = new string(cnpj.Where(char.IsDigit).ToArray());
            if (numbers.Length != 14) return cnpj;

            return $"{numbers.Substring(0, 2)}.{numbers.Substring(2, 3)}.{numbers.Substring(5, 3)}/{numbers.Substring(8, 4)}-{numbers.Substring(12, 2)}";
        }

        private static string FormatCPF(string cpf)
        {
            if (string.IsNullOrEmpty(cpf)) return "";
            var numbers = new string(cpf.Where(char.IsDigit).ToArray());
            if (numbers.Length != 11) return cpf;

            return $"{numbers.Substring(0, 3)}.{numbers.Substring(3, 3)}.{numbers.Substring(6, 3)}-{numbers.Substring(9, 2)}";
        }
    }

    // DTOs para o controller
    public class EntityOption
    {
        public string Id { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class WizardEntitiesResponse
    {
        public List<EntityOption> Emitentes { get; set; } = new();
        public List<EntityOption> Condutores { get; set; } = new();
        public List<EntityOption> Veiculos { get; set; } = new();
        public List<EntityOption> Contratantes { get; set; } = new();
        public List<EntityOption> Seguradoras { get; set; } = new();
    }
}
