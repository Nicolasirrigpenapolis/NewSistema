using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models.ValueObjects
{
    /// <summary>
    /// Value Object representando informações da viagem
    /// </summary>
    public class ViagemInfo
    {
        [Required]
        [StringLength(2)]
        public string UfIni { get; set; } = string.Empty;

        [Required]
        [StringLength(2)]
        public string UfFim { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? MunicipioInicio { get; set; }

        [MaxLength(100)]
        public string? MunicipioFim { get; set; }

        public int? MunicipioCarregamentoId { get; set; }

        [Required]
        public DateTime DataInicioViagem { get; set; }

        public DateTime? DataFimViagem { get; set; }

        // Percurso
        public string? PercursoUfs { get; set; } // UFs por onde passa: "SP,MG,GO"

        // Informações de carga
        [Required]
        public string UnidadeMedida { get; set; } = "01"; // 01=KG

        [Required]
        public decimal PesoBrutoTotal { get; set; }

        [Required]
        public decimal ValorTotalCarga { get; set; }


        // Produto predominante
        [MaxLength(100)]
        public string? ProdutoPredominante { get; set; }

        [MaxLength(500)]
        public string? OutrasCaracteristicasCarga { get; set; }

        // Lacres
        public string? LacresJson { get; set; } // JSON array dos lacres
    }
}
