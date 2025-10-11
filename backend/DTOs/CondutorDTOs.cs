using System.ComponentModel.DataAnnotations;
using Backend.Api.Attributes;

namespace Backend.Api.DTOs
{
    public class CondutorCreateDto
    {
        [Required(ErrorMessage = "Nome é obrigatório")]
        [MaxLength(200, ErrorMessage = "Nome deve ter no máximo 200 caracteres")]
        [MinLength(2, ErrorMessage = "Nome deve ter pelo menos 2 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "CPF é obrigatório")]
        [MaxLength(14, ErrorMessage = "CPF deve ter no máximo 14 caracteres")]
        [Cpf(ErrorMessage = "CPF deve ser válido")]
        public string Cpf { get; set; } = string.Empty;

        [MaxLength(20, ErrorMessage = "Telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }
    }

    public class CondutorUpdateDto : CondutorCreateDto
    {
        // Mesmas propriedades que CondutorCreateDto
    }

    public class CondutorResponseDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Cpf { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
    }

    public class CondutorListDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Cpf { get; set; } = string.Empty;
        public bool Ativo { get; set; }
    }

    public class CondutorSimpleDto
    {
        [Required(ErrorMessage = "Nome do condutor é obrigatório")]
        [MinLength(2, ErrorMessage = "Nome deve ter pelo menos 2 caracteres")]
        public string Nome { get; set; } = "";

        [Required(ErrorMessage = "CPF do condutor é obrigatório")]
        [Cpf(ErrorMessage = "CPF deve ser válido")]
        public string Cpf { get; set; } = "";
    }
}
