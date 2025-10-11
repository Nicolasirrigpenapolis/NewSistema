using System.ComponentModel.DataAnnotations;

namespace Backend.Api.DTOs
{
    public class ManutencaoVeiculoListDto
    {
        public int Id { get; set; }
        public int VeiculoId { get; set; }
        public string VeiculoPlaca { get; set; } = string.Empty;
        public string VeiculoMarca { get; set; } = string.Empty;
        public DateTime DataManutencao { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public int? FornecedorId { get; set; }
        public string? FornecedorNome { get; set; }
        public decimal ValorMaoObra { get; set; }
        public decimal ValorPecas { get; set; }
        public decimal ValorTotal { get; set; }
        public DateTime DataCriacao { get; set; }
    }

    public class ManutencaoVeiculoDetailDto : ManutencaoVeiculoListDto
    {
        public string? Observacoes { get; set; }
        public DateTime? DataUltimaAlteracao { get; set; }
        public List<ManutencaoPecaDto> Pecas { get; set; } = new List<ManutencaoPecaDto>();
    }

    public class ManutencaoVeiculoCreateDto
    {
        [Required(ErrorMessage = "Veículo é obrigatório")]
        public int VeiculoId { get; set; }

        [Required(ErrorMessage = "Data da manutenção é obrigatória")]
        public DateTime DataManutencao { get; set; }

        [Required(ErrorMessage = "Descrição é obrigatória")]
        [StringLength(500, ErrorMessage = "Descrição deve ter no máximo 500 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        public int? FornecedorId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Valor da mão de obra deve ser positivo")]
        public decimal ValorMaoObra { get; set; } = 0;

        [StringLength(1000, ErrorMessage = "Observações devem ter no máximo 1000 caracteres")]
        public string? Observacoes { get; set; }

        public List<ManutencaoPecaCreateDto> Pecas { get; set; } = new List<ManutencaoPecaCreateDto>();
    }

    public class ManutencaoVeiculoUpdateDto : ManutencaoVeiculoCreateDto
    {
        public bool Ativo { get; set; } = true;
    }

    public class ManutencaoPecaDto
    {
        public int Id { get; set; }
        public int ManutencaoId { get; set; }
        public string DescricaoPeca { get; set; } = string.Empty;
        public decimal Quantidade { get; set; }
        public decimal ValorUnitario { get; set; }
        public decimal ValorTotal { get; set; }
        public string? Unidade { get; set; }
    }

    public class ManutencaoPecaCreateDto
    {
        [Required(ErrorMessage = "Descrição da peça é obrigatória")]
        [StringLength(200, ErrorMessage = "Descrição da peça deve ter no máximo 200 caracteres")]
        public string DescricaoPeca { get; set; } = string.Empty;

        [Required(ErrorMessage = "Quantidade é obrigatória")]
        [Range(0.001, double.MaxValue, ErrorMessage = "Quantidade deve ser maior que zero")]
        public decimal Quantidade { get; set; }

        [Required(ErrorMessage = "Valor unitário é obrigatório")]
        [Range(0, double.MaxValue, ErrorMessage = "Valor unitário deve ser positivo")]
        public decimal ValorUnitario { get; set; }

        [StringLength(50, ErrorMessage = "Unidade deve ter no máximo 50 caracteres")]
        public string? Unidade { get; set; } = "UN";
    }

    public class ManutencaoPecaUpdateDto : ManutencaoPecaCreateDto
    {
        public int Id { get; set; }
    }

    // DTOs para filtros de relatório
    public class RelatorioManutencaoFiltroDto
    {
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public string? Placa { get; set; }
        public string? Peca { get; set; }
        public int? FornecedorId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "DataManutencao";
        public string? SortDirection { get; set; } = "desc";
    }

    public class RelatorioManutencaoItemDto
    {
        public int Id { get; set; }
        public DateTime DataManutencao { get; set; }
        public string VeiculoPlaca { get; set; } = string.Empty;
        public string VeiculoMarca { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public string? FornecedorNome { get; set; }
        public decimal ValorMaoObra { get; set; }
        public decimal ValorPecas { get; set; }
        public decimal ValorTotal { get; set; }
        public List<ManutencaoPecaDto> Pecas { get; set; } = new List<ManutencaoPecaDto>();
    }

    public class RelatorioManutencaoResumoDto
    {
        public int TotalManutencoes { get; set; }
        public decimal ValorTotalMaoObra { get; set; }
        public decimal ValorTotalPecas { get; set; }
        public decimal ValorTotalGeral { get; set; }
        public List<RelatorioManutencaoItemDto> Manutencoes { get; set; } = new List<RelatorioManutencaoItemDto>();
    }
}
