using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models.ValueObjects
{
    /// <summary>
    /// Value Object representando informações do seguro
    /// </summary>
    public class SeguroInfo
    {
        [Required]
        public string ResponsavelSeguro { get; set; } = "4"; // 4=Emitente MDFe

        [MaxLength(100)]
        public string? NomeSeguradora { get; set; }

        [MaxLength(50)]
        public string? NumeroApoliceSeguro { get; set; }

        [MaxLength(50)]
        public string? NumeroAverbacaoSeguro { get; set; }

        public decimal? ValorTotalAverbacao { get; set; }

        // RNTRC da seguradora
        [MaxLength(20)]
        public string? RntrcSeguradora { get; set; }

        // Informações adicionais
        public DateTime? VigenciaInicio { get; set; }

        public DateTime? VigenciaFim { get; set; }

        [MaxLength(500)]
        public string? ObservacoesSeguro { get; set; }

        // Para múltiplas seguradoras (JSON)
        public string? SeguradorasJson { get; set; }
    }
}
