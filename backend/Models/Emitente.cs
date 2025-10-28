using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Api.Models
{
    [Table("Empresas")]
    public class Emitente
    {
        public int Id { get; set; }

        [MaxLength(14)]
        public string? Cnpj { get; set; }

        [MaxLength(11)]
        public string? Cpf { get; set; }

        [MaxLength(20)]
        public string? Ie { get; set; }

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

        [MaxLength(200)]
        public string? Complemento { get; set; }

        [Required]
        [MaxLength(100)]
        public string Bairro { get; set; } = string.Empty;

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

        [MaxLength(256)]
        public string? CaminhoLogotipo { get; set; }

    [MaxLength(256)]
    public string? CaminhoImagemFundo { get; set; }

        [MaxLength(500)]
        public string? CaminhoCertificadoDigital { get; set; }

        [MaxLength(200)]
        public string? SenhaCertificadoDigital { get; set; }

        // Tipo de Emitente
        [Required]
        [MaxLength(50)]
        public string TipoEmitente { get; set; } = "PrestadorServico"; // PrestadorServico ou EntregaPropria
        


        // Caminho para salvar XMLs dos MDFe emitidos
        [MaxLength(500)]
        public string? CaminhoSalvarXml { get; set; }

        // Configurações RNTRC
        [MaxLength(20)]
        public string? Rntrc { get; set; }

        // Configurações MDFe
        public int SerieInicial { get; set; } // Série inicial para numeração MDFe

        // Tipo de Transportador (1=ETC, 2=TAC, 3=CTC)
        public int TipoTransportador { get; set; } // Definido pelo usuário no cadastro

        // Modal de Transporte (1=Rodoviário, 2=Aéreo, 3=Aquaviário, 4=Ferroviário)
        public int ModalTransporte { get; set; } // Definido pelo usuário no cadastro

        // Unidade de Medida fixo em Quilograma (01) - decisão arquitetural do sistema


        public DateTime DataCriacao { get; set; } = DateTime.Now;
        public DateTime? DataUltimaAlteracao { get; set; }

        // Campos para Soft Delete
        public DateTime? DataExclusao { get; set; }

        [MaxLength(200)]
        public string? UsuarioExclusao { get; set; }

        [MaxLength(500)]
        public string? MotivoExclusao { get; set; }

        // Relacionamentos
        public virtual ICollection<MDFe> MDFes { get; set; } = new List<MDFe>();
    }
}
