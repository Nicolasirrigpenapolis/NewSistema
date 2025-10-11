using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models.ValueObjects
{
    /// <summary>
    /// Value Object representando informações do emitente no momento da emissão do MDFe
    /// </summary>
    public class EmitenteInfo
    {
        [Required]
        [MaxLength(14)]
        public string Cnpj { get; set; } = string.Empty;

        [MaxLength(11)]
        public string? Cpf { get; set; }

        [MaxLength(20)]
        public string? InscricaoEstadual { get; set; }

        [Required]
        [MaxLength(200)]
        public string RazaoSocial { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? NomeFantasia { get; set; }

        [Required]
        public EnderecoInfo Endereco { get; set; } = new();

        [MaxLength(15)]
        public string? Telefone { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        // Configurações específicas do emitente
        public int SerieInicial { get; set; } = 1;
        public string Modal { get; set; } = "1"; // 1=Rodoviário
        public string TipoTransportador { get; set; } = "1"; // 1=ETC, 2=TAC, 3=CTC

        // Dados do ambiente
        public string TipoAmbiente { get; set; } = "2"; // 1=Produção, 2=Homologação
        public string UfEmissao { get; set; } = string.Empty;
    }
}
