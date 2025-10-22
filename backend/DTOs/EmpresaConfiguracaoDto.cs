namespace Backend.Api.DTOs;

public class EmpresaConfiguracaoDto
{
    public string Identificador { get; set; } = string.Empty;
    public string NomeExibicao { get; set; } = string.Empty;
    public string BancoDados { get; set; } = string.Empty;
    public bool EmitenteConfigurado { get; set; }
    public string? CaminhoLogotipo { get; set; }
    public string? UrlLogotipo { get; set; }
    public string? CaminhoImagemFundo { get; set; }
    public string? UrlImagemFundo { get; set; }
    public string CaminhoBaseArmazenamento { get; set; } = string.Empty;
    public string PastaXml { get; set; } = string.Empty;
    public string PastaCertificados { get; set; } = string.Empty;
    public string PastaLogos { get; set; } = string.Empty;
    public DateTime DataConsulta { get; set; } = DateTime.UtcNow;
}
