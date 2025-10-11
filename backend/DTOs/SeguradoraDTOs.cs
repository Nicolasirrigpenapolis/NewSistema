using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class SeguradoraListDto
    {
        public int Id { get; set; }
        public string Cnpj { get; set; } = string.Empty;
        public string RazaoSocial { get; set; } = string.Empty;
        public string? NomeFantasia { get; set; }
        public string? Apolice { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
    }

    public class SeguradoraDetailDto : SeguradoraListDto
    {
        public DateTime? DataUltimaAlteracao { get; set; }
    }

    public class SeguradoraCreateDto
    {
        [Required(ErrorMessage = "CNPJ é obrigatório")]
        [MaxLength(14)]
        public string Cnpj { get; set; } = string.Empty;

        [Required(ErrorMessage = "Razão Social é obrigatória")]
        [MaxLength(200)]
        public string RazaoSocial { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? NomeFantasia { get; set; }

        [MaxLength(50)]
        public string? Apolice { get; set; }

        public bool Ativo { get; set; } = true;
    }

    public class SeguradoraUpdateDto : SeguradoraCreateDto
    {
    }

    public class SeguradoraSimpleDto
    {
        public int Id { get; set; }
        public string Cnpj { get; set; } = string.Empty;
        public string RazaoSocial { get; set; } = string.Empty;
        public string? Apolice { get; set; }
    }

    public class SeguradoraCreateWrapper
    {
        public SeguradoraCreateDto Dto { get; set; } = new();
    }
}
