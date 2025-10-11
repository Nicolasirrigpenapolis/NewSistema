using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    public class ManutencaoVeiculo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int VeiculoId { get; set; }

        [Required]
        public DateTime DataManutencao { get; set; }

        [Required]
        [StringLength(500)]
        public string Descricao { get; set; } = string.Empty;

        public int? FornecedorId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ValorMaoObra { get; set; } = 0;

        [StringLength(1000)]
        public string? Observacoes { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        public DateTime? DataUltimaAlteracao { get; set; }

        // Propriedade calculada para o valor total
        [NotMapped]
        public decimal ValorTotal => ValorMaoObra + Pecas.Sum(p => p.ValorTotal);

        // Relacionamentos
        public virtual Veiculo Veiculo { get; set; } = null!;
        public virtual Fornecedor? Fornecedor { get; set; }
        public virtual ICollection<ManutencaoPeca> Pecas { get; set; } = new List<ManutencaoPeca>();
    }
}
