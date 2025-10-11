using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models
{
    public class Municipio
    {
        public int Id { get; set; }

        public int Codigo { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(2)]
        public string Uf { get; set; } = string.Empty;


        public bool Ativo { get; set; } = true;

        // Relacionamentos
        public virtual ICollection<MDFe> MDFesCarregamento { get; set; } = new List<MDFe>();
        public virtual ICollection<MDFeCte> MDFesCte { get; set; } = new List<MDFeCte>();
        public virtual ICollection<MDFeNfe> MDFesNfe { get; set; } = new List<MDFeNfe>();
        public virtual ICollection<MDFeMdfeTransp> MDFesMdfeTransp { get; set; } = new List<MDFeMdfeTransp>();
        public virtual ICollection<MDFeLocalCarregamento> LocaisCarregamento { get; set; } = new List<MDFeLocalCarregamento>();
        public virtual ICollection<MDFeLocalDescarregamento> LocaisDescarregamento { get; set; } = new List<MDFeLocalDescarregamento>();
    }
}
