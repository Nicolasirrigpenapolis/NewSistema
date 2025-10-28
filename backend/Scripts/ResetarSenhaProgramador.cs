using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Backend.Api.Data;

namespace Backend.Api.Scripts
{
    /// <summary>
    /// Script utilitário para resetar a senha do usuário programador
    /// Execute este arquivo diretamente ou copie o código para um método temporário
    /// </summary>
    public class ResetarSenhaProgramador
    {
        private const string SALT = "SistemaModelo2024";
        private const string SENHA_PADRAO = "conectairrig@";
        private const string USERNAME_PROGRAMADOR = "programador";

        public static async Task Main(string[] args)
        {
            Console.WriteLine("==============================================");
            Console.WriteLine("   RESETAR SENHA DO PROGRAMADOR");
            Console.WriteLine("==============================================");
            Console.WriteLine();

            // Configurar o contexto do banco de dados
            var optionsBuilder = new DbContextOptionsBuilder<SistemaContext>();
            
            // ATENÇÃO: Altere a connection string abaixo para a sua configuração
            var connectionString = "Server=localhost;Database=SistemaDB;Trusted_Connection=True;TrustServerCertificate=True;";
            
            Console.WriteLine($"Connection String: {connectionString}");
            Console.WriteLine();
            
            optionsBuilder.UseSqlServer(connectionString);

            using var context = new SistemaContext(optionsBuilder.Options);

            try
            {
                // Buscar o usuário programador
                var programador = await context.Usuarios
                    .FirstOrDefaultAsync(u => u.UserName == USERNAME_PROGRAMADOR);

                if (programador == null)
                {
                    Console.WriteLine($"❌ ERRO: Usuário '{USERNAME_PROGRAMADOR}' não encontrado no banco de dados!");
                    Console.WriteLine();
                    Console.WriteLine("Pressione qualquer tecla para sair...");
                    Console.ReadKey();
                    return;
                }

                Console.WriteLine($"✓ Usuário encontrado:");
                Console.WriteLine($"  ID: {programador.Id}");
                Console.WriteLine($"  Nome: {programador.Nome}");
                Console.WriteLine($"  Username: {programador.UserName}");
                Console.WriteLine($"  Ativo: {programador.Ativo}");
                Console.WriteLine();

                // Gerar o hash da senha padrão
                var novoHash = HashPassword(SENHA_PADRAO);
                Console.WriteLine($"✓ Novo hash gerado: {novoHash}");
                Console.WriteLine();

                // Atualizar a senha
                programador.PasswordHash = novoHash;
                await context.SaveChangesAsync();

                Console.WriteLine("==============================================");
                Console.WriteLine("✓✓✓ SENHA RESETADA COM SUCESSO! ✓✓✓");
                Console.WriteLine("==============================================");
                Console.WriteLine();
                Console.WriteLine("Credenciais de acesso:");
                Console.WriteLine($"  Usuário: {USERNAME_PROGRAMADOR}");
                Console.WriteLine($"  Senha: {SENHA_PADRAO}");
                Console.WriteLine();
                Console.WriteLine("==============================================");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERRO ao resetar senha: {ex.Message}");
                Console.WriteLine();
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }

            Console.WriteLine();
            Console.WriteLine("Pressione qualquer tecla para sair...");
            Console.ReadKey();
        }

        private static string HashPassword(string password)
        {
            var saltedPassword = password + SALT;
            var bytes = Encoding.UTF8.GetBytes(saltedPassword);
            var hash = SHA256.HashData(bytes);
            return Convert.ToBase64String(hash);
        }

        /// <summary>
        /// Método auxiliar para gerar hash de qualquer senha
        /// Útil para criar novos usuários ou resetar outras senhas
        /// </summary>
        public static void GerarHashParaSenha(string senha)
        {
            var hash = HashPassword(senha);
            Console.WriteLine($"Senha: {senha}");
            Console.WriteLine($"Hash: {hash}");
        }
    }
}
