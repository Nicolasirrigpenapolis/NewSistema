using System.ComponentModel.DataAnnotations;
using Backend.Api.Attributes;

namespace Backend.Api.DTOs
{
    public class EmitenteCreateDto
    {
        [MaxLength(14, ErrorMessage = "CNPJ deve ter no máximo 14 caracteres")]
        [Cnpj(ErrorMessage = "CNPJ deve ser válido")]
        public string? Cnpj { get; set; }

        [MaxLength(11, ErrorMessage = "CPF deve ter no máximo 11 caracteres")]
        [Cpf(ErrorMessage = "CPF deve ser válido")]
        public string? Cpf { get; set; }

        [MaxLength(20, ErrorMessage = "IE deve ter no máximo 20 caracteres")]
        public string? Ie { get; set; }

        [Required(ErrorMessage = "Razão Social é obrigatória")]
        [MaxLength(200, ErrorMessage = "Razão Social deve ter no máximo 200 caracteres")]
        public string RazaoSocial { get; set; } = string.Empty;

        [MaxLength(200, ErrorMessage = "Nome Fantasia deve ter no máximo 200 caracteres")]
        public string? NomeFantasia { get; set; }

        [Required(ErrorMessage = "Endereço é obrigatório")]
        [MaxLength(200, ErrorMessage = "Endereço deve ter no máximo 200 caracteres")]
        public string Endereco { get; set; } = string.Empty;

        [MaxLength(20, ErrorMessage = "Número deve ter no máximo 20 caracteres")]
        public string? Numero { get; set; }

        [MaxLength(200, ErrorMessage = "Complemento deve ter no máximo 200 caracteres")]
        public string? Complemento { get; set; }

        [Required(ErrorMessage = "Bairro é obrigatório")]
        [MaxLength(100, ErrorMessage = "Bairro deve ter no máximo 100 caracteres")]
        public string Bairro { get; set; } = string.Empty;

        public int CodMunicipio { get; set; }

        [Required(ErrorMessage = "Município é obrigatório")]
        [MaxLength(100, ErrorMessage = "Município deve ter no máximo 100 caracteres")]
        public string Municipio { get; set; } = string.Empty;

        [Required(ErrorMessage = "CEP é obrigatório")]
        [MaxLength(8, ErrorMessage = "CEP deve ter no máximo 8 caracteres")]
        public string Cep { get; set; } = string.Empty;

        [Required(ErrorMessage = "UF é obrigatória")]
        [MaxLength(2, ErrorMessage = "UF deve ter no máximo 2 caracteres")]
        public string Uf { get; set; } = string.Empty;

        [MaxLength(20, ErrorMessage = "Telefone deve ter no máximo 20 caracteres")]
        public string? Telefone { get; set; }

        [MaxLength(200, ErrorMessage = "Email deve ter no máximo 200 caracteres")]
        public string? Email { get; set; }

        [MaxLength(256, ErrorMessage = "Caminho do logotipo deve ter no mǭximo 256 caracteres")]
        public string? CaminhoLogotipo { get; set; }

        [MaxLength(500, ErrorMessage = "Caminho do certificado deve ter no máximo 500 caracteres")]
        public string? CaminhoCertificadoDigital { get; set; }

        [MaxLength(200, ErrorMessage = "Senha do certificado deve ter no máximo 200 caracteres")]
        public string? SenhaCertificadoDigital { get; set; }

        [Required(ErrorMessage = "Tipo Emitente é obrigatório")]
        [MaxLength(50, ErrorMessage = "Tipo Emitente deve ter no máximo 50 caracteres")]
        public string TipoEmitente { get; set; } = "PrestadorServico";



        [MaxLength(500, ErrorMessage = "Caminho para salvar XML deve ter no máximo 500 caracteres")]
        public string? CaminhoSalvarXml { get; set; }

        [MaxLength(20, ErrorMessage = "RNTRC deve ter no máximo 20 caracteres")]
        public string? Rntrc { get; set; }

        public int SerieInicial { get; set; }

        public int TipoTransportador { get; set; }

        public int ModalTransporte { get; set; }


        // Propriedade Ativo para permitir controle no frontend
        public bool Ativo { get; set; } = true;
    }

    public class EmitenteUpdateDto : EmitenteCreateDto
    {
        // Herda todas as propriedades de EmitenteCreateDto
    }

    public class EmitenteResponseDto
    {
        public int Id { get; set; }
        public string? Cnpj { get; set; }
        public string? Cpf { get; set; }
        public string? Ie { get; set; }
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
        public string TipoEmitente { get; set; } = string.Empty;
        public string? CaminhoSalvarXml { get; set; }
        public string? Rntrc { get; set; }
        public string? CaminhoLogotipo { get; set; }
        public string? CaminhoCertificadoDigital { get; set; }
        public string? SenhaCertificadoDigital { get; set; }
        public int SerieInicial { get; set; }
        public int TipoTransportador { get; set; }
        public int ModalTransporte { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime? DataAtualizacao { get; set; }
    }

    public class EmitenteListDto
    {
        public int Id { get; set; }
        public string RazaoSocial { get; set; } = string.Empty;
        public string? NomeFantasia { get; set; }
        public string? Cnpj { get; set; }
        public string? Cpf { get; set; }
        public string? Ie { get; set; }
        public string Endereco { get; set; } = string.Empty;
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string Bairro { get; set; } = string.Empty;
        public int CodMunicipio { get; set; }
        public string Municipio { get; set; } = string.Empty;
        public string Cep { get; set; } = string.Empty;
        public string TipoEmitente { get; set; } = string.Empty;
        public string? Uf { get; set; }
        public bool Ativo { get; set; }
        public string? CaminhoLogotipo { get; set; }
        public string? CaminhoCertificadoDigital { get; set; }
    }

    public class EmitenteComCertificadoDto
    {
        public int Id { get; set; }
        public string RazaoSocial { get; set; } = string.Empty;
        public string TipoEmitente { get; set; } = string.Empty;
    }


    public class SelecionarEmitenteRequest
    {
        [Required]
        public int EmitenteId { get; set; }

        [Required]
        [MaxLength(50)]
        public string TipoEmitente { get; set; } = string.Empty; // PrestadorServico ou EntregaPropria
    }

    public enum TipoEmitenteEnum
    {
        PrestadorServico,
        EntregaPropria
    }
}
