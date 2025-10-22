using Backend.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Api.Controllers;

/// <summary>
/// Controller para gerenciar seleção de empresas (multi-tenant)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EmpresasController : ControllerBase
{
    private readonly ITenantService _tenantService;
    private readonly ILogger<EmpresasController> _logger;

    public EmpresasController(ITenantService tenantService, ILogger<EmpresasController> logger)
    {
        _tenantService = tenantService;
        _logger = logger;
    }

    /// <summary>
    /// Obtém lista de empresas disponíveis para seleção no login
    /// </summary>
    [HttpGet("disponiveis")]
    public IActionResult ObterEmpresasDisponiveis()
    {
        try
        {
            var empresas = _tenantService.ObterEmpresasAtivas();

            var resultado = empresas.Select(e => new
            {
                e.Id,
                e.Nome,
                e.NomeExibicao,
                e.Logo,
                e.LogoLogin,
                e.FundoLogin,
                e.CorPrimaria,
                e.CorSecundaria
            }).ToList();

            _logger.LogInformation("[Empresas] Retornando {Count} empresas disponíveis", resultado.Count);

            return Ok(new
            {
                success = true,
                data = resultado
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Empresas] Erro ao obter empresas disponíveis");
            return StatusCode(500, new
            {
                success = false,
                error = "Erro ao carregar empresas disponíveis"
            });
        }
    }

    /// <summary>
    /// Obtém configuração da empresa atual (tenant)
    /// </summary>
    [HttpGet("atual")]
    public IActionResult ObterEmpresaAtual()
    {
        try
        {
            var tenantId = _tenantService.TenantIdAtual;
            
            if (string.IsNullOrEmpty(tenantId))
            {
                return BadRequest(new
                {
                    success = false,
                    error = "Nenhuma empresa selecionada. Use o header X-Tenant-Id."
                });
            }

            var empresa = _tenantService.TenantAtual;
            
            if (empresa == null)
            {
                return NotFound(new
                {
                    success = false,
                    error = "Empresa não encontrada"
                });
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    empresa.Id,
                    empresa.Nome,
                    empresa.NomeExibicao,
                    empresa.Logo,
                    empresa.CorPrimaria,
                    empresa.CorSecundaria
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Empresas] Erro ao obter empresa atual");
            return StatusCode(500, new
            {
                success = false,
                error = "Erro ao obter empresa atual"
            });
        }
    }
}
