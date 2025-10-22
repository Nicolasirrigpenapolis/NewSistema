// Teste de modificação - AuthController.cs
using System;
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
using Microsoft.Extensions.Hosting;

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
        private readonly IHostEnvironment _environment;
        private readonly IServiceProvider _serviceProvider;
        private readonly ITenantService _tenantService;
        private readonly bool _disableAuth;

        public AuthController(
            IConfiguration configuration,
            SistemaContext context,
            IPasswordHasher passwordHasher,
            IPermissaoService permissaoService,
            IHostEnvironment environment,
            IServiceProvider serviceProvider,
            ITenantService tenantService)
        {
            _configuration = configuration;
            _context = context;
            _passwordHasher = passwordHasher;
            _permissaoService = permissaoService;
            _tenantService = tenantService;
            _environment = environment;
            _serviceProvider = serviceProvider;
            _disableAuth = configuration.GetValue<bool?>("Auth:DisableAuthentication") ?? false;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            return await ProcessLogin(request);
        }

        // Endpoint amigável para compatibilidade com testes que esperam POST /api/auth
        [HttpPost]
        public async Task<IActionResult> AuthRoot([FromBody] LoginRequest request)
        {
            return await ProcessLogin(request);
        }

        private async Task<IActionResult> ProcessLogin(LoginRequest request)
        {
            try
            {
                var loginRequest = request ?? new LoginRequest();

                // Autenticação desabilitada (modo desenvolvimento/testes)
                if (_disableAuth)
                {
                    var usernameDev = !string.IsNullOrWhiteSpace(loginRequest.Username)
                        ? loginRequest.Username
                        : (!string.IsNullOrWhiteSpace(loginRequest.Email) ? loginRequest.Email : "dev");
                    var displayName = usernameDev;
                    var devToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{usernameDev}:dev:{DateTime.UtcNow:O}"));

                    return Ok(new LoginResponse
                    {
                        Token = devToken,
                        User = new UserInfo
                        {
                            Id = 0,
                            Nome = displayName,
                            Username = usernameDev,
                            CargoId = null,
                            CargoNome = "DEV"
                        }
                    });
                }

                if (string.IsNullOrWhiteSpace(loginRequest.Username) || string.IsNullOrWhiteSpace(loginRequest.Password))
                {
                    return BadRequest(new { message = "Credenciais inválidas" });
                }

                Console.WriteLine($"[AUTH] Tentativa de login para usuário: {loginRequest.Username}");

                var user = await _context.Usuarios
                    .Include(u => u.Cargo)
                    .FirstOrDefaultAsync(u => u.UserName == loginRequest.Username);

                if (user == null || !user.Ativo)
                {
                    Console.WriteLine($"[AUTH] Usuário não encontrado ou inativo: {loginRequest.Username}");
                    return BadRequest(new { message = "Credenciais inválidas" });
                }

                Console.WriteLine($"[AUTH] Usuário encontrado: {user.Nome} (ID: {user.Id}), Cargo: {user.Cargo?.Nome ?? "SEM CARGO"}, CargoId: {user.CargoId?.ToString() ?? "NULL"}");

                if (!_passwordHasher.VerifyPassword(user.PasswordHash, loginRequest.Password))
                {
                    Console.WriteLine($"[AUTH] Senha incorreta para usuário: {loginRequest.Username}");
                    return BadRequest(new { message = "Credenciais inválidas" });
                }

                var token = await GenerateJwtTokenAsync(user);

                // Atualizar último login de forma assíncrona (não bloqueante)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        using var scope = _serviceProvider.CreateScope();
                        var dbContext = scope.ServiceProvider.GetRequiredService<SistemaContext>();
                        var userToUpdate = await dbContext.Usuarios.FindAsync(user.Id);
                        if (userToUpdate != null)
                        {
                            userToUpdate.DataUltimoLogin = DateTime.Now;
                            await dbContext.SaveChangesAsync();
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[AUTH] Erro ao atualizar último login: {ex.Message}");
                    }
                });

                Console.WriteLine($"[AUTH] Login bem-sucedido para: {user.Nome}");

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
        // [Authorize] // REMOVIDO temporariamente para desenvolvimento - Reativar em produção
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Verificar se o usuário atual é Master ou Admin
                // Em modo desenvolvimento/_disableAuth permitir operação (bypass) para testes automatizados
                var canProceed = _disableAuth;
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!canProceed)
                {
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
        // [Authorize] // REMOVIDO temporariamente para desenvolvimento - Reativar em produção
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

        [HttpGet("users/{id}")]
        // [Authorize] // REMOVIDO temporariamente para desenvolvimento - Reativar em produção
        public async Task<IActionResult> GetUser(int id)
        {
            try
            {
                var user = await _context.Usuarios
                    .Include(u => u.Cargo)
                    .Where(u => u.Id == id)
                    .Select(u => new
                    {
                        u.Id,
                        u.Nome,
                        Email = u.UserName, // Assumindo que UserName contém o email
                        Username = u.UserName,
                        u.CargoId,
                        CargoNome = u.Cargo != null ? u.Cargo.Nome : null,
                        u.Ativo,
                        DataCriacao = u.DataCriacao,
                        UltimoLogin = u.DataUltimoLogin
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new { message = "Usuário não encontrado" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao buscar usuário", error = ex.Message });
            }
        }

        [HttpPut("users/{id}")]
        // [Authorize] // REMOVIDO temporariamente para desenvolvimento - Reativar em produção
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                // Verificar se o usuário atual é Master ou Admin
                // Em modo desenvolvimento/_disableAuth permitir operação (bypass)
                var canProceedUpdate = _disableAuth;
                var currentUserIdUpdate = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!canProceedUpdate)
                {
                    if (currentUserIdUpdate == null)
                    {
                        return Unauthorized(new { message = "Usuário não autenticado" });
                    }

                    var currentUser = await _context.Usuarios
                        .Include(u => u.Cargo)
                        .FirstOrDefaultAsync(u => u.Id.ToString() == currentUserIdUpdate);

                    if (currentUser == null || currentUser.Cargo?.Nome != "Programador")
                    {
                        return Forbid("Apenas usuários com cargo 'Programador' podem editar usuários");
                    }
                }

                var user = await _context.Usuarios.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Usuário não encontrado" });
                }

                // Atualizar campos
                if (!string.IsNullOrWhiteSpace(request.Nome))
                {
                    user.Nome = request.Nome;
                }

                if (!string.IsNullOrWhiteSpace(request.Email))
                {
                    // Verificar se o email já está em uso por outro usuário
                    var emailExists = await _context.Usuarios
                        .AnyAsync(u => u.UserName == request.Email && u.Id != id);
                    
                    if (emailExists)
                    {
                        return BadRequest(new { message = "E-mail já está em uso por outro usuário" });
                    }
                    
                    user.UserName = request.Email;
                }

                if (request.CargoId.HasValue)
                {
                    user.CargoId = request.CargoId.Value;
                }

                if (!string.IsNullOrWhiteSpace(request.Password))
                {
                    user.PasswordHash = _passwordHasher.HashPassword(request.Password);
                }

                if (request.Ativo.HasValue)
                {
                    user.Ativo = request.Ativo.Value;
                }

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar usuário", error = ex.Message });
            }
        }

        [HttpDelete("users/{id}")]
        // [Authorize] // REMOVIDO temporariamente para desenvolvimento - Reativar em produção
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                // Verificar se o usuário atual é Master ou Admin
                // Em modo desenvolvimento/_disableAuth permitir operação (bypass)
                var canProceedDelete = _disableAuth;
                var currentUserIdDelete = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!canProceedDelete)
                {
                    if (currentUserIdDelete == null)
                    {
                        return Unauthorized(new { message = "Usuário não autenticado" });
                    }

                    var currentUser = await _context.Usuarios
                        .Include(u => u.Cargo)
                        .FirstOrDefaultAsync(u => u.Id.ToString() == currentUserIdDelete);

                    if (currentUser == null || currentUser.Cargo?.Nome != "Programador")
                    {
                        return Forbid("Apenas usuários com cargo 'Programador' podem excluir usuários");
                    }

                    // Não permitir excluir a si mesmo
                    if (currentUserIdDelete == id.ToString())
                    {
                        return BadRequest(new { message = "Você não pode excluir seu próprio usuário" });
                    }
                }

                var user = await _context.Usuarios.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Usuário não encontrado" });
                }

                _context.Usuarios.Remove(user);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao excluir usuário", error = ex.Message });
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

            // Adicionar o tenant (empresa) ao token JWT
            Console.WriteLine($"[AUTH] TenantIdAtual no momento da geração do JWT: {_tenantService.TenantIdAtual ?? "NULL"}");
            if (_tenantService.TenantIdAtual != null)
            {
                var tenantId = _tenantService.TenantIdAtual.ToString();
                claims.Add(new(ClaimTypes.Actor, tenantId));
                Console.WriteLine($"[AUTH] Tenant adicionado ao token: {tenantId}");
            }
            else
            {
                Console.WriteLine($"[AUTH] ERRO: TenantIdAtual está NULL! Não foi possível adicionar tenant ao JWT.");
            }

            // Adicionar cargo se tiver
            if (user.Cargo != null && user.CargoId.HasValue)
            {
                claims.Add(new Claim(ClaimTypes.Role, user.Cargo.Nome));
                claims.Add(new Claim("Cargo", user.Cargo.Nome));
                claims.Add(new Claim("CargoId", user.CargoId.Value.ToString()));

                // Log para debug
                Console.WriteLine($"[AUTH] Gerando token para usuário: {user.Nome}, Cargo: {user.Cargo.Nome}, CargoId: {user.CargoId.Value}");

                // Adicionar permissões do cargo ao JWT
                var permissoes = await _permissaoService.GetUserPermissionsAsync(user.CargoId);
                Console.WriteLine($"[AUTH] {permissoes.Count()} permissões carregadas para o cargo {user.Cargo.Nome}");
                
                foreach (var permissao in permissoes)
                {
                    claims.Add(new Claim("Permission", permissao));
                }
            }
            else
            {
                Console.WriteLine($"[AUTH] AVISO: Usuário {user.Nome} (ID: {user.Id}) não possui cargo ou CargoId!");
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
