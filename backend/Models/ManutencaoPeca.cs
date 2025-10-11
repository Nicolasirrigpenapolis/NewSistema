using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    public class ManutencaoPeca
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ManutencaoId { get; set; }

        [Required]
        [StringLength(200)]
        public string DescricaoPeca { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,3)")]
        public decimal Quantidade { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ValorUnitario { get; set; }

        [StringLength(50)]
        public string? Unidade { get; set; } = "UN";

        // Propriedade calculada para o valor total da peça
        [NotMapped]
        public decimal ValorTotal => Quantidade * ValorUnitario;

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        // Relacionamentos
        public virtual ManutencaoVeiculo Manutencao { get; set; } = null!;
    }
}
