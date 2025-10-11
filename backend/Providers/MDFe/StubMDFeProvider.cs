using Microsoft.Extensions.Logging;

namespace Backend.Api.Providers.MDFe;

public class StubMDFeProvider : IMDFeProvider
{
    private readonly ILogger<StubMDFeProvider> _logger;

    public StubMDFeProvider(ILogger<StubMDFeProvider> logger)
    {
        _logger = logger;
    }

    public Task<ProviderResult<string>> GerarXmlAsync(int mdfeId)
    {
        _logger.LogInformation("[StubMDFeProvider] GerarXmlAsync mdfeId={Id}", mdfeId);
        // XML fake mínimo
        var xml = $"<MDFeStub Id=\"MDFe{mdfeId}\"><Versao>stub</Versao><GeradoEm>{DateTime.UtcNow:o}</GeradoEm></MDFeStub>";
        return Task.FromResult(ProviderResult<string>.Ok(xml));
    }

    public Task<ProviderResult<object>> TransmitirAsync(int mdfeId)
        => Task.FromResult(ProviderResult<object>.Falha(ProviderErrorCode.NaoImplementado, "Transmitir não implementado no stub"));

    public Task<ProviderResult<object>> TransmitirComIniAsync(int mdfeId, string iniConteudo)
        => Task.FromResult(ProviderResult<object>.Falha(ProviderErrorCode.NaoImplementado, "TransmitirComIni não implementado no stub"));

    public Task<ProviderResult<object>> ConsultarProtocoloAsync(string chave, string protocolo)
        => Task.FromResult(ProviderResult<object>.Falha(ProviderErrorCode.NaoImplementado, "Consulta protocolo não implementada"));

    public Task<ProviderResult<object>> ConsultarPorChaveAsync(string chave)
        => Task.FromResult(ProviderResult<object>.Falha(ProviderErrorCode.NaoImplementado, "Consulta por chave não implementada"));

    public Task<ProviderResult<object>> ConsultarReciboAsync(string recibo)
        => Task.FromResult(ProviderResult<object>.Falha(ProviderErrorCode.NaoImplementado, "Consulta recibo não implementada"));

    public Task<ProviderResult<object>> CancelarAsync(string chave, string justificativa)
        => Task.FromResult(ProviderResult<object>.Falha(ProviderErrorCode.NaoImplementado, "Cancelamento não implementado"));

    public Task<ProviderResult<object>> EncerrarAsync(string chave, string municipioEncerramento, DateTime dataEncerramento)
        => Task.FromResult(ProviderResult<object>.Falha(ProviderErrorCode.NaoImplementado, "Encerramento não implementado"));

    public Task<ProviderResult<byte[]>> GerarPdfAsync(string chave)
        => Task.FromResult(ProviderResult<byte[]>.Falha(ProviderErrorCode.NaoImplementado, "PDF não implementado"));

    public Task<ProviderResult<MdfeStatusInfo>> ObterStatusAsync()
    {
        var info = new MdfeStatusInfo(
            Ambiente: "Indefinido",
            VersaoBiblioteca: "stub",
            StatusServico: "INTEGRACAO_REMOVIDA",
            Timestamp: DateTime.UtcNow,
            Implementacao: nameof(StubMDFeProvider),
            Extras: new Dictionary<string, string>{{"provider","stub"}}
        );
        return Task.FromResult(ProviderResult<MdfeStatusInfo>.Ok(info));
    }

    public Task<ProviderResult<object>> DistribuicaoPorNSUAsync(string uf, string cnpjOuCpf, string nsu)
        => Task.FromResult(ProviderResult<object>.Falha(ProviderErrorCode.NaoImplementado, "Distribuição NSU não implementada no stub"));
    public Task<ProviderResult<object>> DistribuicaoPorUltNSUAsync(string uf, string cnpjOuCpf, string ultNsu)
        => Task.FromResult(ProviderResult<object>.Falha(ProviderErrorCode.NaoImplementado, "Distribuição UltNSU não implementada no stub"));
    public Task<ProviderResult<object>> DistribuicaoPorChaveAsync(string uf, string cnpjOuCpf, string chave)
        => Task.FromResult(ProviderResult<object>.Falha(ProviderErrorCode.NaoImplementado, "Distribuição Chave não implementada no stub"));

    public Task<ProviderResult<string>> GerarChaveAsync(int cUF, int ano, int mes, string cnpj, int serie, int numero, int tpEmis, string cNF)
        => Task.FromResult(ProviderResult<string>.Ok($"STUBCHAVE{DateTime.UtcNow:yyyyMMddHHmmss}"));
}
