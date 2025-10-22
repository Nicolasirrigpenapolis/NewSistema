using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Models;
using Backend.Api.Services;
using Backend.Api.Attributes;
using System.Security.Claims;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // REMOVIDO temporariamente para desenvolvimento - Reativar em produção
    public class CargosController : ControllerBase
    {
        private readonly SistemaContext _context;
        private readonly IPermissaoService _permissaoService;

        public CargosController(SistemaContext context, IPermissaoService permissaoService)
        {
            _context = context;
            _permissaoService = permissaoService;
        }

        [HttpGet]
        [RequiresPermission("cargos.listar")]
        public async Task<IActionResult> GetCargos()
        {
            try
            {
                var cargos = await _context.Cargos
                    .Include(c => c.Usuarios)
                    .OrderBy(c => c.Nome)
                    .Select(c => new CargoResponse
                    {
                        Id = c.Id,
                        Nome = c.Nome,
                        Descricao = c.Descricao,
                        Ativo = c.Ativo,
                        DataCriacao = c.DataCriacao,
                        DataUltimaAlteracao = c.DataUltimaAlteracao,
                        QuantidadeUsuarios = c.Usuarios.Count(u => u.Ativo)
                    })
                    .ToListAsync();

                return Ok(cargos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [RequiresPermission("cargos.listar")]
        public async Task<IActionResult> GetCargo(int id)
        {
            try
            {
                var cargo = await _context.Cargos
                    .Include(c => c.Usuarios)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (cargo == null)
                {
                    return NotFound(new { message = "Cargo não encontrado" });
                }

                var response = new CargoResponse
                {
                    Id = cargo.Id,
                    Nome = cargo.Nome,
                    Descricao = cargo.Descricao,
                    Ativo = cargo.Ativo,
                    DataCriacao = cargo.DataCriacao,
                    DataUltimaAlteracao = cargo.DataUltimaAlteracao,
                    QuantidadeUsuarios = cargo.Usuarios.Count(u => u.Ativo)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpPost]
        [RequiresPermission("cargos.criar")]
        public async Task<IActionResult> CreateCargo([FromBody] CargoCreateRequest request)
        {
            try
            {
                // Verificar se já existe um cargo com o mesmo nome
                var existingCargo = await _context.Cargos
                    .FirstOrDefaultAsync(c => c.Nome.ToLower() == request.Nome.ToLower());

                if (existingCargo != null)
                {
                    return BadRequest(new { message = "Já existe um cargo com este nome" });
                }

                var cargo = new Cargo
                {
                    Nome = request.Nome.Trim(),
                    Descricao = request.Descricao?.Trim(),
                    Ativo = true,
                    DataCriacao = DateTime.Now
                };

                _context.Cargos.Add(cargo);
                await _context.SaveChangesAsync();

                var response = new CargoResponse
                {
                    Id = cargo.Id,
                    Nome = cargo.Nome,
                    Descricao = cargo.Descricao,
                    Ativo = cargo.Ativo,
                    DataCriacao = cargo.DataCriacao,
                    DataUltimaAlteracao = cargo.DataUltimaAlteracao,
                    QuantidadeUsuarios = 0
                };

                return CreatedAtAction(nameof(GetCargo), new { id = cargo.Id }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [RequiresPermission("cargos.editar")]
        public async Task<IActionResult> UpdateCargo(int id, [FromBody] CargoUpdateRequest request)
        {
            try
            {

                var cargo = await _context.Cargos.FindAsync(id);
                if (cargo == null)
                {
                    return NotFound(new { message = "Cargo não encontrado" });
                }

                // Verificar se já existe outro cargo com o mesmo nome
                var existingCargo = await _context.Cargos
                    .FirstOrDefaultAsync(c => c.Id != id && c.Nome.ToLower() == request.Nome.ToLower());

                if (existingCargo != null)
                {
                    return BadRequest(new { message = "Já existe outro cargo com este nome" });
                }

                cargo.Nome = request.Nome.Trim();
                cargo.Descricao = request.Descricao?.Trim();
                cargo.Ativo = request.Ativo;
                cargo.DataUltimaAlteracao = DateTime.Now;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Cargo atualizado com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [RequiresPermission("cargos.excluir")]
        public async Task<IActionResult> DeleteCargo(int id)
        {
            try
            {

                var cargo = await _context.Cargos
                    .Include(c => c.Usuarios)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (cargo == null)
                {
                    return NotFound(new { message = "Cargo não encontrado" });
                }

                // Verificar se há usuários ativos com este cargo
                if (cargo.Usuarios.Any(u => u.Ativo))
                {
                    return BadRequest(new { message = "Não é possível excluir cargo que possui usuários ativos" });
                }

                _context.Cargos.Remove(cargo);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cargo excluído com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpGet("{cargoId}/permissoes")]
        [RequiresPermission("cargos.gerenciar_permissoes")]
        public async Task<IActionResult> GetPermissoesByCargo(int cargoId)
        {
            try
            {
                var permissoes = await _permissaoService.GetPermissoesByCargoIdAsync(cargoId);
                return Ok(permissoes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpPost("{cargoId}/permissoes/{permissaoId}")]
        [RequiresPermission("cargos.gerenciar_permissoes")]
        public async Task<IActionResult> AtribuirPermissaoToCargo(int cargoId, int permissaoId)
        {
            try
            {
                await _permissaoService.AtribuirPermissaoToCargoAsync(cargoId, permissaoId);
                return Ok(new { message = "Permissão atribuída com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpDelete("{cargoId}/permissoes/{permissaoId}")]
        [RequiresPermission("cargos.gerenciar_permissoes")]
        public async Task<IActionResult> RemoverPermissaoFromCargo(int cargoId, int permissaoId)
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
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpPost("{cargoId}/permissoes/bulk")]
        [RequiresPermission("cargos.gerenciar_permissoes")]
        public async Task<IActionResult> AtualizarPermissoesCargo(int cargoId, [FromBody] System.Text.Json.JsonElement payload)
        {
            try
            {
                List<int> permissaoIds = new List<int>();

                // Aceitar array direto: [1,2,3] ou objeto { permissaoIds: [1,2,3] } ou { ids: [..] }
                try
                {
                    if (payload.ValueKind == System.Text.Json.JsonValueKind.Array)
                    {
                        foreach (var el in payload.EnumerateArray())
                        {
                            if (el.ValueKind == System.Text.Json.JsonValueKind.Number && el.TryGetInt32(out var v))
                                permissaoIds.Add(v);
                        }
                    }
                    else if (payload.ValueKind == System.Text.Json.JsonValueKind.Object)
                    {
                        if (payload.TryGetProperty("permissaoIds", out var p) && p.ValueKind == System.Text.Json.JsonValueKind.Array)
                        {
                            foreach (var el in p.EnumerateArray()) if (el.ValueKind == System.Text.Json.JsonValueKind.Number && el.TryGetInt32(out var v)) permissaoIds.Add(v);
                        }
                        else if (payload.TryGetProperty("ids", out var q) && q.ValueKind == System.Text.Json.JsonValueKind.Array)
                        {
                            foreach (var el in q.EnumerateArray()) if (el.ValueKind == System.Text.Json.JsonValueKind.Number && el.TryGetInt32(out var v)) permissaoIds.Add(v);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[CARGOS] Erro ao desserializar payload bulk: {ex.Message}");
                    return BadRequest(new { message = "Formato inválido para lista de permissões" });
                }

                Console.WriteLine($"[CARGOS] Recebendo requisição bulk para cargo {cargoId} com {permissaoIds?.Count ?? 0} permissões");

                if (permissaoIds == null || permissaoIds.Count == 0)
                {
                    // permitir lista vazia -> limpa permissões
                }

                // Verificar se o cargo existe
                var cargo = await _context.Cargos.FindAsync(cargoId);
                if (cargo == null)
                {
                    return NotFound(new { message = "Cargo não encontrado" });
                }

                // COMENTADO: Permitir modificar permissões do Programador durante testes
                // if (cargo.Nome == "Programador")
                // {
                //     return BadRequest(new { message = "Não é possível modificar permissões do cargo Programador" });
                // }

                // Remover todas as permissões atuais do cargo
                var cargoPermissoes = await _context.CargoPermissoes
                    .Where(cp => cp.CargoId == cargoId)
                    .ToListAsync();

                _context.CargoPermissoes.RemoveRange(cargoPermissoes);

                // Adicionar as novas permissões
                foreach (var permissaoId in permissaoIds ?? System.Linq.Enumerable.Empty<int>())
                {
                    var permissao = await _context.Permissoes.FindAsync(permissaoId);
                    if (permissao != null)
                    {
                        _context.CargoPermissoes.Add(new CargoPermissao
                        {
                            CargoId = cargoId,
                            PermissaoId = permissaoId
                        });
                    }
                }

                await _context.SaveChangesAsync();

                Console.WriteLine($"[CARGOS] Permissões do cargo {cargoId} atualizadas com sucesso - {permissaoIds?.Count ?? 0} permissões salvas");

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CARGOS] Erro ao atualizar permissões: {ex.Message}");
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }
    }
}
