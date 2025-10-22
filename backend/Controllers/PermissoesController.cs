using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Attributes;
using Backend.Api.Services;
using Backend.Api.Models;
using Backend.Api.DTOs;
using Backend.Api.Data;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // REMOVIDO temporariamente para desenvolvimento - Reativar em produção
    public class PermissoesController : ControllerBase
    {
        private readonly IPermissaoService _permissaoService;
        private readonly SistemaContext _context;

        public PermissoesController(IPermissaoService permissaoService, SistemaContext context)
        {
            _permissaoService = permissaoService;
            _context = context;
        }

        [HttpGet]
        [RequiresPermission("admin.permissions.read")]
        public async Task<ActionResult<IEnumerable<Permissao>>> GetAllPermissoes()
        {
            try
            {
                var permissoes = await _permissaoService.GetAllPermissoesAsync();
                return Ok(permissoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpGet("modulos")]
        [RequiresPermission("admin.permissions.read")]
        public async Task<ActionResult<IEnumerable<string>>> GetModulos()
        {
            try
            {
                var modulos = await _permissaoService.GetModulosAsync();
                return Ok(modulos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpGet("modulo/{modulo}")]
        [RequiresPermission("admin.permissions.read")]
        public async Task<ActionResult<IEnumerable<Permissao>>> GetPermissoesByModulo(string modulo)
        {
            try
            {
                var permissoes = await _permissaoService.GetPermissoesByModuloAsync(modulo);
                return Ok(permissoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpGet("cargo/{cargoId}")]
        [RequiresPermission("admin.permissions.read")]
        public async Task<ActionResult<IEnumerable<Permissao>>> GetPermissoesByCargoId(int cargoId)
        {
            try
            {
                var permissoes = await _permissaoService.GetPermissoesByCargoIdAsync(cargoId);
                return Ok(permissoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpPost("cargo/{cargoId}/permissao/{permissaoId}")]
        [RequiresPermission("admin.permissions.assign")]
        public async Task<ActionResult> AtribuirPermissaoToCargo(int cargoId, int permissaoId)
        {
            try
            {
                await _permissaoService.AtribuirPermissaoToCargoAsync(cargoId, permissaoId);
                return Ok(new { message = "Permissão atribuída com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpDelete("cargo/{cargoId}/permissao/{permissaoId}")]
        [RequiresPermission("admin.permissions.assign")]
        public async Task<ActionResult> RemoverPermissaoFromCargo(int cargoId, int permissaoId)
        {
            try
            {
                // Verificar se o cargo é "Programador"
                var cargo = await _context.Cargos.FindAsync(cargoId);
                if (cargo != null && cargo.Nome == "Programador")
                {
                    return BadRequest(new { message = "Não é possível remover permissões do cargo Programador" });
                }

                await _permissaoService.RemoverPermissaoFromCargoAsync(cargoId, permissaoId);
                return Ok(new { message = "Permissão removida com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<string>>> GetUserPermissions()
        {
            try
            {
                // Extrair cargoId e cargo do JWT
                var cargoIdClaim = User?.FindFirst("CargoId")?.Value;
                var cargoNomeClaim = User?.FindFirst("Cargo")?.Value;

                Console.WriteLine($"[PERMISSOES] Solicitação de permissões - CargoId: {cargoIdClaim}, Cargo: {cargoNomeClaim}");

                if (!int.TryParse(cargoIdClaim, out int cargoId))
                {
                    Console.WriteLine($"[PERMISSOES] ERRO: CargoId inválido ou não encontrado no token");
                    return Ok(new List<string>());
                }

                // Se for cargo Programador, garantir que retorna todas as permissões
                if (cargoNomeClaim == "Programador")
                {
                    var todasPermissoes = await _context.Permissoes
                        .Where(p => p.Ativo)
                        .Select(p => p.Codigo)
                        .ToListAsync();
                    
                    Console.WriteLine($"[PERMISSOES] Cargo Programador detectado - Retornando {todasPermissoes.Count} permissões");
                    return Ok(todasPermissoes);
                }

                var permissions = await _permissaoService.GetUserPermissionsAsync(cargoId);
                Console.WriteLine($"[PERMISSOES] Retornando {permissions.Count()} permissões para cargoId: {cargoId}");
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PERMISSOES] ERRO: {ex.Message}");
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpGet("user/has/{permissionCode}")]
        public async Task<ActionResult<bool>> UserHasPermission(string permissionCode)
        {
            try
            {
                // Extrair cargoId do JWT
                var cargoIdClaim = User?.FindFirst("CargoId")?.Value;

                if (!int.TryParse(cargoIdClaim, out int cargoId))
                {
                    return Ok(false);
                }

                var hasPermission = await _permissaoService.UserHasPermissionAsync(cargoId, permissionCode);
                return Ok(hasPermission);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }
    }
}
