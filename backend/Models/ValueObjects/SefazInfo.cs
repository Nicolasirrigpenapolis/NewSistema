using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models.ValueObjects
{
    /// <summary>
    /// Value Object representando informações da SEFAZ e status do MDFe
    /// </summary>
    public class SefazInfo
    {
        [Required]
        [StringLength(44)]
        public string ChaveAcesso { get; set; } = string.Empty;

        [Required]
        [StringLength(8)]
        public string CodigoNumericoAleatorio { get; set; } = string.Empty;

        public int DigitoVerificador { get; set; }

        [Required]
        public string StatusSefaz { get; set; } = "RASCUNHO";

        [MaxLength(20)]
        public string? Protocolo { get; set; }

        public DateTime? DataAutorizacao { get; set; }

        public DateTime? DataCancelamento { get; set; }

        public DateTime? DataEncerramento { get; set; }

        [MaxLength(500)]
        public string? JustificativaCancelamento { get; set; }

        [MaxLength(500)]
        public string? JustificativaEncerramento { get; set; }

        // XML do MDFe
        public string? XmlMdfe { get; set; }

        public string? XmlProtocolo { get; set; }

        public string? XmlCancelamento { get; set; }

        public string? XmlEncerramento { get; set; }

        // Informações de rejeição/erro
        [MaxLength(10)]
        public string? CodigoStatus { get; set; }

        [MaxLength(500)]
        public string? MotivoStatus { get; set; }

        // Contingência
        public bool? ContingenciaAtivada { get; set; }

        [MaxLength(500)]
        public string? JustificativaContingencia { get; set; }

        public DateTime? DataHoraContingencia { get; set; }

        // Versão do schema
        [Required]
        public string VersaoModal { get; set; } = "3.00";

        [Required]
        public string VersaoProcesso { get; set; } = "3.00";
    }
}
