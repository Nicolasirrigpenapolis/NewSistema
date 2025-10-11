using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models.ValueObjects
{
    /// <summary>
    /// Value Object para representar endereços
    /// </summary>
    public class EnderecoInfo
    {
        [Required]
        [MaxLength(200)]
        public string Logradouro { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Numero { get; set; }

        [MaxLength(200)]
        public string? Complemento { get; set; }

        [Required]
        [MaxLength(100)]
        public string Bairro { get; set; } = string.Empty;

        [Required]
        public int CodigoMunicipio { get; set; }

        [Required]
        [MaxLength(100)]
        public string NomeMunicipio { get; set; } = string.Empty;

        [Required]
        [StringLength(2)]
        public string Uf { get; set; } = string.Empty;

        [Required]
        [StringLength(8)]
        public string Cep { get; set; } = string.Empty;

        [MaxLength(4)]
        public string? CodigoPais { get; set; } = "1058"; // Brasil

        [MaxLength(100)]
        public string? NomePais { get; set; } = "Brasil";
    }
}
