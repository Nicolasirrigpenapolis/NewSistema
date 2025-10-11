using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    public class DespesaViagem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ViagemId { get; set; }

        [Required]
        [StringLength(50)]
        public string TipoDespesa { get; set; } = string.Empty; // Combustível, Pedágio, Alimentação, Manutenção, Hospedagem, Outros

        [Required]
        [StringLength(200)]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Valor { get; set; }

        [Required]
        public DateTime DataDespesa { get; set; }

        [StringLength(100)]
        public string? Local { get; set; }

        [StringLength(500)]
        public string? Observacoes { get; set; }

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        // Relacionamentos
        public virtual Viagem Viagem { get; set; } = null!;
    }
}
