using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Api.Data;
using Backend.Api.Models;
using Backend.Api.DTOs;
using Backend.Api.Interfaces;
using Microsoft.Extensions.Logging;
using Backend.Api.Services.Ini;
using Backend.Api.Providers.MDFe; // novo provider

namespace Backend.Api.Services;

public class MDFeService : IMDFeService
{
    private readonly SistemaContext _context;
    private readonly ILogger<MDFeService> _logger;
    private readonly IMDFeProvider _provider;
    private readonly IMDFeIniGenerator _iniGenerator;
    private readonly IMdfeIniValidator _iniValidator;

    public MDFeService(
        SistemaContext context,
        ILogger<MDFeService> logger,
        IMDFeProvider provider,
        IMDFeIniGenerator iniGenerator,
        IMdfeIniValidator iniValidator)
    {
        _context = context;
        _logger = logger;
        _provider = provider;
        _iniGenerator = iniGenerator;
        _iniValidator = iniValidator;
    }

    public async Task<MDFe> CreateAsync(MDFe mdfe)
    {
        _context.MDFes.Add(mdfe);
        await _context.SaveChangesAsync();
        return mdfe;
    }

    public async Task<MDFe?> GetByIdAsync(int id) =>
        await _context.MDFes.Include(m => m.Emitente).FirstOrDefaultAsync(m => m.Id == id);

    public async Task<IEnumerable<MDFe>> GetByEmitenteAsync(int emitenteId) =>
        await _context.MDFes.Where(m => m.EmitenteId == emitenteId).ToListAsync();

    public async Task<MDFe> UpdateAsync(MDFe mdfe)
    {
        _context.MDFes.Update(mdfe);
        await _context.SaveChangesAsync();
        return mdfe;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var mdfe = await _context.MDFes.FindAsync(id);
        if (mdfe == null) return false;
        _context.MDFes.Remove(mdfe);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> ObterProximoNumeroAsync(int emitenteId, int serie)
    {
        var ultimo = await _context.MDFes.Where(m => m.EmitenteId == emitenteId && m.Serie == serie)
            .OrderByDescending(m => m.NumeroMdfe)
            .Select(m => m.NumeroMdfe)
            .FirstOrDefaultAsync();
        return ultimo + 1;
    }

    public Task<(bool valido, List<string> erros)> ValidarAsync(MDFe mdfe)
    {
        var erros = new List<string>();
        if (mdfe.EmitenteId <= 0) erros.Add("Emitente inválido");
        if (mdfe.NumeroMdfe <= 0) erros.Add("Número inválido");
        return Task.FromResult((erros.Count == 0, erros));
    }

    public async Task<string> GerarXmlAsync(int mdfeId)
    {
        var result = await _provider.GerarXmlAsync(mdfeId);
        if (result.Sucesso && !string.IsNullOrWhiteSpace(result.Dados))
        {
            return result.Dados!;
        }

        if (!result.Sucesso && result.CodigoErro != ProviderErrorCode.NaoEncontrado)
        {
            throw new InvalidOperationException(result.Mensagem ?? "Falha ao obter XML autorizado do MDFe.");
        }

        var mdfe = await GetByIdAsync(mdfeId) ?? throw new KeyNotFoundException("MDFe não encontrado");
        var ini = await _iniGenerator.GerarIniAsync(mdfe);
        _logger.LogInformation("[MDFeService] XML autorizado indisponível para MDFe {Id}; retornando INI gerado para conferência.", mdfeId);
        return ini;
    }

    public async Task<object> TransmitirAsync(int mdfeId)
    {
        var mdfe = await GetByIdAsync(mdfeId) ?? throw new KeyNotFoundException("MDFe não encontrado");

        var ini = await _iniGenerator.GerarIniAsync(mdfe);
        _logger.LogDebug("[MDFeService] INI gerado {Length} chars", ini.Length);

        var resultado = await _provider.TransmitirComIniAsync(mdfeId, ini);
        if (!resultado.Sucesso)
        {
            throw new InvalidOperationException(resultado.Mensagem ?? "Falha ao transmitir MDFe.");
        }

        return resultado.Dados ?? new { sucesso = true };
    }

    public async Task<object> ConsultarProtocoloAsync(int mdfeId, string protocolo)
    {
        var mdfe = await GetByIdAsync(mdfeId) ?? throw new KeyNotFoundException("MDFe não encontrado");
        if (string.IsNullOrWhiteSpace(mdfe.ChaveAcesso)) throw new InvalidOperationException("Chave não definida");
        var prov = await _provider.ConsultarProtocoloAsync(mdfe.ChaveAcesso, protocolo);
        if (!prov.Sucesso) throw new InvalidOperationException($"Falha consultar protocolo: {prov.Mensagem}");
        return prov.Dados!;
    }

    public async Task<object> ConsultarMDFeAsync(int mdfeId)
    {
        var mdfe = await GetByIdAsync(mdfeId) ?? throw new KeyNotFoundException("MDFe não encontrado");
        if (string.IsNullOrWhiteSpace(mdfe.ChaveAcesso)) throw new InvalidOperationException("Chave não definida");
        var prov = await _provider.ConsultarPorChaveAsync(mdfe.ChaveAcesso);
        if (!prov.Sucesso) throw new InvalidOperationException($"Falha consultar MDFe: {prov.Mensagem}");
        return prov.Dados!;
    }

    public async Task<object> CancelarAsync(int mdfeId, string justificativa)
    {
        var mdfe = await GetByIdAsync(mdfeId) ?? throw new KeyNotFoundException("MDFe não encontrado");
        if (string.IsNullOrWhiteSpace(mdfe.ChaveAcesso)) throw new InvalidOperationException("Chave não definida");
        var prov = await _provider.CancelarAsync(mdfe.ChaveAcesso, justificativa);
        if (!prov.Sucesso) throw new InvalidOperationException($"Falha cancelar: {prov.Mensagem}");
        return prov.Dados!;
    }

    public async Task<object> EncerrarAsync(int mdfeId, string? codigoMunicipioEncerramento = null, DateTime? dataEncerramento = null)
    {
        var mdfe = await GetByIdAsync(mdfeId) ?? throw new KeyNotFoundException("MDFe não encontrado");
        if (string.IsNullOrWhiteSpace(mdfe.ChaveAcesso)) throw new InvalidOperationException("Chave não definida");
        if (codigoMunicipioEncerramento == null || dataEncerramento == null) throw new InvalidOperationException("Dados de encerramento incompletos");
        var prov = await _provider.EncerrarAsync(mdfe.ChaveAcesso, codigoMunicipioEncerramento, dataEncerramento.Value);
        if (!prov.Sucesso) throw new InvalidOperationException($"Falha encerrar: {prov.Mensagem}");
        return prov.Dados!;
    }

    public async Task<object> ConsultarStatusServicoAsync(string uf)
    {
        var prov = await _provider.ObterStatusAsync();
        if (!prov.Sucesso) throw new InvalidOperationException($"Falha status: {prov.Mensagem}");
        return prov.Dados!;
    }

    public async Task<object> ConsultarPorChaveAsync(string chave)
    {
        var prov = await _provider.ConsultarPorChaveAsync(chave);
        if (!prov.Sucesso) throw new InvalidOperationException($"Falha consultar chave: {prov.Mensagem}");
        return prov.Dados!;
    }

    public async Task<object> ConsultarReciboAsync(string recibo)
    {
        var prov = await _provider.ConsultarReciboAsync(recibo);
        if (!prov.Sucesso) throw new InvalidOperationException($"Falha consultar recibo: {prov.Mensagem}");
        return prov.Dados!;
    }

    public async Task<byte[]> GerarPDFAsync(int mdfeId)
    {
        var mdfe = await GetByIdAsync(mdfeId) ?? throw new KeyNotFoundException("MDFe não encontrado");
        if (string.IsNullOrWhiteSpace(mdfe.ChaveAcesso)) throw new InvalidOperationException("Chave não definida");
        var prov = await _provider.GerarPdfAsync(mdfe.ChaveAcesso);
        if (!prov.Sucesso) throw new InvalidOperationException($"Falha gerar PDF: {prov.Mensagem}");
        return prov.Dados ?? Array.Empty<byte>();
    }
    public IniComparisonResult CompararIniComModelo(string iniConteudo)
    {
        if (string.IsNullOrWhiteSpace(iniConteudo))
        {
            throw new ArgumentException("Conteúdo INI não informado", nameof(iniConteudo));
        }

        return _iniValidator.CompareWithTemplate(iniConteudo);
    }
    public async Task<string> GerarINIAsync(MDFeGerarINIDto dados)
    {
        if (dados is null)
        {
            throw new ArgumentNullException(nameof(dados));
        }

        if (dados.Id <= 0)
        {
            throw new InvalidOperationException("Informe o identificador do MDFe salvo para gerar o INI.");
        }

        var mdfe = await _context.MDFes
            .Include(m => m.Emitente)
            .Include(m => m.Condutor)
            .Include(m => m.CondutoresAdicionais)
            .Include(m => m.Veiculo)
            .Include(m => m.Contratante)
            .Include(m => m.Seguradora)
            .Include(m => m.Reboques).ThenInclude(r => r.Reboque)
            .Include(m => m.LocaisCarregamento).ThenInclude(l => l.Municipio)
            .Include(m => m.LocaisDescarregamento).ThenInclude(l => l.Municipio)
            .Include(m => m.UfsPercurso)
            .Include(m => m.LacresRodoviarios)
            .Include(m => m.ValesPedagio)
            .Include(m => m.DocumentosNfe)
            .Include(m => m.DocumentosCte)
            .Include(m => m.DocumentosMdfeTransp)
            .Include(m => m.AutorizacoesXml)
            .Include(m => m.ResponsavelTecnico)
            .Include(m => m.UnidadesTransporte).ThenInclude(ut => ut.Lacres)
            .Include(m => m.UnidadesTransporte).ThenInclude(ut => ut.UnidadesCarga).ThenInclude(uc => uc.LacresUnidadeCarga)
            .Include(m => m.UnidadesCarga).ThenInclude(uc => uc.LacresUnidadeCarga)
            .Include(m => m.Pagamentos).ThenInclude(p => p.Componentes)
            .Include(m => m.Pagamentos).ThenInclude(p => p.Prazos)
            .Include(m => m.Pagamentos).ThenInclude(p => p.DadosBancarios)
            .AsSplitQuery()
            .FirstOrDefaultAsync(m => m.Id == dados.Id)
            ?? throw new KeyNotFoundException("MDFe não encontrado");

        return await _iniGenerator.GerarIniAsync(mdfe);
    }
    public Task<object> ObterStatusServicoAsync() => ConsultarStatusServicoAsync("");

    public async Task<object> DistribuicaoPorNSUAsync(string uf, string cnpjCpf, string nsu)
    {
        var resultado = await _provider.DistribuicaoPorNSUAsync(uf, cnpjCpf, nsu);
        if (!resultado.Sucesso)
        {
            throw new InvalidOperationException(resultado.Mensagem ?? "Falha na distribuição por NSU.");
        }

        return resultado.Dados!;
    }

    public async Task<object> DistribuicaoPorUltNSUAsync(string uf, string cnpjCpf, string ultNsu)
    {
        var resultado = await _provider.DistribuicaoPorUltNSUAsync(uf, cnpjCpf, ultNsu);
        if (!resultado.Sucesso)
        {
            throw new InvalidOperationException(resultado.Mensagem ?? "Falha na distribuição por último NSU.");
        }

        return resultado.Dados!;
    }

    public async Task<object> DistribuicaoPorChaveAsync(string uf, string cnpjCpf, string chave)
    {
        var resultado = await _provider.DistribuicaoPorChaveAsync(uf, cnpjCpf, chave);
        if (!resultado.Sucesso)
        {
            throw new InvalidOperationException(resultado.Mensagem ?? "Falha na distribuição por chave.");
        }

        return resultado.Dados!;
    }
}
