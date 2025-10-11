namespace Backend.Api.Providers.MDFe;

public interface IMDFeProvider
{
    Task<ProviderResult<string>> GerarXmlAsync(int mdfeId);
    // Transmitir usando geração interna (legado / fallback)
    Task<ProviderResult<object>> TransmitirAsync(int mdfeId);
    // Transmitir recebendo conteúdo INI já montado externamente
    Task<ProviderResult<object>> TransmitirComIniAsync(int mdfeId, string iniConteudo);
    Task<ProviderResult<object>> ConsultarProtocoloAsync(string chave, string protocolo);
    Task<ProviderResult<object>> ConsultarPorChaveAsync(string chave);
    Task<ProviderResult<object>> ConsultarReciboAsync(string recibo);
    Task<ProviderResult<object>> CancelarAsync(string chave, string justificativa);
    Task<ProviderResult<object>> EncerrarAsync(string chave, string municipioEncerramento, DateTime dataEncerramento);
    Task<ProviderResult<byte[]>> GerarPdfAsync(string chave);
    Task<ProviderResult<MdfeStatusInfo>> ObterStatusAsync();
    // Distribuição DF-e
    Task<ProviderResult<object>> DistribuicaoPorNSUAsync(string uf, string cnpjOuCpf, string nsu);
    Task<ProviderResult<object>> DistribuicaoPorUltNSUAsync(string uf, string cnpjOuCpf, string ultNsu);
    Task<ProviderResult<object>> DistribuicaoPorChaveAsync(string uf, string cnpjOuCpf, string chave);
    // Geração de chave (usando parâmetros mínimos já presentes no modelo persistido)
    Task<ProviderResult<string>> GerarChaveAsync(int cUF, int ano, int mes, string cnpj, int serie, int numero, int tpEmis, string cNF);
}
