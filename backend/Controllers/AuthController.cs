// Teste de modificação - AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Api.Models;
using Backend.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Services;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly SistemaContext _context;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IPermissaoService _permissaoService;

        public AuthController(
            IConfiguration configuration,
            SistemaContext context,
            IPasswordHasher passwordHasher,
            IPermissaoService permissaoService)
        {
            _configuration = configuration;
            _context = context;
            _passwordHasher = passwordHasher;
            _permissaoService = permissaoService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _context.Usuarios
                    .Include(u => u.Cargo)
                    .FirstOrDefaultAsync(u => u.UserName == request.Username);

                if (user == null || !user.Ativo)
                {
                    return BadRequest(new { message = "Credenciais inválidas" });
                }

                if (!_passwordHasher.VerifyPassword(user.PasswordHash, request.Password))
                {
                    return BadRequest(new { message = "Credenciais inválidas" });
                }

                var token = await GenerateJwtTokenAsync(user);

                // Atualizar último login
                user.DataUltimoLogin = DateTime.Now;
                await _context.SaveChangesAsync();

                return Ok(new LoginResponse
                {
                    Token = token,
                    User = new UserInfo
                    {
                        Id = user.Id,
                        Nome = user.Nome,
                        Username = user.UserName ?? "",
                        CargoId = user.CargoId,
                        CargoNome = user.Cargo?.Nome
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpPost("register")]
        [Authorize]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Verificar se o usuário atual é Master ou Admin
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (currentUserId == null)
                {
                    return Unauthorized(new { message = "Usuário não autenticado" });
                }

                var currentUser = await _context.Usuarios
                    .Include(u => u.Cargo)
                    .FirstOrDefaultAsync(u => u.Id.ToString() == currentUserId);

                if (currentUser == null || currentUser.Cargo?.Nome != "Programador")
                {
                    return Forbid("Apenas usuários com cargo 'Programador' podem criar novos usuários");
                }

                var existingUser = await _context.Usuarios.FirstOrDefaultAsync(u => u.UserName == request.Username);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Nome de usuário já está em uso" });
                }

                var user = new Usuario
                {
                    UserName = request.Username,
                    Nome = request.Nome,
                    CargoId = request.CargoId,
                    PasswordHash = _passwordHasher.HashPassword(request.Password),
                    Ativo = true,
                    DataCriacao = DateTime.Now
                };

                _context.Usuarios.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Usuário criado com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpGet("users")]
        [Authorize]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Usuarios
                    .Include(u => u.Cargo)
                    .Select(u => new
                    {
                        u.Id,
                        u.Nome,
                        Username = u.UserName,
                        u.CargoId,
                        CargoNome = u.Cargo != null ? u.Cargo.Nome : null,
                        u.Ativo,
                        DataCriacao = u.DataCriacao,
                        UltimoLogin = u.DataUltimoLogin
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao listar usuários", error = ex.Message });
            }
        }

        [HttpPost("debug/reset-master")]
        public async Task<IActionResult> ResetMasterPassword()
        {
            try
            {
                var masterUser = await _context.Usuarios.FirstOrDefaultAsync(u => u.UserName == "master");
                if (masterUser == null)
                {
                    return BadRequest(new { message = "Usuário master não encontrado" });
                }

                masterUser.PasswordHash = _passwordHasher.HashPassword("master123");
                await _context.SaveChangesAsync();

                return Ok(new { message = "Senha do master resetada para 'master123'" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpGet("debug/users")]
        public async Task<IActionResult> DebugUsers()
        {
            try
            {
                var users = await _context.Usuarios
                    .Select(u => new { u.Id, u.UserName, u.Nome, u.Ativo, u.DataCriacao })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpPost("bootstrap")]
        public async Task<IActionResult> Bootstrap()
        {
            try
            {
                // Verificar se já existe algum usuário no sistema
                var userCount = await _context.Usuarios.CountAsync();
                if (userCount > 0)
                {
                    return BadRequest(new { message = "Sistema já foi inicializado" });
                }

                // Criar cargo Programador se não existir
                var cargo = await _context.Cargos.FirstOrDefaultAsync(c => c.Nome == "Programador");
                if (cargo == null)
                {
                    cargo = new Cargo
                    {
                        Nome = "Programador",
                        Descricao = "Desenvolvedor do sistema com acesso total",
                        Ativo = true,
                        DataCriacao = DateTime.Now
                    };
                    _context.Cargos.Add(cargo);
                    await _context.SaveChangesAsync();
                }

                // Atribuir todas as permissões ao cargo Programador
                var todasPermissoes = await _context.Permissoes.Where(p => p.Ativo).ToListAsync();
                foreach (var permissao in todasPermissoes)
                {
                    await _permissaoService.AtribuirPermissaoToCargoAsync(cargo.Id, permissao.Id);
                }

                // Criar usuário master
                var masterUser = new Usuario
                {
                    UserName = "master",
                    Nome = "Usuário Master do Sistema",
                    CargoId = cargo.Id,
                    PasswordHash = _passwordHasher.HashPassword("master123"),
                    Ativo = true,
                    DataCriacao = DateTime.Now
                };

                _context.Usuarios.Add(masterUser);
                await _context.SaveChangesAsync();

                return Ok(new {
                    message = "Usuário master criado com sucesso",
                    username = "master",
                    password = "master123",
                    permissoesAtribuidas = todasPermissoes.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        [HttpPost("fix-programador-permissions")]
        public async Task<IActionResult> FixProgramadorPermissions()
        {
            try
            {
                // Buscar cargo Programador
                var cargo = await _context.Cargos.FirstOrDefaultAsync(c => c.Nome == "Programador");
                if (cargo == null)
                {
                    return BadRequest(new { message = "Cargo Programador não encontrado" });
                }

                // Obter todas as permissões ativas
                var todasPermissoes = await _context.Permissoes.Where(p => p.Ativo).ToListAsync();

                // Atribuir todas as permissões ao cargo Programador
                int permissoesAdicionadas = 0;
                foreach (var permissao in todasPermissoes)
                {
                    var existe = await _context.CargoPermissoes
                        .AnyAsync(cp => cp.CargoId == cargo.Id && cp.PermissaoId == permissao.Id);

                    if (!existe)
                    {
                        await _permissaoService.AtribuirPermissaoToCargoAsync(cargo.Id, permissao.Id);
                        permissoesAdicionadas++;
                    }
                }

                return Ok(new {
                    message = "Permissões do cargo Programador atualizadas",
                    totalPermissoes = todasPermissoes.Count,
                    permissoesAdicionadas = permissoesAdicionadas
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", error = ex.Message });
            }
        }

        private async Task<string> GenerateJwtTokenAsync(Usuario user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Nome)
            };

            // Adicionar cargo se tiver
            if (user.Cargo != null)
            {
                claims.Add(new Claim(ClaimTypes.Role, user.Cargo.Nome));
                claims.Add(new Claim("Cargo", user.Cargo.Nome));
                claims.Add(new Claim("CargoId", user.CargoId.ToString() ?? ""));

                // Adicionar permissões do cargo ao JWT
                var permissoes = await _permissaoService.GetUserPermissionsAsync(user.CargoId);
                foreach (var permissao in permissoes)
                {
                    claims.Add(new Claim("Permission", permissao));
                }
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpirationInMinutes"]!)),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
