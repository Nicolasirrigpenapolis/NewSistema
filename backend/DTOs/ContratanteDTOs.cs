using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class ContratanteListDto
    {
        public int Id { get; set; }
        public string? Cnpj { get; set; }
        public string? Cpf { get; set; }
        public string RazaoSocial { get; set; } = string.Empty;
        public string? NomeFantasia { get; set; }
        public string Endereco { get; set; } = string.Empty;
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string Bairro { get; set; } = string.Empty;
        public int CodMunicipio { get; set; }
        public string Municipio { get; set; } = string.Empty;
        public string Cep { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public string? Email { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
    }

    public class ContratanteCreateDto
    {
        [MaxLength(14)]
        public string? Cnpj { get; set; }

        [MaxLength(11)]
        public string? Cpf { get; set; }

        [Required]
        [MaxLength(200)]
        public string RazaoSocial { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? NomeFantasia { get; set; }

        [Required]
        [MaxLength(200)]
        public string Endereco { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Numero { get; set; }

        [MaxLength(100)]
        public string? Complemento { get; set; }

        [Required]
        [MaxLength(100)]
        public string Bairro { get; set; } = string.Empty;

        [Required]
        public int CodMunicipio { get; set; }

        [Required]
        [MaxLength(100)]
        public string Municipio { get; set; } = string.Empty;

        [Required]
        [MaxLength(8)]
        public string Cep { get; set; } = string.Empty;

        [Required]
        [MaxLength(2)]
        public string Uf { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Telefone { get; set; }

        [MaxLength(200)]
        public string? Email { get; set; }

        public bool Ativo { get; set; } = true;
    }

    public class ContratanteUpdateDto : ContratanteCreateDto
    {
        // Herda todos os campos do Create
    }

    public class ContratanteDetailDto : ContratanteListDto
    {
        public DateTime? DataUltimaAlteracao { get; set; }
    }
}
