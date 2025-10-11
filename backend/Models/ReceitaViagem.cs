using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    public class ReceitaViagem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ViagemId { get; set; }

        [Required]
        [StringLength(200)]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Valor { get; set; }

        [Required]
        public DateTime DataReceita { get; set; }

        [StringLength(200)]
        public string? Origem { get; set; }

        [StringLength(500)]
        public string? Observacoes { get; set; }

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        // Relacionamento
        public virtual Viagem Viagem { get; set; } = null!;
    }
}
