using Microsoft.Extensions.Configuration;
using System.Text;

namespace Backend.Api.Providers.MDFe;

/// <summary>
/// Gerencia a configuração da ACBrLibMDFe (arquivo ACBrLib.ini)
/// Baseado no PDF 05: "Configurações da Biblioteca.pdf"
/// </summary>
public class AcbrConfigManager
{
    private readonly IConfiguration _configuration;
    private readonly string _configPath;

    public AcbrConfigManager(IConfiguration configuration)
    {
        _configuration = configuration;

        // Path do arquivo de configuração
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        _configPath = Path.Combine(baseDir, "ACBrLib.ini");
    }

    public string ConfigPath => _configPath;

    /// <summary>
    /// Gera arquivo ACBrLib.ini completo com todas as seções necessárias
    /// Seções: [Principal], [MDFe], [DAMDFe], [DFe], [Proxy], [Email]
    /// </summary>
    public void GerarConfiguracao()
    {
        var sb = new StringBuilder();

        // ========== [Principal] ==========
        sb.AppendLine("[Principal]");
        sb.AppendLine($"TipoResposta=1"); // 0=String, 1=Arquivo INI, 2=JSON
        sb.AppendLine($"CodResposta=0"); // 0=UTF8
        sb.AppendLine();

        // ========== [MDFe] ==========
        sb.AppendLine("[MDFe]");

        // Ambiente: 0=Produção, 1=Homologação
        var ambiente = _configuration.GetValue("MDFe:Ambiente", 1); // Default: Homologação
        sb.AppendLine($"Ambiente={ambiente}");

        // Versão do MDFe
        sb.AppendLine($"VersaoDF=3.00");

        // Tipo de Emissão: 1=Normal
        sb.AppendLine($"FormaEmissao=1");

        // Visualizar impressão
        sb.AppendLine($"Visualizar=0");

        // Salvar arquivos
        sb.AppendLine($"SalvarGer=1");
        sb.AppendLine($"SalvarEnv=1");
        sb.AppendLine($"SalvarSoap=1");

        // Paths (usar caminhos absolutos)
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        var pathBase = _configuration.GetValue("MDFe:PathBase", Path.Combine(baseDir, "MDFeFiles"));
        sb.AppendLine($"PathSalvar={pathBase}");
        sb.AppendLine($"PathSchemas={Path.Combine(pathBase, "Schemas")}");
        sb.AppendLine($"PathMDFe={Path.Combine(pathBase, "MDFe")}");
        sb.AppendLine($"PathEvento={Path.Combine(pathBase, "Evento")}");

        // Validação
        sb.AppendLine($"ValidarDigest=1");
        sb.AppendLine();

        // ========== [DAMDFe] ==========
        sb.AppendLine("[DAMDFe]");
        sb.AppendLine($"PathPDF={Path.Combine(pathBase, "PDF")}");
        sb.AppendLine($"TipoDAMDFe=1"); // 0=Retrato, 1=Paisagem
        sb.AppendLine($"TamanhoPapel=0"); // 0=A4
        sb.AppendLine($"Impressora=");
        sb.AppendLine($"NumeroCopias=1");
        sb.AppendLine();

        // ========== [DFe] (Certificado Digital) ==========
        sb.AppendLine("[DFe]");

        // Certificado
        var certPath = _configuration.GetValue<string>("MDFe:Certificado:Path");
        var certSenha = _configuration.GetValue<string>("MDFe:Certificado:Senha");
        var certNumSerie = _configuration.GetValue<string>("MDFe:Certificado:NumeroSerie");

        if (!string.IsNullOrEmpty(certPath))
        {
            // Certificado A1 (arquivo PFX)
            sb.AppendLine($"SSLType=5"); // 5=Certificado A1
            sb.AppendLine($"ArquivoPFX={certPath}");
            sb.AppendLine($"Senha={certSenha}");
        }
        else if (!string.IsNullOrEmpty(certNumSerie))
        {
            // Certificado A3 (repositório do Windows)
            sb.AppendLine($"SSLType=6"); // 6=Certificado A3
            sb.AppendLine($"NumeroSerie={certNumSerie}");
        }
        else
        {
            // Sem certificado configurado (para testes)
            sb.AppendLine($"SSLType=0");
        }

        sb.AppendLine();

        // ========== [Proxy] ==========
        sb.AppendLine("[Proxy]");
        var proxyHost = _configuration.GetValue<string>("MDFe:Proxy:Host");
        if (!string.IsNullOrEmpty(proxyHost))
        {
            sb.AppendLine($"Servidor={proxyHost}");
            sb.AppendLine($"Porta={_configuration.GetValue("MDFe:Proxy:Porta", 8080)}");
            sb.AppendLine($"Usuario={_configuration.GetValue<string>("MDFe:Proxy:Usuario")}");
            sb.AppendLine($"Senha={_configuration.GetValue<string>("MDFe:Proxy:Senha")}");
        }
        else
        {
            sb.AppendLine($"Servidor=");
            sb.AppendLine($"Porta=");
        }
        sb.AppendLine();

        // ========== [Email] ==========
        sb.AppendLine("[Email]");
        var emailHost = _configuration.GetValue<string>("MDFe:Email:Host");
        if (!string.IsNullOrEmpty(emailHost))
        {
            sb.AppendLine($"Nome={_configuration.GetValue<string>("MDFe:Email:NomeRemetente")}");
            sb.AppendLine($"Conta={_configuration.GetValue<string>("MDFe:Email:Conta")}");
            sb.AppendLine($"Usuario={_configuration.GetValue<string>("MDFe:Email:Usuario")}");
            sb.AppendLine($"Senha={_configuration.GetValue<string>("MDFe:Email:Senha")}");
            sb.AppendLine($"Servidor={emailHost}");
            sb.AppendLine($"Porta={_configuration.GetValue("MDFe:Email:Porta", 587)}");
            sb.AppendLine($"SSL={_configuration.GetValue("MDFe:Email:SSL", true)}");
            sb.AppendLine($"TLS={_configuration.GetValue("MDFe:Email:TLS", true)}");
        }
        else
        {
            sb.AppendLine($"Nome=");
            sb.AppendLine($"Conta=");
            sb.AppendLine($"Servidor=");
        }
        sb.AppendLine();

        // Criar diretórios necessários
        CriarDiretorios(pathBase);

        // Salvar arquivo INI
        File.WriteAllText(_configPath, sb.ToString(), Encoding.UTF8);
    }

    /// <summary>
    /// Cria todos os diretórios necessários para armazenamento
    /// </summary>
    private void CriarDiretorios(string pathBase)
    {
        var dirs = new[]
        {
            pathBase,
            Path.Combine(pathBase, "Schemas"),
            Path.Combine(pathBase, "MDFe"),
            Path.Combine(pathBase, "Evento"),
            Path.Combine(pathBase, "PDF")
        };

        foreach (var dir in dirs)
        {
            Directory.CreateDirectory(dir);
        }
    }

    /// <summary>
    /// Copia schemas XSD necessários para validação
    /// </summary>
    public void CopiarSchemas()
    {
        // Schemas devem estar na pasta docs/ACBrLibMDFe-Windows-1.2.2.339/Schemas
        var sourceSchemas = Path.Combine(AppDomain.CurrentDomain.BaseDirectory,
            "..", "..", "..", "docs", "ACBrLibMDFe-Windows-1.2.2.339", "Schemas");

        var pathBase = _configuration.GetValue("MDFe:PathBase",
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "MDFeFiles"));
        var destSchemas = Path.Combine(pathBase, "Schemas");

        if (Directory.Exists(sourceSchemas))
        {
            Directory.CreateDirectory(destSchemas);

            foreach (var file in Directory.GetFiles(sourceSchemas, "*.xsd", SearchOption.AllDirectories))
            {
                var fileName = Path.GetFileName(file);
                var destFile = Path.Combine(destSchemas, fileName);
                File.Copy(file, destFile, overwrite: true);
            }
        }
    }

    /// <summary>
    /// Lê uma configuração específica do INI
    /// </summary>
    public string? LerValor(string secao, string chave)
    {
        if (!File.Exists(_configPath))
            return null;

        var lines = File.ReadAllLines(_configPath);
        string? currentSection = null;

        foreach (var line in lines)
        {
            var trimmed = line.Trim();

            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                currentSection = trimmed[1..^1];
                continue;
            }

            if (currentSection == secao && trimmed.Contains('='))
            {
                var parts = trimmed.Split('=', 2);
                if (parts[0].Trim().Equals(chave, StringComparison.OrdinalIgnoreCase))
                {
                    return parts[1].Trim();
                }
            }
        }

        return null;
    }

    /// <summary>
    /// Grava um valor específico no INI
    /// </summary>
    public void GravarValor(string secao, string chave, string valor)
    {
        if (!File.Exists(_configPath))
        {
            GerarConfiguracao();
        }

        var lines = File.ReadAllLines(_configPath).ToList();
        string? currentSection = null;
        int sectionIndex = -1;
        int keyIndex = -1;

        for (int i = 0; i < lines.Count; i++)
        {
            var trimmed = lines[i].Trim();

            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                currentSection = trimmed[1..^1];
                if (currentSection == secao)
                {
                    sectionIndex = i;
                }
                continue;
            }

            if (currentSection == secao && trimmed.Contains('='))
            {
                var parts = trimmed.Split('=', 2);
                if (parts[0].Trim().Equals(chave, StringComparison.OrdinalIgnoreCase))
                {
                    keyIndex = i;
                    break;
                }
            }
        }

        if (keyIndex >= 0)
        {
            // Atualizar valor existente
            lines[keyIndex] = $"{chave}={valor}";
        }
        else if (sectionIndex >= 0)
        {
            // Adicionar nova chave na seção
            lines.Insert(sectionIndex + 1, $"{chave}={valor}");
        }
        else
        {
            // Adicionar nova seção + chave
            lines.Add($"[{secao}]");
            lines.Add($"{chave}={valor}");
            lines.Add("");
        }

        File.WriteAllLines(_configPath, lines, Encoding.UTF8);
    }
}
