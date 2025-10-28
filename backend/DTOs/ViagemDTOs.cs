using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class ViagemListDto
    {
        public int Id { get; set; }
        public int VeiculoId { get; set; }
        public string VeiculoPlaca { get; set; } = string.Empty;
        public string VeiculoMarca { get; set; } = string.Empty;
        public int? CondutorId { get; set; }
        public string? CondutorNome { get; set; }
        public DateTime DataInicio { get; set; }
        public DateTime DataFim { get; set; }
        public int DuracaoDias { get; set; }
        public decimal? KmInicial { get; set; }
        public decimal? KmFinal { get; set; }
        public decimal? KmPercorrido { get; set; }
        public decimal ReceitaTotal { get; set; }
        public decimal TotalDespesas { get; set; }
        public decimal SaldoLiquido { get; set; }
        public string? OrigemDestino { get; set; }
        public DateTime DataCriacao { get; set; }
    }

    public class ViagemDetailDto : ViagemListDto
    {
        public string? Observacoes { get; set; }
        public DateTime? DataUltimaAlteracao { get; set; }
        public List<DespesaViagemDto> Despesas { get; set; } = new List<DespesaViagemDto>();
        public List<ReceitaViagemDto> Receitas { get; set; } = new List<ReceitaViagemDto>();
    }

    public class ViagemCreateDto
    {
        [Required(ErrorMessage = "Veículo é obrigatório")]
        public int VeiculoId { get; set; }

        public int? CondutorId { get; set; }

        [Required(ErrorMessage = "Data de início é obrigatória")]
        public DateTime DataInicio { get; set; }

        [Required(ErrorMessage = "Data de fim é obrigatória")]
        public DateTime DataFim { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "KM inicial deve ser positivo")]
        public decimal? KmInicial { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "KM final deve ser positivo")]
        public decimal? KmFinal { get; set; }

        [StringLength(500, ErrorMessage = "Origem/Destino deve ter no máximo 500 caracteres")]
        public string? OrigemDestino { get; set; }

        [StringLength(1000, ErrorMessage = "Observações devem ter no máximo 1000 caracteres")]
        public string? Observacoes { get; set; }

        public List<DespesaViagemCreateDto> Despesas { get; set; } = new List<DespesaViagemCreateDto>();
        public List<ReceitaViagemCreateDto> Receitas { get; set; } = new List<ReceitaViagemCreateDto>();
    }

    public class ViagemUpdateDto : ViagemCreateDto
    {
        public bool Ativo { get; set; } = true;
    }

    public class DespesaViagemDto
    {
        public int Id { get; set; }
        public int ViagemId { get; set; }
        public string TipoDespesa { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public DateTime DataDespesa { get; set; }
        public string? Local { get; set; }
        public string? Observacoes { get; set; }
    }

    public class DespesaViagemCreateDto
    {
        [Required(ErrorMessage = "Tipo de despesa é obrigatório")]
        [StringLength(50, ErrorMessage = "Tipo de despesa deve ter no máximo 50 caracteres")]
        public string TipoDespesa { get; set; } = string.Empty;

        [Required(ErrorMessage = "Descrição é obrigatória")]
        [StringLength(200, ErrorMessage = "Descrição deve ter no máximo 200 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "Valor é obrigatório")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
        public decimal Valor { get; set; }

        [Required(ErrorMessage = "Data da despesa é obrigatória")]
        public DateTime DataDespesa { get; set; }

        [StringLength(100, ErrorMessage = "Local deve ter no máximo 100 caracteres")]
        public string? Local { get; set; }

        [StringLength(500, ErrorMessage = "Observações devem ter no máximo 500 caracteres")]
        public string? Observacoes { get; set; }
    }

    public class DespesaViagemUpdateDto : DespesaViagemCreateDto
    {
        public int Id { get; set; }
    }

    // DTOs para Receitas
    public class ReceitaViagemDto
    {
        public int Id { get; set; }
        public int ViagemId { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public DateTime DataReceita { get; set; }
        public string? Origem { get; set; }
        public string? Observacoes { get; set; }
    }

    public class ReceitaViagemCreateDto
    {
        [Required(ErrorMessage = "Descrição é obrigatória")]
        [StringLength(200, ErrorMessage = "Descrição deve ter no máximo 200 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "Valor é obrigatório")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
        public decimal Valor { get; set; }

        [Required(ErrorMessage = "Data da receita é obrigatória")]
        public DateTime DataReceita { get; set; }

        [StringLength(200, ErrorMessage = "Origem deve ter no máximo 200 caracteres")]
        public string? Origem { get; set; }

        [StringLength(500, ErrorMessage = "Observações devem ter no máximo 500 caracteres")]
        public string? Observacoes { get; set; }
    }

    public class ReceitaViagemUpdateDto : ReceitaViagemCreateDto
    {
        public int Id { get; set; }
    }

    // DTOs para filtros de relatório de viagem
    public class RelatorioViagemFiltroDto
    {
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public string? Placa { get; set; }
        public string? TipoDespesa { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "DataInicio";
        public string? SortDirection { get; set; } = "desc";
        public string? UsuarioSolicitante { get; set; }
        public string? TituloRelatorio { get; set; }
        
        // Filtro avançado para exportação (modal)
        public int? CondutorId { get; set; }
    }

    public class RelatorioViagemItemDto
    {
        public int Id { get; set; }
        public string VeiculoPlaca { get; set; } = string.Empty;
        public string VeiculoMarca { get; set; } = string.Empty;
        public DateTime DataInicio { get; set; }
        public DateTime DataFim { get; set; }
        public int DuracaoDias { get; set; }
        public string? OrigemDestino { get; set; }
        public decimal ReceitaTotal { get; set; }
        public decimal TotalDespesas { get; set; }
        public decimal SaldoLiquido { get; set; }
        public List<DespesaViagemDto> Despesas { get; set; } = new List<DespesaViagemDto>();
        public Dictionary<string, decimal> DespesasPorTipo { get; set; } = new Dictionary<string, decimal>();
    }

    public class RelatorioViagemResumoDto
    {
        public int TotalViagens { get; set; }
        public decimal ReceitaTotalGeral { get; set; }
        public decimal DespesaTotalGeral { get; set; }
        public decimal SaldoLiquidoGeral { get; set; }
        public Dictionary<string, decimal> DespesasPorTipo { get; set; } = new Dictionary<string, decimal>();
        public List<RelatorioViagemItemDto> Viagens { get; set; } = new List<RelatorioViagemItemDto>();
    }

    // DTOs para tipos de despesa
    public static class TiposDespesa
    {
        public const string Combustivel = "Combustível";
        public const string Pedagio = "Pedágio";
        public const string Alimentacao = "Alimentação";
        public const string Hospedagem = "Hospedagem";
        public const string ManutencaoRota = "Manutenção em Rota";
        public const string Multa = "Multa";
        public const string Seguro = "Seguro";
        public const string Documentacao = "Documentação";
        public const string Outros = "Outros";

        public static readonly List<string> TodosTipos = new List<string>
        {
            Combustivel, Pedagio, Alimentacao, Hospedagem, ManutencaoRota,
            Multa, Seguro, Documentacao, Outros
        };
    }
}
