using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Models.ValueObjects
{
    /// <summary>
    /// Value Object representando informações de pagamento
    /// </summary>
    public class PagamentoInfo
    {
        [Required]
        public string TipoPagamento { get; set; } = "0"; // 0=À vista, 1=A prazo, 2=Outros

        public decimal? ValorAdiantamento { get; set; }

        public string? IndicadorPagamento { get; set; } = "1"; // 1=Pago, 2=A pagar

        // Componentes de pagamento
        public string? ComponentesPagamentoJson { get; set; }

        // Informações de vale-pedágio
        [Required]
        public string TipoVale { get; set; } = "01"; // 01=Fornecimento

        [MaxLength(20)]
        public string? CnpjFornecedorVale { get; set; }

        [MaxLength(20)]
        public string? CnpjResponsavelPagamento { get; set; }

        public decimal? ValorVale { get; set; }

        // Banco emissor (para vale-pedágio eletrônico)
        [MaxLength(10)]
        public string? CodigoBanco { get; set; }

        [MaxLength(20)]
        public string? NumeroComprovanteCompra { get; set; }

        // Para múltiplos vales
        public string? ValesJson { get; set; }

        // Informações adicionais
        public DateTime? DataVencimento { get; set; }

        [MaxLength(500)]
        public string? ObservacoesPagamento { get; set; }
    }
}
