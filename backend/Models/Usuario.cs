using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        [MaxLength(50)]
        public string UserName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public int? CargoId { get; set; }
        public Cargo? Cargo { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCriacao { get; set; } = DateTime.Now;
        public DateTime? DataUltimaAlteracao { get; set; }
        public DateTime? DataUltimoLogin { get; set; }

        // Soft Delete
        public DateTime? DataExclusao { get; set; }
        [MaxLength(200)]
        public string? UsuarioExclusao { get; set; }
        [MaxLength(500)]
        public string? MotivoExclusao { get; set; }
    }
}
