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
        private readonly bool _disableAuth;

        public AuthController(
            IConfiguration configuration,
            SistemaContext context,
            IPasswordHasher passwordHasher,
            IPermissaoService permissaoService,
            IHostEnvironment environment)
        {
            _configuration = configuration;
            _context = context;
            _passwordHasher = passwordHasher;
            _permissaoService = permissaoService;
            _environment = environment;
            _disableAuth = configuration.GetValue<bool?>("Auth:DisableAuthentication") ?? true;
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

                var user = await _context.Usuarios
                    .Include(u => u.Cargo)
                    .FirstOrDefaultAsync(u => u.UserName == loginRequest.Username);

                if (user == null || !user.Ativo)
                {
                    return BadRequest(new { message = "Credenciais inválidas" });
                }

                if (!_passwordHasher.VerifyPassword(user.PasswordHash, loginRequest.Password))
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
        // [Authorize] // REMOVIDO temporariamente para desenvolvimento - Reativar em produção
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
