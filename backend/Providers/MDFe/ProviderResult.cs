namespace Backend.Api.Providers.MDFe;

public enum ProviderErrorCode
{
    None = 0,
    NaoImplementado = 1,
    IntegracaoIndisponivel = 2,
    Comunicacao = 3,
    Validacao = 4,
    Negocio = 5,
    Timeout = 6,
    ErroValidacao = 7,
    ErroCertificado = 8,
    ErroTransmissao = 9,
    ErroSefaz = 10,
    ErroInterno = 11,
    ErroConsulta = 12,
    ErroEvento = 13,
    ErroPdf = 14,
    ErroDistribuicao = 15,
    NaoEncontrado = 16,
    Desconhecido = 99
}

public sealed record ProviderResult<T>(bool Sucesso, T? Dados, ProviderErrorCode CodigoErro, string? Mensagem, IDictionary<string, object>? Metadados = null)
{
    public static ProviderResult<T> Ok(T dados, IDictionary<string, object>? meta = null) => new(true, dados, ProviderErrorCode.None, null, meta);
    public static ProviderResult<T> Falha(ProviderErrorCode codigo, string mensagem, IDictionary<string, object>? meta = null) => new(false, default, codigo, mensagem, meta);
}

public sealed record MdfeStatusInfo(
    string Ambiente,
    string VersaoBiblioteca,
    string StatusServico,
    DateTime Timestamp,
    string Implementacao,
    IDictionary<string, string>? Extras = null);
