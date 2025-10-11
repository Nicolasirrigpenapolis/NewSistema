using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models.ValueObjects
{
    /// <summary>
    /// Value Object representando informações do veículo de tração
    /// </summary>
    public class VeiculoInfo
    {
        [Required]
        [StringLength(7)]
        public string Placa { get; set; } = string.Empty;

        [MaxLength(9)]
        public string? Renavam { get; set; }

        [Required]
        [StringLength(2)]
        public string UfLicenciamento { get; set; } = string.Empty;

        [Required]
        public int TaraKg { get; set; }

        public int? CapacidadeKg { get; set; }

        public int? CapacidadeM3 { get; set; }

        [Required]
        public string TipoRodado { get; set; } = "01"; // 01=Truck, 02=Toco, etc.

        [Required]
        public string TipoCarroceria { get; set; } = "00"; // Código da carroceria

        [MaxLength(20)]
        public string? Proprietario { get; set; }

        // Reboques (JSON para simplicidade)
        public string? ReboquesJson { get; set; } // Array de reboques

        // Informações adicionais
        [MaxLength(100)]
        public string? Marca { get; set; }

        [MaxLength(100)]
        public string? Modelo { get; set; }

        public int? AnoFabricacao { get; set; }

        public int? AnoModelo { get; set; }

        [MaxLength(50)]
        public string? Cor { get; set; }
    }
}
