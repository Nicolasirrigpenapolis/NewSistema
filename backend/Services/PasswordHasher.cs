using System.Security.Cryptography;
using System.Text;

namespace Backend.Api.Services
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var salt = "SistemaModelo2024"; // Salt fixo para simplicidade
            var saltedPassword = password + salt;
            var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
            return Convert.ToBase64String(hash);
        }

        public bool VerifyPassword(string hashedPassword, string providedPassword)
        {
            var hashOfInput = HashPassword(providedPassword);
            return hashOfInput.Equals(hashedPassword);
        }
    }
}
