using Backend.Api.Models;
using System.Text;

namespace Backend.Api.Services.Ini;

/// <summary>
/// Gerador de arquivos INI para eventos do MDFe
/// Baseado nos PDFs: Cancelamento.pdf (40), Inclusão de Condutor.pdf (43), Inclusão de DF-e.pdf (44)
/// </summary>
public class MDFeEventoIniGenerator
{
    /// <summary>
    /// Gera INI para evento de cancelamento (tpEvento=110111)
    /// PDF 40: Cancelamento.pdf
    /// </summary>
    public static string GerarIniCancelamento(MDFe mdfe, string justificativa, string protocolo)
    {
        var sb = new StringBuilder();

        sb.AppendLine("[EVENTO]");
        sb.AppendLine("idLote=1");
        sb.AppendLine();

        sb.AppendLine("[EVENTO001]");
        sb.AppendLine($"cOrgao={ObterCodigoUF(mdfe.EmitenteUf)}");
        sb.AppendLine($"CNPJCPF={mdfe.EmitenteCnpj}");
        sb.AppendLine($"chMDFe={mdfe.ChaveAcesso}");
        sb.AppendLine($"dhEvento={DateTime.Now:yyyy-MM-ddTHH:mm:sszzz}");
        sb.AppendLine("tpEvento=110111"); // Cancelamento
        sb.AppendLine("nSeqEvento=1");
        sb.AppendLine("versaoEvento=3.00");
        sb.AppendLine($"nProt={protocolo}");
        sb.AppendLine($"xJust={justificativa}");
        sb.AppendLine();

        return sb.ToString();
    }

    /// <summary>
    /// Gera INI para evento de encerramento (tpEvento=110112)
    /// </summary>
    public static string GerarIniEncerramento(MDFe mdfe, string codigoMunicipio, DateTime dataEncerramento)
    {
        var sb = new StringBuilder();

        sb.AppendLine("[EVENTO]");
        sb.AppendLine("idLote=1");
        sb.AppendLine();

        sb.AppendLine("[EVENTO001]");
        sb.AppendLine($"cOrgao={ObterCodigoUF(mdfe.EmitenteUf)}");
        sb.AppendLine($"CNPJCPF={mdfe.EmitenteCnpj}");
        sb.AppendLine($"chMDFe={mdfe.ChaveAcesso}");
        sb.AppendLine($"dhEvento={DateTime.Now:yyyy-MM-ddTHH:mm:sszzz}");
        sb.AppendLine("tpEvento=110112"); // Encerramento
        sb.AppendLine("nSeqEvento=1");
        sb.AppendLine("versaoEvento=3.00");
        sb.AppendLine($"nProt={mdfe.Protocolo}");
        sb.AppendLine($"dtEnc={dataEncerramento:yyyy-MM-dd}");
        sb.AppendLine($"cUF={ObterCodigoUF(mdfe.EmitenteUf)}");
        sb.AppendLine($"cMun={codigoMunicipio}");
        sb.AppendLine();

        return sb.ToString();
    }

    /// <summary>
    /// Gera INI para inclusão de condutor (tpEvento=110114)
    /// PDF 43: Inclusão de Condutor.pdf
    /// </summary>
    public static string GerarIniInclusaoCondutor(MDFe mdfe, string nomeCondutor, string cpfCondutor)
    {
        var sb = new StringBuilder();

        sb.AppendLine("[EVENTO]");
        sb.AppendLine("idLote=1");
        sb.AppendLine();

        sb.AppendLine("[EVENTO001]");
        sb.AppendLine($"cOrgao={ObterCodigoUF(mdfe.EmitenteUf)}");
        sb.AppendLine($"CNPJCPF={mdfe.EmitenteCnpj}");
        sb.AppendLine($"chMDFe={mdfe.ChaveAcesso}");
        sb.AppendLine($"dhEvento={DateTime.Now:yyyy-MM-ddTHH:mm:sszzz}");
        sb.AppendLine("tpEvento=110114"); // Inclusão de Condutor
        sb.AppendLine("nSeqEvento=1");
        sb.AppendLine("versaoEvento=3.00");
        sb.AppendLine($"xNome={nomeCondutor}");
        sb.AppendLine($"CPF={cpfCondutor.Replace(".", "").Replace("-", "")}");
        sb.AppendLine();

        return sb.ToString();
    }

    /// <summary>
    /// Gera INI para inclusão de DF-e (tpEvento=110115)
    /// PDF 44: Inclusão de DF-e.pdf
    /// </summary>
    public static string GerarIniInclusaoDFe(MDFe mdfe, string codigoMunicipioDescarga, string chaveDFe, string tipoDocumento = "NFe")
    {
        var sb = new StringBuilder();

        sb.AppendLine("[EVENTO]");
        sb.AppendLine("idLote=1");
        sb.AppendLine();

        sb.AppendLine("[EVENTO001]");
        sb.AppendLine($"cOrgao={ObterCodigoUF(mdfe.EmitenteUf)}");
        sb.AppendLine($"CNPJCPF={mdfe.EmitenteCnpj}");
        sb.AppendLine($"chMDFe={mdfe.ChaveAcesso}");
        sb.AppendLine($"dhEvento={DateTime.Now:yyyy-MM-ddTHH:mm:sszzz}");
        sb.AppendLine("tpEvento=110115"); // Inclusão de DF-e
        sb.AppendLine("nSeqEvento=1");
        sb.AppendLine("versaoEvento=3.00");
        sb.AppendLine($"nProt={mdfe.Protocolo}");
        sb.AppendLine($"cMunDescarga={codigoMunicipioDescarga}");

        // Adicionar documento (NFe ou CTe)
        if (tipoDocumento.ToUpper() == "NFE")
        {
            sb.AppendLine($"chNFe={chaveDFe}");
        }
        else if (tipoDocumento.ToUpper() == "CTE")
        {
            sb.AppendLine($"chCTe={chaveDFe}");
        }

        sb.AppendLine();

        return sb.ToString();
    }

    /// <summary>
    /// Gera INI para evento genérico
    /// </summary>
    public static string GerarIniEventoGenerico(MDFe mdfe, string tipoEvento, Dictionary<string, string> campos)
    {
        var sb = new StringBuilder();

        sb.AppendLine("[EVENTO]");
        sb.AppendLine("idLote=1");
        sb.AppendLine();

        sb.AppendLine("[EVENTO001]");
        sb.AppendLine($"cOrgao={ObterCodigoUF(mdfe.EmitenteUf)}");
        sb.AppendLine($"CNPJCPF={mdfe.EmitenteCnpj}");
        sb.AppendLine($"chMDFe={mdfe.ChaveAcesso}");
        sb.AppendLine($"dhEvento={DateTime.Now:yyyy-MM-ddTHH:mm:sszzz}");
        sb.AppendLine($"tpEvento={tipoEvento}");
        sb.AppendLine("nSeqEvento=1");
        sb.AppendLine("versaoEvento=3.00");

        // Adicionar campos customizados
        foreach (var campo in campos)
        {
            sb.AppendLine($"{campo.Key}={campo.Value}");
        }

        sb.AppendLine();

        return sb.ToString();
    }

    #region Helpers

    private static string ObterCodigoUF(string uf)
    {
        var codigos = new Dictionary<string, string>
        {
            {"AC", "12"}, {"AL", "27"}, {"AP", "16"}, {"AM", "13"}, {"BA", "29"},
            {"CE", "23"}, {"DF", "53"}, {"ES", "32"}, {"GO", "52"}, {"MA", "21"},
            {"MT", "51"}, {"MS", "50"}, {"MG", "31"}, {"PA", "15"}, {"PB", "25"},
            {"PR", "41"}, {"PE", "26"}, {"PI", "22"}, {"RJ", "33"}, {"RN", "24"},
            {"RS", "43"}, {"RO", "11"}, {"RR", "14"}, {"SC", "42"}, {"SP", "35"},
            {"SE", "28"}, {"TO", "17"}
        };

        return codigos.TryGetValue(uf.ToUpper(), out var codigo) ? codigo : "35";
    }

    #endregion
}
