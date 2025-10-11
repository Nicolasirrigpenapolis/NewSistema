using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models
{
    public class Condutor
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(11)]
        public string Cpf { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Telefone { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCriacao { get; set; } = DateTime.Now;
        public DateTime? DataUltimaAlteracao { get; set; }

        // Relacionamentos
        public virtual ICollection<MDFe> MDFes { get; set; } = new List<MDFe>();
    }
}
