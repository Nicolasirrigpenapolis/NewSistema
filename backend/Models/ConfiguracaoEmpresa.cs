namespace Backend.Api.Models;

/// <summary>
/// Configuração de empresa para multi-tenant dinâmico
/// </summary>
public class ConfiguracaoEmpresa
{
    public required string Id { get; set; }
    public required string Nome { get; set; }
    public required string NomeExibicao { get; set; }
    public required string Logo { get; set; }
    public required string LogoLogin { get; set; }
    public required string FundoLogin { get; set; }
    public required string CorPrimaria { get; set; }
    public required string CorSecundaria { get; set; }
    public required string StringConexao { get; set; }
    public string? CertificadoCaminho { get; set; }
    public string? CertificadoSenha { get; set; }
    public bool Ativo { get; set; } = true;
}

/// <summary>
/// Container de configurações de empresas
/// </summary>
public class ConfiguracoesEmpresas
{
    public List<ConfiguracaoEmpresa> Empresas { get; set; } = new();
}
