using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models
{
    public class Seguradora
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(14)]
        public string Cnpj { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string RazaoSocial { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? NomeFantasia { get; set; }

        [MaxLength(50)]
        public string? Apolice { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        public DateTime? DataUltimaAlteracao { get; set; }

        // Relacionamentos
        public virtual ICollection<MDFe> MDFes { get; set; } = new List<MDFe>();
    }
}
