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
    private readonly IMDFeProvider _provider; // injetado
    private readonly IMDFeIniGenerator? _iniGenerator; // opcional se registrado

    public MDFeService(SistemaContext context, ILogger<MDFeService> logger, IMDFeProvider provider, IMDFeIniGenerator? iniGenerator = null)
    {
        _context = context;
        _logger = logger;
        _provider = provider;
        _iniGenerator = iniGenerator;
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
        var mdfe = await GetByIdAsync(mdfeId) ?? throw new KeyNotFoundException("MDFe não encontrado");
        if (_iniGenerator != null)
        {
            // Temporariamente retornamos o INI gerado até termos geração XML própria
            var ini = await _iniGenerator.GerarIniAsync(mdfe);
            return $";RETORNO_TEMPORARIO=INI\n{ini}";
        }
        var result = await _provider.GerarXmlAsync(mdfeId);
        if (!result.Sucesso)
        {
            _logger.LogWarning("[MDFeService] Falha ao gerar XML via provider: {Codigo} {Mensagem}", result.CodigoErro, result.Mensagem);
            return "<!-- Geração XML não implementada -->";
        }
        return result.Dados ?? "";
    }

    public async Task<object> TransmitirAsync(int mdfeId)
    {
        var mdfe = await GetByIdAsync(mdfeId) ?? throw new KeyNotFoundException("MDFe não encontrado");
        if (_iniGenerator == null)
        {
            _logger.LogWarning("[MDFeService] IMDFeIniGenerator não registrado - fallback para transmissão stub XML");
            var fallback = await _provider.TransmitirAsync(mdfeId);
            if (!fallback.Sucesso) throw new InvalidOperationException($"Falha transmitir (fallback): {fallback.Mensagem}");
            return fallback.Dados!;
        }

        // Gera INI real
        var ini = await _iniGenerator.GerarIniAsync(mdfe);
        _logger.LogDebug("[MDFeService] INI gerado {Length} chars", ini.Length);
        var resultado = await _provider.TransmitirComIniAsync(mdfeId, ini);
        if (!resultado.Sucesso) throw new InvalidOperationException($"Falha transmitir: {resultado.Mensagem}");
        var meta = resultado.Dados as Dictionary<string, object?>;
        if (meta != null)
        {
            // Persistir campos chave se retornarem
            if (meta.TryGetValue("nProt", out var nProt) && nProt is string prot && !string.IsNullOrWhiteSpace(prot))
            {
                mdfe.Protocolo = prot;
            }
            if (meta.TryGetValue("nRec", out var nRec) && nRec is string rec && !string.IsNullOrWhiteSpace(rec))
            {
                mdfe.NumeroRecibo = rec;
            }
            if (meta.TryGetValue("cStat", out var cStat) && cStat is string cs)
            {
                mdfe.StatusSefaz = cs;
            }
            await _context.SaveChangesAsync();
        }
        return resultado.Dados!;
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
        return new IniComparisonResult(); // sempre não correspondente por enquanto
    }
    public Task<string> GerarINIAsync(MDFeGerarINIDto dados) => Task.FromResult("; INI indisponível\n");
    public Task<object> ObterStatusServicoAsync() => ConsultarStatusServicoAsync("");

    // Métodos de distribuição não implementados
    public Task<object> DistribuicaoPorNSUAsync(string uf, string cnpjCpf, string nsu)
        => Task.FromResult<object>(new { sucesso = false, mensagem = "Distribuição por NSU não implementada", nsu });

    public Task<object> DistribuicaoPorUltNSUAsync(string uf, string cnpjCpf, string ultNsu)
        => Task.FromResult<object>(new { sucesso = false, mensagem = "Distribuição por último NSU não implementada", ultNsu });

    public Task<object> DistribuicaoPorChaveAsync(string uf, string cnpjCpf, string chave)
        => Task.FromResult<object>(new { sucesso = false, mensagem = "Distribuição por chave não implementada", chave });
}
