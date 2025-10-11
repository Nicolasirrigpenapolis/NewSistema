using System.Data.Common;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.DTOs;
using Backend.Api.Tenancia;

namespace Backend.Api.Controllers;

[ApiController]
[Route("api/configuracoes/empresa")]
public class ConfiguracoesEmpresaController : ControllerBase
{
    private readonly IContextoEmpresa _contextoEmpresa;
    private readonly SistemaContext _contextoDados;

    public ConfiguracoesEmpresaController(IContextoEmpresa contextoEmpresa, SistemaContext contextoDados)
    {
        _contextoEmpresa = contextoEmpresa;
        _contextoDados = contextoDados;
    }

    [HttpGet]
    public async Task<ActionResult<EmpresaConfiguracaoDto>> ObterConfiguracao()
    {
        var emitente = await _contextoDados.Emitentes
            .AsNoTracking()
            .FirstOrDefaultAsync();

        var pastaLogos = Path.Combine(_contextoEmpresa.Armazenamento.CaminhoBase, _contextoEmpresa.Armazenamento.PastaLogos);
        string? urlLogotipo = null;
        string? nomeArquivo = emitente?.CaminhoLogotipo;
        if (!string.IsNullOrWhiteSpace(nomeArquivo))
        {
            var caminhoFisico = Path.Combine(pastaLogos, nomeArquivo);
            if (System.IO.File.Exists(caminhoFisico))
            {
                var versao = System.IO.File.GetLastWriteTimeUtc(caminhoFisico).ToString("yyyyMMddHHmmss");
                urlLogotipo = $"/api/emitentes/logotipo?v={versao}";
            }
        }

        var dto = new EmpresaConfiguracaoDto
        {
            Identificador = _contextoEmpresa.IdentificadorEmpresa,
            NomeExibicao = _contextoEmpresa.NomeExibicao,
            BancoDados = ObterNomeBanco(_contextoEmpresa.StringConexao),
            EmitenteConfigurado = emitente != null,
            CaminhoLogotipo = emitente?.CaminhoLogotipo,
            UrlLogotipo = urlLogotipo,
            CaminhoBaseArmazenamento = _contextoEmpresa.Armazenamento.CaminhoBase,
            PastaXml = _contextoEmpresa.Armazenamento.PastaXml,
            PastaCertificados = _contextoEmpresa.Armazenamento.PastaCertificados,
            PastaLogos = _contextoEmpresa.Armazenamento.PastaLogos,
            DataConsulta = DateTime.UtcNow
        };

        return Ok(dto);
    }

    private static string ObterNomeBanco(string connectionString)
    {
        try
        {
            var builder = new DbConnectionStringBuilder
            {
                ConnectionString = connectionString
            };

            if (builder.TryGetValue("Initial Catalog", out var catalogo) && catalogo is not null)
            {
                return catalogo.ToString() ?? string.Empty;
            }

            if (builder.TryGetValue("Database", out var database) && database is not null)
            {
                return database.ToString() ?? string.Empty;
            }
        }
        catch
        {
            // Ignorar falha de parse e retornar string vazia
        }

        return string.Empty;
    }
}
