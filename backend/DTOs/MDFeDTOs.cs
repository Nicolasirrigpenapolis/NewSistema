using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Backend.Api.DTOs
{
        // DTO para criacao de MDFe
    public class MDFeCreateDto
    {
        [Required(ErrorMessage = "Emitente e obrigatorio")]
        [Range(1, int.MaxValue, ErrorMessage = "ID do emitente deve ser maior que zero")]
        public int EmitenteId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ID do veiculo deve ser maior que zero")]
        public int? VeiculoId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ID do condutor deve ser maior que zero")]
        public int? CondutorId { get; set; }

        public int? ContratanteId { get; set; }
        public int? SeguradoraId { get; set; }

        [Range(1, 999, ErrorMessage = "Serie deve estar entre 1 e 999")]
        public int? Serie { get; set; }

        [Range(1, 999999999, ErrorMessage = "Numero do MDFe deve estar entre 1 e 999999999")]
        public int? NumeroMdfe { get; set; }

        public DateTime? DataEmissao { get; set; }
        public DateTime? DataInicioViagem { get; set; }

        [RegularExpression(@"^[A-Z]{2}$", ErrorMessage = "UF de inicio deve ter 2 letras maiusculas")]
        public string? UfIni { get; set; }

        [RegularExpression(@"^[A-Z]{2}$", ErrorMessage = "UF de fim deve ter 2 letras maiusculas")]
        public string? UfFim { get; set; }

        [MaxLength(100, ErrorMessage = "Municipio de inicio deve ter no maximo 100 caracteres")]
        public string? MunicipioIni { get; set; }

        [MaxLength(100, ErrorMessage = "Municipio de fim deve ter no maximo 100 caracteres")]
        public string? MunicipioFim { get; set; }

        public decimal? PesoBrutoTotal { get; set; }
        public decimal? ValorTotal { get; set; }

        [MaxLength(500, ErrorMessage = "Informacoes adicionais devem ter no maximo 500 caracteres")]
        public string? InfoAdicional { get; set; }

        [Range(1, 4, ErrorMessage = "Modal deve ser 1=Rodoviario, 2=Aereo, 3=Aquaviario, 4=Ferroviario")]
        public int? Modal { get; set; }

        [Range(1, 3, ErrorMessage = "Tipo transportador deve ser 1=ETC, 2=TAC, 3=CTC")]
        public int? TipoTransportador { get; set; }

        public List<string>? DocumentosCTe { get; set; }
        public List<string>? DocumentosNFe { get; set; }
        public List<int>? ReboquesIds { get; set; }

        public List<ValePedagioDto>? ValesPedagio { get; set; }
        public bool SemValePedagio { get; set; }

        public PagamentoInfoDto? Pagamento { get; set; }

        public List<string>? AutorizadosXml { get; set; }
        public ResponsavelTecnicoDto? ResponsavelTecnico { get; set; }

        public List<UnidadeTransporteDto>? UnidadesTransporte { get; set; }
        public List<UnidadeCargaDto>? UnidadesCarga { get; set; }
        public List<ProdutoPerigosoDto>? ProdutosPerigosos { get; set; }

        public List<LocalidadeDto>? LocalidadesCarregamento { get; set; }
        public List<LocalidadeDto>? LocalidadesDescarregamento { get; set; }
        public List<string>? RotaPercurso { get; set; }

        [MaxLength(2, ErrorMessage = "Tipo de carga deve ter no maximo 2 caracteres")]
        public string? TipoCarga { get; set; }

        [MaxLength(100, ErrorMessage = "Descricao do produto deve ter no maximo 100 caracteres")]
        public string? DescricaoProduto { get; set; }

        [RegularExpression(@"^\d{8}$", ErrorMessage = "CEP de carregamento deve ter 8 digitos")]
        public string? CepCarregamento { get; set; }

        [RegularExpression(@"^\d{8}$", ErrorMessage = "CEP de descarregamento deve ter 8 digitos")]
        public string? CepDescarregamento { get; set; }

        public DateTime? DhInicioViagem { get; set; }
        public int? CodigoMunicipioCarregamento { get; set; }

        [MaxLength(100, ErrorMessage = "Nome do municipio de carregamento deve ter no maximo 100 caracteres")]
        public string? NomeMunicipioCarregamento { get; set; }

        public int? CodigoMunicipioDescarregamento { get; set; }

        [MaxLength(100, ErrorMessage = "Nome do municipio de descarregamento deve ter no maximo 100 caracteres")]
        public string? NomeMunicipioDescarregamento { get; set; }

        [MaxLength(8, ErrorMessage = "Codigo MDF deve ter no maximo 8 caracteres")]
        public string? CodigoMDF { get; set; }
    }// DTO para localidades de carregamento/descarregamento
    public class LocalidadeDto
    {
        [Required(ErrorMessage = "UF é obrigatória")]
        [RegularExpression(@"^[A-Z]{2}$", ErrorMessage = "UF deve ter 2 letras maiúsculas")]
        public string UF { get; set; } = string.Empty;

        [Required(ErrorMessage = "Município é obrigatório")]
        [MinLength(2, ErrorMessage = "Município deve ter pelo menos 2 caracteres")]
        [MaxLength(100, ErrorMessage = "Município deve ter no máximo 100 caracteres")]
        public string Municipio { get; set; } = string.Empty;

        [Required(ErrorMessage = "Código IBGE é obrigatório")]
        [Range(1000000, 9999999, ErrorMessage = "Código IBGE deve ter 7 dígitos")]
        public int CodigoIBGE { get; set; }
    }

        // DTO especifico para salvar rascunho - apenas emitente obrigatorio
    public class SalvarRascunhoDto
    {
        public int? Id { get; set; }

        [Required(ErrorMessage = "Emitente e obrigatorio")]
        [Range(1, int.MaxValue, ErrorMessage = "ID do emitente deve ser maior que zero")]
        public int EmitenteId { get; set; }

        public int? VeiculoId { get; set; }
        public int? CondutorId { get; set; }
        public int? ContratanteId { get; set; }
        public int? SeguradoraId { get; set; }

        public int? Serie { get; set; }
        public int? NumeroMdfe { get; set; }

        public DateTime? DataEmissao { get; set; }
        public DateTime? DataInicioViagem { get; set; }

        public string? UfIni { get; set; }
        public string? UfFim { get; set; }
        public string? MunicipioIni { get; set; }
        public string? MunicipioFim { get; set; }

        public decimal? PesoBrutoTotal { get; set; }
        public decimal? ValorTotal { get; set; }
        public string? InfoAdicional { get; set; }
        public string? TipoCarga { get; set; }
        public string? DescricaoProduto { get; set; }

        public DateTime? DhInicioViagem { get; set; }
        public int? CodigoMunicipioCarregamento { get; set; }
        public string? NomeMunicipioCarregamento { get; set; }
        public int? CodigoMunicipioDescarregamento { get; set; }
        public string? NomeMunicipioDescarregamento { get; set; }
        public string? CodigoMDF { get; set; }

        public string? CepCarregamento { get; set; }
        public string? CepDescarregamento { get; set; }

        public List<LocalidadeDto>? LocalidadesCarregamento { get; set; }
        public List<LocalidadeDto>? LocalidadesDescarregamento { get; set; }
        public List<string>? DocumentosCTe { get; set; }
        public List<string>? DocumentosNFe { get; set; }
        public List<string>? RotaPercurso { get; set; }
        public List<int>? ReboquesIds { get; set; }

        public List<ValePedagioDto>? ValesPedagio { get; set; }
        public bool SemValePedagio { get; set; }

        public PagamentoInfoDto? Pagamento { get; set; }

        public List<string>? AutorizadosXml { get; set; }
        public ResponsavelTecnicoDto? ResponsavelTecnico { get; set; }

        public List<UnidadeTransporteDto>? UnidadesTransporte { get; set; }
        public List<UnidadeCargaDto>? UnidadesCarga { get; set; }
        public List<ProdutoPerigosoDto>? ProdutosPerigosos { get; set; }
    }

    // DTO para atualizacao de MDFe
    public class MDFeUpdateDto : MDFeCreateDto
    {
        public int Id { get; set; }
    }

    // DTO para gerar arquivo INI do MDFe
    public class MDFeGerarINIDto : MDFeCreateDto
    {
        public int Id { get; set; }
        public string? CaminhoArquivo { get; set; }
        public string? UnidadeMedida { get; set; }
        public string? MunicipioCarregamento { get; set; }
        public string? MunicipioDescarregamento { get; set; }
    }

    // DTO para resposta de opera��es do MDFe
    public class ValePedagioDto
    {
        public string? CnpjFornecedor { get; set; }
        public string? CnpjPagador { get; set; }
        public string? NumeroCompra { get; set; }
        public decimal? ValorVale { get; set; }
        public string? TipoVale { get; set; }
        public string? NomeFornecedor { get; set; }
    }

    public class PagamentoComponenteDto
    {
        public string TipoComponente { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public string? Descricao { get; set; }
    }

    public class PagamentoPrazoDto
    {
        public string? NumeroParcela { get; set; }
        public decimal? ValorParcela { get; set; }
        public DateTime? DataVencimento { get; set; }
    }

    public class PagamentoBancoDto
    {
        public string? CodigoBanco { get; set; }
        public string? CodigoAgencia { get; set; }
        public string? CnpjIpef { get; set; }
        public string? NumeroContaPagamento { get; set; }
    }

    public class PagamentoInfoDto
    {
        public string? CnpjCpf { get; set; }
        public string? IdEstrangeiro { get; set; }
        public string? Nome { get; set; }
        public decimal? ValorContrato { get; set; }
        public string? IndicadorPagamento { get; set; }
        public string? TipoPagamento { get; set; }
        public string? Observacoes { get; set; }
        public List<PagamentoComponenteDto>? Componentes { get; set; }
        public List<PagamentoPrazoDto>? Prazos { get; set; }
        public PagamentoBancoDto? Banco { get; set; }
    }

    public class ResponsavelTecnicoDto
    {
        public string? Cnpj { get; set; }
        public string? NomeContato { get; set; }
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string? IdCsrt { get; set; }
        public string? HashCsrt { get; set; }
    }

    public class LacreDto
    {
        public string? NumeroLacre { get; set; }
    }

    public class UnidadeCargaDto
    {
        public string TipoUnidadeCarga { get; set; } = string.Empty;
        public string? IdUnidadeCarga { get; set; }
        public decimal? QtdRat { get; set; }
        public List<LacreDto>? Lacres { get; set; }
    }

    public class UnidadeTransporteDto
    {
        public string TipoUnidadeTransporte { get; set; } = string.Empty;
        public string? CodigoInterno { get; set; }
        public string? Placa { get; set; }
        public decimal? Tara { get; set; }
        public decimal? CapacidadeKg { get; set; }
        public decimal? CapacidadeM3 { get; set; }
        public string? TipoRodado { get; set; }
        public string? TipoCarroceria { get; set; }
        public string? Uf { get; set; }
        public decimal? QuantidadeRateada { get; set; }
        public List<UnidadeCargaDto>? UnidadesCarga { get; set; }
        public List<LacreDto>? Lacres { get; set; }
    }

    public class ProdutoPerigosoDto
    {
        public string? NumeroOnu { get; set; }
        public string? NomeEmbarque { get; set; }
        public string? ClasseRisco { get; set; }
        public string? GrupoEmbalagem { get; set; }
        public decimal? QuantidadeTotal { get; set; }
        public string? UnidadeMedida { get; set; }
        public string? Observacoes { get; set; }
    }

    public class MDFeResponseDto
    {
        public int Id { get; set; }
        public int NumeroMdfe { get; set; }
        public int Serie { get; set; }
        public DateTime DataEmissao { get; set; }
        public DateTime? DataInicioViagem { get; set; }
        public DateTime? DhInicioViagem { get; set; }
        public int? CodigoMunicipioCarregamento { get; set; }
        public string? NomeMunicipioCarregamento { get; set; }
        public int? CodigoMunicipioDescarregamento { get; set; }
        public string? NomeMunicipioDescarregamento { get; set; }
        public string? CodigoMDF { get; set; }
    public string? UfIni { get; set; }
    public string? UfFim { get; set; }
    public string? MunicipioIni { get; set; }
    public string? MunicipioFim { get; set; }
    public decimal? PesoBrutoTotal { get; set; }
    public decimal? ValorTotal { get; set; }
    public string? StatusSefaz { get; set; }
        public string? InfoAdicional { get; set; }
        public string? Protocolo { get; set; }
        public string? ChaveAcesso { get; set; }
        public DateTime? DataAutorizacao { get; set; }

        public string? EmitenteRazaoSocial { get; set; }
        public string? EmitenteCnpj { get; set; }
        public string? EmitenteUf { get; set; }

        public string? VeiculoPlaca { get; set; }
        public int? VeiculoTara { get; set; }
        public string? VeiculoUf { get; set; }

        public string? CondutorNome { get; set; }
        public string? CondutorCpf { get; set; }

        public int EmitenteId { get; set; }
        public int? VeiculoId { get; set; }
        public int? CondutorId { get; set; }
        public int? ContratanteId { get; set; }
        public int? SeguradoraId { get; set; }

        public bool Transmitido { get; set; }
        public bool Autorizado { get; set; }
        public bool Encerrado { get; set; }
        public bool Cancelado { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime? DataUltimaAlteracao { get; set; }

        // Campos de resposta para operacoes especificas
        public bool Sucesso { get; set; }
        public string? Mensagem { get; set; }
        public string? ProtocoloEnvio { get; set; }
        public string? NumeroProtocolo { get; set; }
        public DateTime? DataHoraRecibo { get; set; }
        public string? Status { get; set; }
        public string? ArquivoXml { get; set; }
        public string? ArquivoIni { get; set; }
        public List<string>? Erros { get; set; }
        public object? DadosAdicionais { get; set; }
    }

}


