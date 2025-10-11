using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    public class Viagem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int VeiculoId { get; set; }

        [Required]
        public DateTime DataInicio { get; set; }

        [Required]
        public DateTime DataFim { get; set; }

        public int? CondutorId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? KmInicial { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? KmFinal { get; set; }

        [StringLength(500)]
        public string? OrigemDestino { get; set; }

        [StringLength(1000)]
        public string? Observacoes { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        public DateTime? DataUltimaAlteracao { get; set; }

        // Propriedades calculadas (BACKEND calcula, não aceita do frontend!)
        [NotMapped]
        public decimal ReceitaTotal => Receitas?.Sum(r => r.Valor) ?? 0;

        [NotMapped]
        public decimal TotalDespesas => Despesas?.Sum(d => d.Valor) ?? 0;

        [NotMapped]
        public decimal SaldoLiquido => ReceitaTotal - TotalDespesas;

        [NotMapped]
        public int DuracaoDias => (DataFim - DataInicio).Days + 1;

        [NotMapped]
        public decimal? KmPercorrido => KmFinal.HasValue && KmInicial.HasValue ? KmFinal.Value - KmInicial.Value : null;

        // Relacionamentos
        public virtual Veiculo Veiculo { get; set; } = null!;
        public virtual Condutor? Condutor { get; set; }
        public virtual ICollection<DespesaViagem> Despesas { get; set; } = new List<DespesaViagem>();
        public virtual ICollection<ReceitaViagem> Receitas { get; set; } = new List<ReceitaViagem>();
    }
}
