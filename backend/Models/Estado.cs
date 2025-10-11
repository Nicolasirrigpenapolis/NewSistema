using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models
{
    public class Estado
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(2)]
        public string Uf { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(2)]
        public string CodigoIbge { get; set; } = string.Empty;

        public bool Ativo { get; set; } = true;

        // Relacionamentos
        public virtual ICollection<Municipio> Municipios { get; set; } = new List<Municipio>();
    }
}
