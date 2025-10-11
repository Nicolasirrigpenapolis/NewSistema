using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models
{
    public class Permissao
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Codigo { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Descricao { get; set; }

        [Required]
        [MaxLength(100)]
        public string Modulo { get; set; } = string.Empty;

        public bool Ativo { get; set; } = true;

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        // Navegação
        public ICollection<CargoPermissao> CargoPermissoes { get; set; } = new List<CargoPermissao>();
    }
}
