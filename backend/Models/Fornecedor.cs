using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    public class Fornecedor
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;

        [StringLength(14)]
        public string? Cnpj { get; set; }

        [StringLength(11)]
        public string? Cpf { get; set; }

        [StringLength(15)]
        public string? Telefone { get; set; }

        [StringLength(100)]
        public string? Email { get; set; }

        [StringLength(200)]
        public string? Endereco { get; set; }

        [StringLength(100)]
        public string? Cidade { get; set; }

        [StringLength(2)]
        public string? Uf { get; set; }

        [StringLength(8)]
        public string? Cep { get; set; }

        [StringLength(500)]
        public string? Observacoes { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        public DateTime? DataUltimaAlteracao { get; set; }

        // Campos para Soft Delete
        public DateTime? DataExclusao { get; set; }

        [MaxLength(200)]
        public string? UsuarioExclusao { get; set; }

        [MaxLength(500)]
        public string? MotivoExclusao { get; set; }

        // Relacionamentos
        public virtual ICollection<ManutencaoVeiculo> Manutencoes { get; set; } = new List<ManutencaoVeiculo>();
    }
}
