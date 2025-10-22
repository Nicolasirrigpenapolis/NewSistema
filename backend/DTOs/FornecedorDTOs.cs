using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class FornecedorListDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? CnpjCpf { get; set; }
        public string TipoPessoa { get; set; } = "J"; // J = Jurídica, F = Física
        public string? Telefone { get; set; }
        public string? Email { get; set; }
        public string? Cidade { get; set; }
        public string? Uf { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
    }

    public class FornecedorDetailDto : FornecedorListDto
    {
        public string? Endereco { get; set; }
        public string? Cep { get; set; }
        public string? Observacoes { get; set; }
        public DateTime? DataUltimaAlteracao { get; set; }
        public int TotalManutencoes { get; set; }
        public decimal ValorTotalManutencoes { get; set; }
    }

    public class FornecedorCreateDto
    {
        [Required(ErrorMessage = "Nome é obrigatório")]
        [StringLength(100, ErrorMessage = "Nome deve ter no máximo 100 caracteres")]
        public string Nome { get; set; } = string.Empty;

        [StringLength(14, ErrorMessage = "CNPJ/CPF deve ter no máximo 14 caracteres")]
        public string? CnpjCpf { get; set; }
        
        [Required(ErrorMessage = "Tipo de pessoa é obrigatório")]
        public string TipoPessoa { get; set; } = "J"; // J = Jurídica, F = Física

        [StringLength(15, ErrorMessage = "Telefone deve ter no máximo 15 caracteres")]
        public string? Telefone { get; set; }

        [StringLength(100, ErrorMessage = "Email deve ter no máximo 100 caracteres")]
        [EmailAddress(ErrorMessage = "Email deve ter um formato válido")]
        public string? Email { get; set; }

        [StringLength(200, ErrorMessage = "Endereço deve ter no máximo 200 caracteres")]
        public string? Endereco { get; set; }

        [StringLength(100, ErrorMessage = "Cidade deve ter no máximo 100 caracteres")]
        public string? Cidade { get; set; }

        [StringLength(2, ErrorMessage = "UF deve ter 2 caracteres")]
        public string? Uf { get; set; }

        [StringLength(8, ErrorMessage = "CEP deve ter no máximo 8 caracteres")]
        public string? Cep { get; set; }

        [StringLength(500, ErrorMessage = "Observações deve ter no máximo 500 caracteres")]
        public string? Observacoes { get; set; }
    }

    public class FornecedorUpdateDto : FornecedorCreateDto
    {
        public bool Ativo { get; set; } = true;
    }
}
