using System.ComponentModel.DataAnnotations;
using Backend.Api.Configuracoes;
using Microsoft.Extensions.Logging;

namespace Backend.Api.Tenancia;

/// <summary>
/// Implementação padrão do contexto da empresa, responsável por validar e expor
/// as informações da instalação atual (tenant).
/// </summary>
public class ContextoEmpresa : IContextoEmpresa
{
    private readonly ILogger<ContextoEmpresa>? _logger;

    public ContextoEmpresa(OpcoesEmpresa opcoes, ILogger<ContextoEmpresa>? logger = null)
    {
        _logger = logger;
        ArgumentNullException.ThrowIfNull(opcoes, nameof(opcoes));

        Validar(opcoes);

        IdentificadorEmpresa = opcoes.IdentificadorEmpresa.Trim();
        NomeExibicao = opcoes.NomeExibicao.Trim();
        StringConexao = opcoes.StringConexao.Trim();
        CodigoExterno = string.IsNullOrWhiteSpace(opcoes.CodigoExterno)
            ? null
            : opcoes.CodigoExterno.Trim();

        Armazenamento = NormalizarArmazenamento(opcoes.Armazenamento);
        IdentidadeVisual = NormalizarIdentidadeVisual(opcoes.IdentidadeVisual);

        GarantirEstruturaDePastas();
    }

    public string IdentificadorEmpresa { get; }
    public string NomeExibicao { get; }
    public string StringConexao { get; }
    public string? CodigoExterno { get; }
    public OpcoesArmazenamentoEmpresa Armazenamento { get; }
    public OpcoesIdentidadeVisualEmpresa IdentidadeVisual { get; }

    private static void Validar(OpcoesEmpresa opcoes)
    {
        var resultados = new List<ValidationResult>();
        var contexto = new ValidationContext(opcoes);

        if (!Validator.TryValidateObject(opcoes, contexto, resultados, validateAllProperties: true))
        {
            var mensagens = string.Join("; ", resultados.Select(r => r.ErrorMessage));
            throw new ValidationException($"Configuração da empresa inválida: {mensagens}");
        }
    }

    private OpcoesArmazenamentoEmpresa NormalizarArmazenamento(OpcoesArmazenamentoEmpresa? armazenamento)
    {
        armazenamento ??= new OpcoesArmazenamentoEmpresa();

        var caminhoBaseRelativo = string.IsNullOrWhiteSpace(armazenamento.CaminhoBase)
            ? "armazenamento"
            : armazenamento.CaminhoBase.Trim();

        var caminhoBaseAbsoluto = Path.IsPathRooted(caminhoBaseRelativo)
            ? caminhoBaseRelativo
            : Path.Combine(AppContext.BaseDirectory, caminhoBaseRelativo);

        var opcoes = new OpcoesArmazenamentoEmpresa
        {
            CaminhoBase = caminhoBaseAbsoluto,
            PastaCertificados = string.IsNullOrWhiteSpace(armazenamento.PastaCertificados)
                ? "certificados"
                : armazenamento.PastaCertificados.Trim(),
            PastaXml = string.IsNullOrWhiteSpace(armazenamento.PastaXml)
                ? "xml"
                : armazenamento.PastaXml.Trim(),
            PastaLogos = string.IsNullOrWhiteSpace(armazenamento.PastaLogos)
                ? "logos"
                : armazenamento.PastaLogos.Trim()
        };

        return opcoes;
    }

    private static OpcoesIdentidadeVisualEmpresa NormalizarIdentidadeVisual(OpcoesIdentidadeVisualEmpresa? identidadeVisual)
    {
        identidadeVisual ??= new OpcoesIdentidadeVisualEmpresa();

        return new OpcoesIdentidadeVisualEmpresa
        {
            ArquivoLogotipo = string.IsNullOrWhiteSpace(identidadeVisual.ArquivoLogotipo)
                ? null
                : identidadeVisual.ArquivoLogotipo.Trim(),
            CorPrimaria = string.IsNullOrWhiteSpace(identidadeVisual.CorPrimaria)
                ? null
                : identidadeVisual.CorPrimaria.Trim()
        };
    }

    private void GarantirEstruturaDePastas()
    {
        try
        {
            Directory.CreateDirectory(Armazenamento.CaminhoBase);
            Directory.CreateDirectory(Path.Combine(Armazenamento.CaminhoBase, Armazenamento.PastaCertificados));
            Directory.CreateDirectory(Path.Combine(Armazenamento.CaminhoBase, Armazenamento.PastaXml));
            Directory.CreateDirectory(Path.Combine(Armazenamento.CaminhoBase, Armazenamento.PastaLogos));
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "Não foi possível criar toda a estrutura de pastas da empresa.");
        }
    }
}
