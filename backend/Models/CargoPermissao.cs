using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models
{
    public class CargoPermissao
    {
        public int Id { get; set; }

        [Required]
        public int CargoId { get; set; }

        [Required]
        public int PermissaoId { get; set; }

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        // Navegação
        public Cargo Cargo { get; set; } = null!;
        public Permissao Permissao { get; set; } = null!;
    }
}
