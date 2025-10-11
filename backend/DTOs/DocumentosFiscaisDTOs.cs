namespace Backend.Api.DTOs
{
    // DTOs básicos para documentos fiscais
    public class MDFeCteDto
    {
        public int Id { get; set; }
        public int MunicipioDescargaId { get; set; }
        public string ChaveCte { get; set; } = string.Empty;
        public string? SegundoCodigoBarras { get; set; }
        public string? IndicadorReentrega { get; set; }
        public decimal? ValorTotal { get; set; }
        public decimal? PesoBrutoTotal { get; set; }
    }

    public class MDFeNfeDto
    {
        public int Id { get; set; }
        public int MunicipioDescargaId { get; set; }
        public string ChaveNfe { get; set; } = string.Empty;
        public string? SegundoCodigoBarras { get; set; }
        public string? IndicadorReentrega { get; set; }
        public decimal? ValorTotal { get; set; }
        public decimal? PesoBrutoTotal { get; set; }
    }

    public class MDFeMdfeTranspDto
    {
        public int Id { get; set; }
        public int MunicipioDescargaId { get; set; }
        public string ChaveMdfeTransp { get; set; } = string.Empty;
        public string? IndicadorReentrega { get; set; }
        public decimal? QuantidadeRateada { get; set; }
    }

    public class MDFeUnidadeTransporteDto
    {
        public int Id { get; set; }
        public string TipoUnidadeTransporte { get; set; } = string.Empty;
        public string IdentificacaoUnidadeTransporte { get; set; } = string.Empty;
        public List<string> Lacres { get; set; } = new();
    }

    public class MDFeProdutoPerigososDto
    {
        public int Id { get; set; }
        public string NumeroONU { get; set; } = string.Empty;
        public string? NomeApropriado { get; set; }
        public string? ClasseRisco { get; set; }
    }

    // DTO para resposta completa de documentos fiscais
    public class MDFeDocumentosFiscaisResponseDto
    {
        public int MDFeId { get; set; }
        public List<MDFeCteDto> DocumentosCte { get; set; } = new();
        public List<MDFeNfeDto> DocumentosNfe { get; set; } = new();
        public List<MDFeMdfeTranspDto> DocumentosMdfeTransp { get; set; } = new();
        public int TotalDocumentos => DocumentosCte.Count + DocumentosNfe.Count + DocumentosMdfeTransp.Count;
    }

    // DTO para criação de documentos fiscais
    public class MDFeDocumentosFiscaisCreateDto
    {
        public int MDFeId { get; set; }
        public List<MDFeCteDto> DocumentosCte { get; set; } = new();
        public List<MDFeNfeDto> DocumentosNfe { get; set; } = new();
        public List<MDFeMdfeTranspDto> DocumentosMdfeTransp { get; set; } = new();
    }
}
