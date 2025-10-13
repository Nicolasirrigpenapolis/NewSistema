using Backend.Api.Data;
using Backend.Api.Providers.MDFe.Native;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Runtime.InteropServices;
using System.IO;
using System.Text;

namespace Backend.Api.Providers.MDFe;

/// <summary>
/// Provider de integração com ACBrLibMDFe via DLL nativa
/// Implementa IMDFeProvider com chamadas P/Invoke
/// </summary>
public class AcbrLibMDFeProvider : IMDFeProvider, IDisposable
{
    private readonly ILogger<AcbrLibMDFeProvider> _logger;
    private readonly IConfiguration _configuration;
    private readonly SistemaContext _context;
    private readonly AcbrConfigManager _configManager;
    private bool _initialized = false;
    private bool _disposed = false;
    private bool _nativeLibraryLoaded = false;

    // Controle global estático para evitar múltiplas inicializações da biblioteca nativa
    private static volatile bool _globalLibraryInitialized = false;
    private static readonly object _lockObject = new object();

    public AcbrLibMDFeProvider(
        ILogger<AcbrLibMDFeProvider> logger,
        IConfiguration configuration,
        SistemaContext context)
    {
        _logger = logger;
        _configuration = configuration;
        _context = context;
        _configManager = new AcbrConfigManager(configuration);

        Inicializar();
    }

    private void EnsureNativeLibraryLoaded()
    {
        if (_nativeLibraryLoaded)
        {
            return;
        }

        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        var dllName = Environment.Is64BitProcess ? "ACBrMDFe64.dll" : "ACBrMDFe32.dll";
        var nativeDir = Path.Combine(baseDir, "Native");
        var dllPath = Path.Combine(nativeDir, dllName);

        if (File.Exists(dllPath))
        {
            NativeLibrary.Load(dllPath);
            _logger.LogInformation("[AcbrLibMDFe] Biblioteca nativa carregada de {Path}", dllPath);
            _nativeLibraryLoaded = true;
            return;
        }

        if (NativeLibrary.TryLoad(dllName, out _))
        {
            _logger.LogInformation("[AcbrLibMDFe] Biblioteca nativa {Dll} carregada via PATH.", dllName);
            _nativeLibraryLoaded = true;
            return;
        }

        throw new FileNotFoundException($"Não foi possível localizar a biblioteca nativa {dllName}. Copie o arquivo para {nativeDir} ou configure o PATH.");
    }

    #region Inicialização e Controle

    private void Inicializar()
    {
        try
        {
            _logger.LogInformation("[AcbrLibMDFe] Iniciando biblioteca...");

            EnsureNativeLibraryLoaded();

            // Gerar arquivo de configuração ACBrLib.ini
            _configManager.GerarConfiguracao();
            _configManager.CopiarSchemas();

            _logger.LogInformation("[AcbrLibMDFe] Config path: {Path}", _configManager.ConfigPath);

            // Inicializar biblioteca (apenas uma vez globalmente)
            lock (_lockObject)
            {
                if (!_globalLibraryInitialized)
                {
                    var ret = AcbrLibMDFeNative.MDFE_Inicializar(_configManager.ConfigPath, "");

                    if (!AcbrLibMDFeNative.IsSuccess(ret))
                    {
                        var erro = ObterUltimoErro();
                        throw new Exception($"Falha ao inicializar ACBrLibMDFe: código {ret}, erro: {erro}");
                    }

                    _globalLibraryInitialized = true;
                    _logger.LogInformation("[AcbrLibMDFe] Biblioteca inicializada globalmente");
                }
                else
                {
                    _logger.LogInformation("[AcbrLibMDFe] Biblioteca já inicializada - reutilizando instância global");
                }
            }

            _initialized = true;

            // Log versão da biblioteca
            var versao = ObterVersao();
            var nome = ObterNome();
            _logger.LogInformation("[AcbrLibMDFe] Inicializada: {Nome} v{Versao}", nome, versao);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AcbrLibMDFe] Erro ao inicializar biblioteca");
            throw;
        }
    }

    private string ObterNome()
    {
        var buffer = AcbrLibMDFeNative.CreateResponseBuffer();
        int tamanho = buffer.Capacity;
        AcbrLibMDFeNative.MDFE_Nome(buffer, ref tamanho);
        return buffer.ToString();
    }

    private string ObterVersao()
    {
        var buffer = AcbrLibMDFeNative.CreateResponseBuffer();
        int tamanho = buffer.Capacity;
        AcbrLibMDFeNative.MDFE_Versao(buffer, ref tamanho);
        return buffer.ToString();
    }

    private string ObterUltimoErro()
    {
        var buffer = AcbrLibMDFeNative.CreateResponseBuffer();
        int tamanho = buffer.Capacity;
        AcbrLibMDFeNative.MDFE_UltimoRetorno(buffer, ref tamanho);
        return buffer.ToString();
    }

    #endregion

    #region Transmissão

    public async Task<ProviderResult<object>> TransmitirComIniAsync(int mdfeId, string iniConteudo)
    {
        try
        {
            VerificarInicializacao();

            _logger.LogInformation("[AcbrLibMDFe] Transmitindo MDFe {Id}", mdfeId);

            // 1. Limpar lista de MDFes
            AcbrLibMDFeNative.MDFE_LimparLista();

            // 2. Carregar INI
            var retCarregar = AcbrLibMDFeNative.MDFE_CarregarINI(iniConteudo);
            if (!AcbrLibMDFeNative.IsSuccess(retCarregar))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroValidacao,
                    $"Erro ao carregar INI: {erro}");
            }

            // 3. Assinar
            var retAssinar = AcbrLibMDFeNative.MDFE_Assinar();
            if (!AcbrLibMDFeNative.IsSuccess(retAssinar))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroCertificado,
                    $"Erro ao assinar: {erro}");
            }

            // 4. Validar
            var retValidar = AcbrLibMDFeNative.MDFE_Validar();
            if (!AcbrLibMDFeNative.IsSuccess(retValidar))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroValidacao,
                    $"Erro na validação: {erro}");
            }

            // 5. Enviar para SEFAZ
            var resposta = AcbrLibMDFeNative.CreateResponseBuffer();
            int tamanho = resposta.Capacity;
            var retEnviar = AcbrLibMDFeNative.MDFE_Enviar(
                1, // Lote
                false, // Não imprimir automaticamente
                true, // Síncrono
                resposta,
                ref tamanho);

            if (!AcbrLibMDFeNative.IsSuccess(retEnviar))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroTransmissao,
                    $"Erro ao enviar: {erro}");
            }

            // 6. Parse resposta
            var respostaIni = resposta.ToString();
            var transmissao = AcbrIniResponseParser.ParseTransmissao(respostaIni);

            _logger.LogInformation("[AcbrLibMDFe] Resposta: cStat={Status}, xMotivo={Motivo}",
                transmissao.CodigoStatus, transmissao.MotivoStatus);

            if (!transmissao.Sucesso)
            {
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroSefaz,
                    $"SEFAZ retornou erro: {transmissao.CodigoStatus} - {transmissao.MotivoStatus}");
            }

            // 7. Atualizar banco de dados
            var mdfe = await _context.MDFes.FindAsync(mdfeId);
            if (mdfe != null)
            {
                mdfe.Protocolo = transmissao.Protocolo;
                mdfe.NumeroRecibo = transmissao.NumeroRecibo;
                mdfe.XmlAutorizado = transmissao.XmlAutorizado;
                mdfe.DataTransmissao = DateTime.Now;
                mdfe.DataAutorizacao = DateTime.TryParse(transmissao.DataRecebimento, out var dt) ? dt : null;
                mdfe.Transmitido = true;
                mdfe.Autorizado = true;
                mdfe.RegistrarStatus("AUTORIZADO", $"Protocolo: {transmissao.Protocolo}");

                await _context.SaveChangesAsync();
            }

            return ProviderResult<object>.Ok(transmissao);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AcbrLibMDFe] Erro ao transmitir MDFe {Id}", mdfeId);
            return ProviderResult<object>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    public Task<ProviderResult<object>> TransmitirAsync(int mdfeId)
    {
        // Implementação legado - usar TransmitirComIniAsync
        return Task.FromResult(ProviderResult<object>.Falha(
            ProviderErrorCode.NaoImplementado,
            "Use TransmitirComIniAsync"));
    }

    #endregion

    #region Consultas

    public async Task<ProviderResult<object>> ConsultarPorChaveAsync(string chave)
    {
        try
        {
            VerificarInicializacao();

            _logger.LogInformation("[AcbrLibMDFe] Consultando MDFe por chave: {Chave}", chave);

            var resposta = AcbrLibMDFeNative.CreateResponseBuffer();
            int tamanho = resposta.Capacity;

            var ret = AcbrLibMDFeNative.MDFE_Consultar(chave, true, resposta, ref tamanho);

            if (!AcbrLibMDFeNative.IsSuccess(ret))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroConsulta,
                    $"Erro ao consultar: {erro}");
            }

            var consulta = AcbrIniResponseParser.ParseConsulta(resposta.ToString());

            return ProviderResult<object>.Ok(new
            {
                consulta.Sucesso,
                consulta.CodigoStatus,
                consulta.MotivoStatus,
                consulta.Protocolo,
                consulta.ChaveMDFe,
                consulta.DataAutorizacao
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AcbrLibMDFe] Erro ao consultar chave {Chave}", chave);
            return ProviderResult<object>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    public async Task<ProviderResult<object>> ConsultarReciboAsync(string recibo)
    {
        try
        {
            VerificarInicializacao();

            _logger.LogInformation("[AcbrLibMDFe] Consultando recibo: {Recibo}", recibo);

            var resposta = AcbrLibMDFeNative.CreateResponseBuffer();
            int tamanho = resposta.Capacity;

            var ret = AcbrLibMDFeNative.MDFE_ConsultarRecibo(recibo, resposta, ref tamanho);

            if (!AcbrLibMDFeNative.IsSuccess(ret))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroConsulta,
                    $"Erro ao consultar recibo: {erro}");
            }

            var consulta = AcbrIniResponseParser.ParseConsulta(resposta.ToString());

            return ProviderResult<object>.Ok(new
            {
                consulta.Sucesso,
                consulta.CodigoStatus,
                consulta.MotivoStatus,
                consulta.Protocolo
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AcbrLibMDFe] Erro ao consultar recibo {Recibo}", recibo);
            return ProviderResult<object>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    public Task<ProviderResult<object>> ConsultarProtocoloAsync(string chave, string protocolo)
    {
        // Usar ConsultarPorChaveAsync
        return ConsultarPorChaveAsync(chave);
    }

    public async Task<ProviderResult<MdfeStatusInfo>> ObterStatusAsync()
    {
        try
        {
            VerificarInicializacao();

            _logger.LogInformation("[AcbrLibMDFe] Consultando status do serviço");

            var resposta = AcbrLibMDFeNative.CreateResponseBuffer();
            int tamanho = resposta.Capacity;

            var ret = AcbrLibMDFeNative.MDFE_StatusServico(resposta, ref tamanho);

            if (!AcbrLibMDFeNative.IsSuccess(ret))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<MdfeStatusInfo>.Falha(ProviderErrorCode.ErroConsulta,
                    $"Erro ao consultar status: {erro}");
            }

            var status = AcbrIniResponseParser.ParseStatusServico(resposta.ToString());

            var info = new MdfeStatusInfo(
                Ambiente: status.Ambiente == "1" ? "Produção" : "Homologação",
                VersaoBiblioteca: ObterVersao(),
                StatusServico: status.Sucesso ? "Em Operação" : "Fora do Ar",
                Timestamp: DateTime.Parse(status.DataHora ?? DateTime.Now.ToString()),
                Implementacao: "ACBrLibMDFe",
                Extras: new Dictionary<string, string>
                {
                    { "cStat", status.CodigoStatus ?? "" },
                    { "xMotivo", status.MotivoStatus ?? "" },
                    { "UF", status.UF ?? "" },
                    { "verAplic", status.VersaoAplicativo ?? "" }
                }
            );

            return ProviderResult<MdfeStatusInfo>.Ok(info);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AcbrLibMDFe] Erro ao obter status");
            return ProviderResult<MdfeStatusInfo>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    #endregion

    #region Eventos

    public async Task<ProviderResult<object>> CancelarAsync(string chave, string justificativa)
    {
        try
        {
            VerificarInicializacao();

            _logger.LogInformation("[AcbrLibMDFe] Cancelando MDFe: {Chave}", chave);

            // Buscar MDFe no banco para obter dados
            var mdfe = await _context.MDFes.FirstOrDefaultAsync(m => m.ChaveAcesso == chave);
            if (mdfe == null)
            {
                return ProviderResult<object>.Falha(ProviderErrorCode.NaoEncontrado, "MDFe não encontrado");
            }

            var resposta = AcbrLibMDFeNative.CreateResponseBuffer();
            int tamanho = resposta.Capacity;

            var ret = AcbrLibMDFeNative.MDFE_Cancelar(
                chave,
                justificativa,
                mdfe.EmitenteCnpj,
                1, // Lote
                resposta,
                ref tamanho);

            if (!AcbrLibMDFeNative.IsSuccess(ret))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroEvento,
                    $"Erro ao cancelar: {erro}");
            }

            var evento = AcbrIniResponseParser.ParseEvento(resposta.ToString());

            if (evento.Sucesso)
            {
                mdfe.Cancelado = true;
                mdfe.DataCancelamento = DateTime.Now;
                mdfe.RegistrarStatus("CANCELADO", $"Justificativa: {justificativa}");
                await _context.SaveChangesAsync();
            }

            return ProviderResult<object>.Ok(new
            {
                evento.Sucesso,
                evento.CodigoStatus,
                evento.MotivoStatus,
                evento.ProtocoloEvento
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AcbrLibMDFe] Erro ao cancelar MDFe {Chave}", chave);
            return ProviderResult<object>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    public async Task<ProviderResult<object>> EncerrarAsync(string chave, string municipioEncerramento, DateTime dataEncerramento)
    {
        try
        {
            VerificarInicializacao();

            _logger.LogInformation("[AcbrLibMDFe] Encerrando MDFe: {Chave}", chave);

            // Buscar código IBGE do município
            var municipio = await _context.Municipios
                .FirstOrDefaultAsync(m => m.Nome == municipioEncerramento);

            if (municipio == null)
            {
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroValidacao,
                    "Município de encerramento não encontrado");
            }

            var resposta = AcbrLibMDFeNative.CreateResponseBuffer();
            int tamanho = resposta.Capacity;

            var ret = AcbrLibMDFeNative.MDFE_EncerrarMDFe(
                chave,
                dataEncerramento.ToString("yyyy-MM-ddTHH:mm:ss"),
                municipio.Uf,
                municipio.Codigo.ToString(),
                resposta,
                ref tamanho);

            if (!AcbrLibMDFeNative.IsSuccess(ret))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroEvento,
                    $"Erro ao encerrar: {erro}");
            }

            var evento = AcbrIniResponseParser.ParseEvento(resposta.ToString());

            if (evento.Sucesso)
            {
                var mdfe = await _context.MDFes.FirstOrDefaultAsync(m => m.ChaveAcesso == chave);
                if (mdfe != null)
                {
                    mdfe.Encerrado = true;
                    mdfe.DataEncerramento = dataEncerramento;
                    mdfe.RegistrarStatus("ENCERRADO", $"Município: {municipioEncerramento}");
                    await _context.SaveChangesAsync();
                }
            }

            return ProviderResult<object>.Ok(new
            {
                evento.Sucesso,
                evento.CodigoStatus,
                evento.MotivoStatus,
                evento.ProtocoloEvento
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AcbrLibMDFe] Erro ao encerrar MDFe {Chave}", chave);
            return ProviderResult<object>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    #endregion

    #region PDF

    public async Task<ProviderResult<byte[]>> GerarPdfAsync(string chave)
    {
        try
        {
            VerificarInicializacao();

            _logger.LogInformation("[AcbrLibMDFe] Gerando PDF para chave: {Chave}", chave);

            // 1. Consultar MDFe para carregar na biblioteca
            var consultaResp = AcbrLibMDFeNative.CreateResponseBuffer();
            int consultaTam = consultaResp.Capacity;
            AcbrLibMDFeNative.MDFE_Consultar(chave, false, consultaResp, ref consultaTam);

            // 2. Gerar PDF
            var ret = AcbrLibMDFeNative.MDFE_ImprimirPDF();

            if (!AcbrLibMDFeNative.IsSuccess(ret))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<byte[]>.Falha(ProviderErrorCode.ErroPdf,
                    $"Erro ao gerar PDF: {erro}");
            }

            // 3. Obter path do PDF gerado
            var pathResp = AcbrLibMDFeNative.CreateResponseBuffer();
            int pathTam = pathResp.Capacity;
            AcbrLibMDFeNative.MDFE_SalvarPDF(pathResp, ref pathTam);

            var pdfPath = pathResp.ToString();

            if (File.Exists(pdfPath))
            {
                var bytes = await File.ReadAllBytesAsync(pdfPath);
                return ProviderResult<byte[]>.Ok(bytes);
            }

            return ProviderResult<byte[]>.Falha(ProviderErrorCode.ErroPdf, "PDF não foi gerado");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AcbrLibMDFe] Erro ao gerar PDF {Chave}", chave);
            return ProviderResult<byte[]>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    #endregion

    #region Geração de XML e Chave

    public async Task<ProviderResult<string>> GerarXmlAsync(int mdfeId)
    {
        try
        {
            var mdfe = await _context.MDFes.FindAsync(mdfeId);
            if (mdfe?.XmlAutorizado != null)
            {
                return ProviderResult<string>.Ok(mdfe.XmlAutorizado);
            }

            return ProviderResult<string>.Falha(ProviderErrorCode.NaoEncontrado,
                "XML não disponível. Transmita o MDFe primeiro.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AcbrLibMDFe] Erro ao obter XML {Id}", mdfeId);
            return ProviderResult<string>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    public Task<ProviderResult<string>> GerarChaveAsync(int cUF, int ano, int mes, string cnpj, int serie, int numero, int tpEmis, string cNF)
    {
        try
        {
            var buffer = AcbrLibMDFeNative.CreateResponseBuffer();
            int tamanho = buffer.Capacity;

            var emissao = $"{ano:D2}{mes:D2}";

            var ret = AcbrLibMDFeNative.MDFE_GerarChave(
                cUF,
                int.Parse(cNF),
                58, // Modelo 58 = MDFe
                serie,
                numero,
                tpEmis,
                emissao,
                cnpj,
                buffer,
                ref tamanho);

            if (AcbrLibMDFeNative.IsSuccess(ret))
            {
                return Task.FromResult(ProviderResult<string>.Ok(buffer.ToString()));
            }

            return Task.FromResult(ProviderResult<string>.Falha(ProviderErrorCode.ErroInterno,
                "Erro ao gerar chave"));
        }
        catch (Exception ex)
        {
            return Task.FromResult(ProviderResult<string>.Falha(ProviderErrorCode.ErroInterno, ex.Message));
        }
    }

    #endregion

    #region Distribuição DFe

    public async Task<ProviderResult<object>> DistribuicaoPorNSUAsync(string uf, string cnpjOuCpf, string nsu)
    {
        try
        {
            VerificarInicializacao();

            var resposta = AcbrLibMDFeNative.CreateResponseBuffer();
            int tamanho = resposta.Capacity;

            var cUF = ObterCodigoUF(uf);
            var ret = AcbrLibMDFeNative.MDFE_DistribuicaoDFePorNSU(cUF, cnpjOuCpf, nsu, resposta, ref tamanho);

            if (!AcbrLibMDFeNative.IsSuccess(ret))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroDistribuicao, erro);
            }

            var dist = AcbrIniResponseParser.ParseDistribuicao(resposta.ToString());
            return ProviderResult<object>.Ok(dist);
        }
        catch (Exception ex)
        {
            return ProviderResult<object>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    public async Task<ProviderResult<object>> DistribuicaoPorUltNSUAsync(string uf, string cnpjOuCpf, string ultNsu)
    {
        try
        {
            VerificarInicializacao();

            var resposta = AcbrLibMDFeNative.CreateResponseBuffer();
            int tamanho = resposta.Capacity;

            var cUF = ObterCodigoUF(uf);
            var ret = AcbrLibMDFeNative.MDFE_DistribuicaoDFePorUltNSU(cUF, cnpjOuCpf, ultNsu, resposta, ref tamanho);

            if (!AcbrLibMDFeNative.IsSuccess(ret))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroDistribuicao, erro);
            }

            var dist = AcbrIniResponseParser.ParseDistribuicao(resposta.ToString());
            return ProviderResult<object>.Ok(dist);
        }
        catch (Exception ex)
        {
            return ProviderResult<object>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    public async Task<ProviderResult<object>> DistribuicaoPorChaveAsync(string uf, string cnpjOuCpf, string chave)
    {
        try
        {
            VerificarInicializacao();

            var resposta = AcbrLibMDFeNative.CreateResponseBuffer();
            int tamanho = resposta.Capacity;

            var cUF = ObterCodigoUF(uf);
            var ret = AcbrLibMDFeNative.MDFE_DistribuicaoDFePorChave(cUF, cnpjOuCpf, chave, resposta, ref tamanho);

            if (!AcbrLibMDFeNative.IsSuccess(ret))
            {
                var erro = ObterUltimoErro();
                return ProviderResult<object>.Falha(ProviderErrorCode.ErroDistribuicao, erro);
            }

            var dist = AcbrIniResponseParser.ParseDistribuicao(resposta.ToString());
            return ProviderResult<object>.Ok(dist);
        }
        catch (Exception ex)
        {
            return ProviderResult<object>.Falha(ProviderErrorCode.ErroInterno, ex.Message);
        }
    }

    #endregion

    #region Helpers

    private void VerificarInicializacao()
    {
        if (!_initialized)
        {
            throw new InvalidOperationException("ACBrLibMDFe não foi inicializada");
        }
    }

    private int ObterCodigoUF(string uf)
    {
        var codigos = new Dictionary<string, int>
        {
            {"AC", 12}, {"AL", 27}, {"AP", 16}, {"AM", 13}, {"BA", 29},
            {"CE", 23}, {"DF", 53}, {"ES", 32}, {"GO", 52}, {"MA", 21},
            {"MT", 51}, {"MS", 50}, {"MG", 31}, {"PA", 15}, {"PB", 25},
            {"PR", 41}, {"PE", 26}, {"PI", 22}, {"RJ", 33}, {"RN", 24},
            {"RS", 43}, {"RO", 11}, {"RR", 14}, {"SC", 42}, {"SP", 35},
            {"SE", 28}, {"TO", 17}
        };

        return codigos.TryGetValue(uf.ToUpper(), out var codigo) ? codigo : 0;
    }

    #endregion

    #region IDisposable

    public void Dispose()
    {
        if (_disposed) return;

        try
        {
            // Não finalizamos a biblioteca nativa aqui pois ela é compartilhada globalmente
            // A finalização acontecerá apenas no shutdown da aplicação
            if (_initialized && _nativeLibraryLoaded)
            {
                _logger.LogInformation("[AcbrLibMDFe] Liberando instância (biblioteca global permanece ativa)");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AcbrLibMDFe] Erro geral ao finalizar biblioteca");
        }
        finally
        {
            _disposed = true;
            _initialized = false;
        }
    }

    #endregion
}
