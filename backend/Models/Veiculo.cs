using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    public class Veiculo
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(8)]
        public string Placa { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Marca { get; set; }

        [Required]
        public int Tara { get; set; }

        [Required]
        [MaxLength(50)]
        public string TipoRodado { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string TipoCarroceria { get; set; } = string.Empty;

        [Required]
        [MaxLength(2)]
        public string Uf { get; set; } = string.Empty;


        public bool Ativo { get; set; } = true;

        public DateTime DataCriacao { get; set; } = DateTime.Now;
        public DateTime? DataUltimaAlteracao { get; set; }



        
        [NotMapped]
        public int? TaraKg => Tara;
        [NotMapped]
        public string UfLicenciamento => Uf;
        [NotMapped]
        public string UfPlaca => Uf;

        // Relacionamentos
        public virtual ICollection<MDFe> MDFes { get; set; } = new List<MDFe>();
    }
}
