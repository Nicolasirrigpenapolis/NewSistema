using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models.ValueObjects
{
    /// <summary>
    /// Value Object representando informações do condutor
    /// </summary>
    public class CondutorInfo
    {
        [Required]
        [MaxLength(200)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [StringLength(11)]
        public string Cpf { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Cnh { get; set; } = string.Empty;

        [Required]
        public DateTime ValidadeCnh { get; set; }

        [Required]
        [StringLength(2)]
        public string UfCnh { get; set; } = string.Empty;

        public DateTime? DataNascimento { get; set; }

        [MaxLength(15)]
        public string? Telefone { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        // Endereço do condutor
        public EnderecoInfo? Endereco { get; set; }

        // Informações adicionais
        [MaxLength(50)]
        public string? CategoriaCnh { get; set; }

        public DateTime? PrimeiraHabilitacao { get; set; }

        [MaxLength(20)]
        public string? NumeroRegistro { get; set; }
    }
}
