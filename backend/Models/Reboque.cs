using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models
{
    public class Reboque
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(8)]
        public string Placa { get; set; } = string.Empty;


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

        [MaxLength(20)]
        public string? Rntrc { get; set; }

        public bool Ativo { get; set; } = true;

        public DateTime DataCriacao { get; set; } = DateTime.Now;
        public DateTime? DataUltimaAlteracao { get; set; }

        // Propriedades computadas
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string UfPlaca => Uf;

        // Relacionamentos
        public virtual ICollection<MDFeReboque> MDFeReboques { get; set; } = new List<MDFeReboque>();
    }
}
