using System.Text.RegularExpressions;

namespace Backend.Api.Providers.MDFe;

/// <summary>
/// Parser de respostas INI retornadas pela ACBrLibMDFe
/// Baseado nas respostas de transmissão, eventos e distribuição
/// </summary>
public class AcbrIniResponseParser
{
    /// <summary>
    /// Parse resposta de transmissão (MDFE_Enviar)
    /// Seções: [Envio], [Retorno], [MDFE001]
    /// </summary>
    public static TransmissaoResponse ParseTransmissao(string iniResposta)
    {
        var sections = ParseIniSections(iniResposta);
        var response = new TransmissaoResponse();

        // [Envio]
        if (sections.TryGetValue("Envio", out var envio))
        {
            response.NumeroLote = envio.GetValueOrDefault("Lote");
            response.VersaoAplicativo = envio.GetValueOrDefault("VersaoAplicativo");
        }

        // [Retorno]
        if (sections.TryGetValue("Retorno", out var retorno))
        {
            response.CodigoStatus = retorno.GetValueOrDefault("cStat");
            response.MotivoStatus = retorno.GetValueOrDefault("xMotivo");
            response.Protocolo = retorno.GetValueOrDefault("nProt");
            response.DataRecebimento = retorno.GetValueOrDefault("dhRecbto");
            response.NumeroRecibo = retorno.GetValueOrDefault("nRec");
        }

        // [MDFE001] - primeiro MDFe da resposta
        if (sections.TryGetValue("MDFE001", out var mdfe))
        {
            response.ChaveMDFe = mdfe.GetValueOrDefault("chMDFe");
            response.XmlAutorizado = mdfe.GetValueOrDefault("XML");
        }

        response.Sucesso = response.CodigoStatus == "100"; // 100 = Autorizado
        response.RawIni = iniResposta;

        return response;
    }

    /// <summary>
    /// Parse resposta de consulta (MDFE_Consultar)
    /// </summary>
    public static ConsultaResponse ParseConsulta(string iniResposta)
    {
        var sections = ParseIniSections(iniResposta);
        var response = new ConsultaResponse();

        if (sections.TryGetValue("Retorno", out var retorno))
        {
            response.CodigoStatus = retorno.GetValueOrDefault("cStat");
            response.MotivoStatus = retorno.GetValueOrDefault("xMotivo");
            response.Protocolo = retorno.GetValueOrDefault("nProt");
            response.ChaveMDFe = retorno.GetValueOrDefault("chMDFe");
            response.DataAutorizacao = retorno.GetValueOrDefault("dhRecbto");
        }

        response.Sucesso = response.CodigoStatus == "100";
        response.RawIni = iniResposta;

        return response;
    }

    /// <summary>
    /// Parse resposta de evento (MDFE_EnviarEvento, cancelamento, encerramento)
    /// </summary>
    public static EventoResponse ParseEvento(string iniResposta)
    {
        var sections = ParseIniSections(iniResposta);
        var response = new EventoResponse();

        if (sections.TryGetValue("Retorno", out var retorno))
        {
            response.CodigoStatus = retorno.GetValueOrDefault("cStat");
            response.MotivoStatus = retorno.GetValueOrDefault("xMotivo");
            response.ProtocoloEvento = retorno.GetValueOrDefault("nProt");
            response.ChaveMDFe = retorno.GetValueOrDefault("chMDFe");
            response.TipoEvento = retorno.GetValueOrDefault("tpEvento");
            response.DataRegistro = retorno.GetValueOrDefault("dhRegEvento");
        }

        if (sections.TryGetValue("EVENTO001", out var evento))
        {
            response.XmlEvento = evento.GetValueOrDefault("XML");
        }

        response.Sucesso = response.CodigoStatus == "135" || response.CodigoStatus == "136"; // 135=Evento registrado
        response.RawIni = iniResposta;

        return response;
    }

    /// <summary>
    /// Parse resposta de status do serviço (MDFE_StatusServico)
    /// </summary>
    public static StatusServicoResponse ParseStatusServico(string iniResposta)
    {
        var sections = ParseIniSections(iniResposta);
        var response = new StatusServicoResponse();

        if (sections.TryGetValue("Retorno", out var retorno))
        {
            response.CodigoStatus = retorno.GetValueOrDefault("cStat");
            response.MotivoStatus = retorno.GetValueOrDefault("xMotivo");
            response.UF = retorno.GetValueOrDefault("cUF");
            response.Ambiente = retorno.GetValueOrDefault("tpAmb");
            response.VersaoAplicativo = retorno.GetValueOrDefault("verAplic");
            response.DataHora = retorno.GetValueOrDefault("dhRecbto");
        }

        response.Sucesso = response.CodigoStatus == "107"; // 107=Serviço em operação
        response.RawIni = iniResposta;

        return response;
    }

    /// <summary>
    /// Parse resposta de distribuição DFe
    /// </summary>
    public static DistribuicaoResponse ParseDistribuicao(string iniResposta)
    {
        var sections = ParseIniSections(iniResposta);
        var response = new DistribuicaoResponse();

        if (sections.TryGetValue("DISTRIBUICAODFE", out var dist))
        {
            response.CodigoStatus = dist.GetValueOrDefault("cStat");
            response.MotivoStatus = dist.GetValueOrDefault("xMotivo");
            response.UltimoNSU = dist.GetValueOrDefault("ultNSU");
            response.MaxNSU = dist.GetValueOrDefault("maxNSU");
            response.Ambiente = dist.GetValueOrDefault("tpAmb");
        }

        response.Sucesso = response.CodigoStatus == "138"; // 138=Documentos localizados
        response.RawIni = iniResposta;

        return response;
    }

    /// <summary>
    /// Parse sections INI genérico (formato [SECTION]\nkey=value)
    /// </summary>
    private static Dictionary<string, Dictionary<string, string>> ParseIniSections(string iniContent)
    {
        var sections = new Dictionary<string, Dictionary<string, string>>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(iniContent))
            return sections;

        var currentSection = "";
        var currentDict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        var lines = iniContent.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);

        foreach (var line in lines)
        {
            var trimmed = line.Trim();

            // Linha vazia
            if (string.IsNullOrWhiteSpace(trimmed))
                continue;

            // Seção [NOME]
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                // Salvar seção anterior
                if (!string.IsNullOrEmpty(currentSection))
                {
                    sections[currentSection] = currentDict;
                }

                // Nova seção
                currentSection = trimmed[1..^1];
                currentDict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                continue;
            }

            // Key=Value
            var eqIndex = trimmed.IndexOf('=');
            if (eqIndex > 0)
            {
                var key = trimmed[..eqIndex].Trim();
                var value = trimmed[(eqIndex + 1)..].Trim();
                currentDict[key] = value;
            }
        }

        // Salvar última seção
        if (!string.IsNullOrEmpty(currentSection))
        {
            sections[currentSection] = currentDict;
        }

        return sections;
    }
}

// === Response Models ===

public record TransmissaoResponse
{
    public bool Sucesso { get; set; }
    public string? NumeroLote { get; set; }
    public string? CodigoStatus { get; set; }
    public string? MotivoStatus { get; set; }
    public string? Protocolo { get; set; }
    public string? NumeroRecibo { get; set; }
    public string? DataRecebimento { get; set; }
    public string? ChaveMDFe { get; set; }
    public string? XmlAutorizado { get; set; }
    public string? VersaoAplicativo { get; set; }
    public string? RawIni { get; set; }
}

public record ConsultaResponse
{
    public bool Sucesso { get; set; }
    public string? CodigoStatus { get; set; }
    public string? MotivoStatus { get; set; }
    public string? Protocolo { get; set; }
    public string? ChaveMDFe { get; set; }
    public string? DataAutorizacao { get; set; }
    public string? RawIni { get; set; }
}

public record EventoResponse
{
    public bool Sucesso { get; set; }
    public string? CodigoStatus { get; set; }
    public string? MotivoStatus { get; set; }
    public string? ProtocoloEvento { get; set; }
    public string? ChaveMDFe { get; set; }
    public string? TipoEvento { get; set; }
    public string? DataRegistro { get; set; }
    public string? XmlEvento { get; set; }
    public string? RawIni { get; set; }
}

public record StatusServicoResponse
{
    public bool Sucesso { get; set; }
    public string? CodigoStatus { get; set; }
    public string? MotivoStatus { get; set; }
    public string? UF { get; set; }
    public string? Ambiente { get; set; }
    public string? VersaoAplicativo { get; set; }
    public string? DataHora { get; set; }
    public string? RawIni { get; set; }
}

public record DistribuicaoResponse
{
    public bool Sucesso { get; set; }
    public string? CodigoStatus { get; set; }
    public string? MotivoStatus { get; set; }
    public string? UltimoNSU { get; set; }
    public string? MaxNSU { get; set; }
    public string? Ambiente { get; set; }
    public string? RawIni { get; set; }
}

// Extension helper
internal static class DictionaryExtensions
{
    public static string? GetValueOrDefault(this Dictionary<string, string> dict, string key)
    {
        return dict.TryGetValue(key, out var value) ? value : null;
    }
}
