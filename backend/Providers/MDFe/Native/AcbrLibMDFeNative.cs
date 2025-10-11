using System.Runtime.InteropServices;
using System.Text;

namespace Backend.Api.Providers.MDFe.Native;

/// <summary>
/// Declarações P/Invoke para ACBrLibMDFe DLL nativa
/// Baseado na documentação oficial ACBrLibMDFe v1.2.2.339
/// </summary>
public static class AcbrLibMDFeNative
{
    // DLL path - usar ACBrMDFe64.dll para aplicações 64-bit com CallingConvention Cdecl
    private const string DllName = "ACBrMDFe64.dll";
    private const CallingConvention Convention = CallingConvention.Cdecl;

    #region Grupo 1: Inicialização e Controle (PDFs 12-16)

    /// <summary>
    /// Inicializa a biblioteca ACBrLibMDFe
    /// PDF 12: MDFE_Inicializar.pdf
    /// </summary>
    /// <param name="eArqConfig">Caminho do arquivo ACBrLib.ini (ou vazio para padrão)</param>
    /// <param name="eChaveCrypt">Chave de criptografia (normalmente vazio)</param>
    /// <returns>0 = sucesso, != 0 = erro</returns>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_Inicializar(
        [MarshalAs(UnmanagedType.LPStr)] string eArqConfig,
        [MarshalAs(UnmanagedType.LPStr)] string eChaveCrypt);

    /// <summary>
    /// Finaliza a biblioteca e libera recursos
    /// PDF 13: MDFE_Finalizar.pdf
    /// </summary>
    /// <returns>0 = sucesso, != 0 = erro</returns>
    [DllImport(DllName, CallingConvention = Convention)]
    public static extern int MDFE_Finalizar();

    /// <summary>
    /// Obtém o nome da biblioteca
    /// PDF 14: MDFE_Nome.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_Nome(
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Obtém a versão da biblioteca
    /// PDF 15: MDFE_Versao.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_Versao(
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Obtém o último retorno da biblioteca (mensagem de erro detalhada)
    /// PDF 16: MDFE_UltimoRetorno.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_UltimoRetorno(
        StringBuilder sResposta,
        ref int esTamanho);

    #endregion

    #region Grupo 2: Configuração (PDFs 05-11)

    /// <summary>
    /// Lê configuração de arquivo INI
    /// PDF 06: MDFE_ConfigLer.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ConfigLer(
        [MarshalAs(UnmanagedType.LPStr)] string eArqConfig);

    /// <summary>
    /// Grava configuração em arquivo INI
    /// PDF 07: MDFE_ConfigGravar.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ConfigGravar(
        [MarshalAs(UnmanagedType.LPStr)] string eArqConfig);

    /// <summary>
    /// Lê um valor específico da configuração
    /// PDF 08: MDFE_ConfigLerValor.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ConfigLerValor(
        [MarshalAs(UnmanagedType.LPStr)] string eSessao,
        [MarshalAs(UnmanagedType.LPStr)] string eChave,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Grava um valor específico na configuração
    /// PDF 09: MDFE_ConfigGravarValor.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ConfigGravarValor(
        [MarshalAs(UnmanagedType.LPStr)] string eSessao,
        [MarshalAs(UnmanagedType.LPStr)] string eChave,
        [MarshalAs(UnmanagedType.LPStr)] string eValor);

    /// <summary>
    /// Importa configuração de string INI
    /// PDF 10: MDFE_ConfigImportar.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ConfigImportar(
        [MarshalAs(UnmanagedType.LPStr)] string eArqConfig);

    /// <summary>
    /// Exporta configuração para string
    /// PDF 11: MDFE_ConfigExportar.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ConfigExportar(
        StringBuilder sResposta,
        ref int esTamanho);

    #endregion

    #region Grupo 3: Manipulação de MDFe (PDFs 20-32)

    /// <summary>
    /// Carrega MDFe de arquivo INI ou string INI
    /// PDF 20: MDFE_CarregarINI.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_CarregarINI(
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoOuINI);

    /// <summary>
    /// Carrega MDFe de arquivo XML
    /// PDF 21: MDFE_CarregarXML.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_CarregarXML(
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoOuXML);

    /// <summary>
    /// Limpa a lista de MDFes carregados
    /// PDF 22: MDFE_LimparLista.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention)]
    public static extern int MDFE_LimparLista();

    /// <summary>
    /// Assina MDFe carregado com certificado digital
    /// PDF 23: MDFE_Assinar.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention)]
    public static extern int MDFE_Assinar();

    /// <summary>
    /// Valida XML do MDFe contra schema XSD
    /// PDF 24: MDFE_Validar.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention)]
    public static extern int MDFE_Validar();

    /// <summary>
    /// Valida regras de negócio do MDFe
    /// PDF 25: MDFE_ValidarRegrasdeNegocios.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ValidarRegrasdeNegocios(
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Verifica se assinatura do MDFe é válida
    /// PDF 26: MDFE_VerificarAssinatura.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_VerificarAssinatura(
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Obtém XML gerado/assinado do MDFe
    /// PDF 27: MDFE_ObterXml.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ObterXml(
        int AIndex,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Grava XML do MDFe em arquivo
    /// PDF 28: MDFE_GravarXml.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_GravarXml(
        int AIndex,
        [MarshalAs(UnmanagedType.LPStr)] string eNomeArquivo,
        [MarshalAs(UnmanagedType.LPStr)] string ePathArquivo);

    /// <summary>
    /// Obtém INI do MDFe carregado
    /// PDF 29: MDFE_ObterIni.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ObterIni(
        int AIndex,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Grava INI do MDFe em arquivo
    /// PDF 30: MDFE_GravarIni.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_GravarIni(
        int AIndex,
        [MarshalAs(UnmanagedType.LPStr)] string eNomeArquivo,
        [MarshalAs(UnmanagedType.LPStr)] string ePathArquivo);

    /// <summary>
    /// Gera chave de acesso do MDFe
    /// PDF 31: MDFE_GerarChave.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_GerarChave(
        int cUF,
        int cNF,
        int modelo,
        int serie,
        int numero,
        int tpEmis,
        [MarshalAs(UnmanagedType.LPStr)] string emissao,
        [MarshalAs(UnmanagedType.LPStr)] string cnpjCpf,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Lista certificados digitais disponíveis
    /// PDF 32: MDFE_ObterCertificados.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ObterCertificados(
        StringBuilder sResposta,
        ref int esTamanho);

    #endregion

    #region Grupo 4: Transmissão e Consultas (PDFs 33-39)

    /// <summary>
    /// Transmite MDFe para SEFAZ
    /// PDF 33: MDFE_Enviar.pdf (CRÍTICO)
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_Enviar(
        int ALote,
        [MarshalAs(UnmanagedType.Bool)] bool AImprimir,
        [MarshalAs(UnmanagedType.Bool)] bool ASincrono,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Consulta MDFe por chave de acesso
    /// PDF 34: MDFE_Consultar.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_Consultar(
        [MarshalAs(UnmanagedType.LPStr)] string eChaveOuArquivo,
        [MarshalAs(UnmanagedType.Bool)] bool AExtrairEventos,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Consulta processamento de MDFe por número de recibo
    /// PDF 35: MDFE_ConsultarRecibo.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ConsultarRecibo(
        [MarshalAs(UnmanagedType.LPStr)] string ARecibo,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Consulta status do serviço SEFAZ
    /// PDF 36: MDFE_StatusServico.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_StatusServico(
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Consulta MDFes não encerrados por CNPJ
    /// PDF 37: MDFE_ConsultaMDFeNaoEnc.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ConsultaMDFeNaoEnc(
        [MarshalAs(UnmanagedType.LPStr)] string ACNPJ,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Obtém path onde XML foi salvo
    /// PDF 38: MDFE_GetPath.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_GetPath(
        int ATipo,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Obtém path onde XML de evento foi salvo
    /// PDF 39: MDFE_GetPathEvento.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_GetPathEvento(
        [MarshalAs(UnmanagedType.LPStr)] string ACodEvento,
        StringBuilder sResposta,
        ref int esTamanho);

    #endregion

    #region Grupo 5: Eventos (PDFs 40-48)

    /// <summary>
    /// Cancela MDFe
    /// PDF 41: MDFE_Cancelar.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_Cancelar(
        [MarshalAs(UnmanagedType.LPStr)] string eChave,
        [MarshalAs(UnmanagedType.LPStr)] string eJustificativa,
        [MarshalAs(UnmanagedType.LPStr)] string eCNPJCPF,
        int ALote,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Encerra MDFe
    /// PDF 42: MDFE_EncerrarMDFe.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_EncerrarMDFe(
        [MarshalAs(UnmanagedType.LPStr)] string eChave,
        [MarshalAs(UnmanagedType.LPStr)] string eDtEnc,
        [MarshalAs(UnmanagedType.LPStr)] string cUF,
        [MarshalAs(UnmanagedType.LPStr)] string cMun,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Envia evento genérico
    /// PDF 45: MDFE_EnviarEvento.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_EnviarEvento(
        int ALote,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Carrega evento de arquivo INI
    /// PDF 46: MDFE_CarregarEventoINI.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_CarregarEventoINI(
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoOuINI);

    /// <summary>
    /// Carrega evento de arquivo XML
    /// PDF 47: MDFE_CarregarEventoXML.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_CarregarEventoXML(
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoOuXML);

    /// <summary>
    /// Limpa lista de eventos
    /// PDF 48: MDFE_LimparListaEventos.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention)]
    public static extern int MDFE_LimparListaEventos();

    #endregion

    #region Grupo 6: Distribuição DFe (PDFs 49-51)

    /// <summary>
    /// Baixa documento por NSU específico
    /// PDF 49: MDFE_DistribuicaoDFePorNSU.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_DistribuicaoDFePorNSU(
        int AcUFAutor,
        [MarshalAs(UnmanagedType.LPStr)] string eCNPJCPF,
        [MarshalAs(UnmanagedType.LPStr)] string eNSU,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Baixa documentos a partir do último NSU
    /// PDF 50: MDFE_DistribuicaoDFePorUltNSU.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_DistribuicaoDFePorUltNSU(
        int AcUFAutor,
        [MarshalAs(UnmanagedType.LPStr)] string eCNPJCPF,
        [MarshalAs(UnmanagedType.LPStr)] string eUltNSU,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Baixa documento por chave de acesso
    /// PDF 51: MDFE_DistribuicaoDFePorChave.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_DistribuicaoDFePorChave(
        int AcUFAutor,
        [MarshalAs(UnmanagedType.LPStr)] string eCNPJCPF,
        [MarshalAs(UnmanagedType.LPStr)] string eChaveNFe,
        StringBuilder sResposta,
        ref int esTamanho);

    #endregion

    #region Grupo 7: Impressão e PDF (PDFs 52-59)

    /// <summary>
    /// Imprime DAMDFe direto na impressora
    /// PDF 52: MDFE_Imprimir.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_Imprimir(
        [MarshalAs(UnmanagedType.LPStr)] string cImpressora,
        int nNumCopias,
        [MarshalAs(UnmanagedType.LPStr)] string cProtocolo,
        [MarshalAs(UnmanagedType.LPStr)] string bMostrarPreview);

    /// <summary>
    /// Gera PDF do DAMDFe
    /// PDF 53: MDFE_ImprimirPDF.pdf (CRÍTICO)
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention)]
    public static extern int MDFE_ImprimirPDF();

    /// <summary>
    /// Salva PDF em arquivo específico
    /// PDF 54: MDFE_SalvarPDF.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_SalvarPDF(
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Imprime evento (cancelamento, encerramento)
    /// PDF 55: MDFE_ImprimirEvento.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ImprimirEvento(
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoXmlMDFe,
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoXmlEvento);

    /// <summary>
    /// Gera PDF de evento
    /// PDF 56: MDFE_ImprimirEventoPDF.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_ImprimirEventoPDF(
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoXmlMDFe,
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoXmlEvento);

    /// <summary>
    /// Salva PDF de evento em arquivo
    /// PDF 57: MDFE_SalvarEventoPDF.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_SalvarEventoPDF(
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoXmlMDFe,
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoXmlEvento,
        StringBuilder sResposta,
        ref int esTamanho);

    /// <summary>
    /// Envia MDFe por email
    /// PDF 58: MDFE_EnviarEmail.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_EnviarEmail(
        [MarshalAs(UnmanagedType.LPStr)] string ePara,
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoXmlMDFe,
        [MarshalAs(UnmanagedType.Bool)] bool AEnviaPDF,
        [MarshalAs(UnmanagedType.LPStr)] string eAssunto,
        [MarshalAs(UnmanagedType.LPStr)] string eCC,
        [MarshalAs(UnmanagedType.LPStr)] string eAnexos,
        [MarshalAs(UnmanagedType.LPStr)] string eMensagem);

    /// <summary>
    /// Envia evento por email
    /// PDF 59: MDFE_EnviarEmailEvento.pdf
    /// </summary>
    [DllImport(DllName, CallingConvention = Convention, CharSet = CharSet.Ansi)]
    public static extern int MDFE_EnviarEmailEvento(
        [MarshalAs(UnmanagedType.LPStr)] string ePara,
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoXmlEvento,
        [MarshalAs(UnmanagedType.LPStr)] string eArquivoXmlMDFe,
        [MarshalAs(UnmanagedType.Bool)] bool AEnviaPDF,
        [MarshalAs(UnmanagedType.LPStr)] string eAssunto,
        [MarshalAs(UnmanagedType.LPStr)] string eCC,
        [MarshalAs(UnmanagedType.LPStr)] string eAnexos,
        [MarshalAs(UnmanagedType.LPStr)] string eMensagem);

    #endregion

    #region Helpers para chamadas P/Invoke

    /// <summary>
    /// Buffer padrão para respostas da DLL (256KB)
    /// </summary>
    public const int BufferSize = 256000;

    /// <summary>
    /// Cria um StringBuilder com tamanho padrão para respostas
    /// </summary>
    public static StringBuilder CreateResponseBuffer()
    {
        return new StringBuilder(BufferSize);
    }

    /// <summary>
    /// Verifica se retorno indica sucesso
    /// </summary>
    public static bool IsSuccess(int returnCode)
    {
        return returnCode == 0;
    }

    #endregion
}
