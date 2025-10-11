using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class CancelarMDFeRequest
    {
        [Required]
        [StringLength(255, MinimumLength = 15, ErrorMessage = "Justificativa deve ter entre 15 e 255 caracteres")]
        public string Justificativa { get; set; } = string.Empty;
    }

    public class EncerrarMDFeRequest
    {
        /// <summary> Código IBGE do município de encerramento (7 dígitos). </summary>
        [Required]
        [RegularExpression(@"^\d{7}$", ErrorMessage = "Código do município deve conter 7 dígitos")]
        public string CodigoMunicipioEncerramento { get; set; } = string.Empty;

        /// <summary> Data/hora do encerramento (UTC ou local). </summary>
        [Required]
        public DateTime DataEncerramento { get; set; }
    }

    public class ConsultarReciboRequest
    {
        [Required]
        [RegularExpression(@"^\d{10,20}$", ErrorMessage = "Recibo inválido")] // faixa ampla até implementarmos validação definitiva
        public string Recibo { get; set; } = string.Empty;
    }
}
