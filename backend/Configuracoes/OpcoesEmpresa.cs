using System.ComponentModel.DataAnnotations;

namespace Backend.Api.Configuracoes;

/// <summary>
/// Representa as opções de configuração específicas da empresa (tenant) carregadas na inicialização.
/// </summary>
public class OpcoesEmpresa
{
    [Required]
    [MaxLength(64)]
    public string IdentificadorEmpresa { get; set; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string NomeExibicao { get; set; } = string.Empty;

    [Required]
    [MinLength(3)]
    public string StringConexao { get; set; } = string.Empty;

    [MaxLength(32)]
    public string? CodigoExterno { get; set; }

    public OpcoesArmazenamentoEmpresa Armazenamento { get; set; } = new();

    public OpcoesIdentidadeVisualEmpresa IdentidadeVisual { get; set; } = new();
}

public class OpcoesArmazenamentoEmpresa
{
    [MaxLength(256)]
    public string CaminhoBase { get; set; } = "armazenamento";

    [MaxLength(256)]
    public string PastaCertificados { get; set; } = "certificados";

    [MaxLength(256)]
    public string PastaXml { get; set; } = "xml";

    [MaxLength(256)]
    public string PastaLogos { get; set; } = "logos";
}

public class OpcoesIdentidadeVisualEmpresa
{
    [MaxLength(256)]
    public string? ArquivoLogotipo { get; set; }

    [MaxLength(32)]
    public string? CorPrimaria { get; set; }
}
