using Backend.Api.Models;
using Microsoft.Extensions.Options;

namespace Backend.Api.Services;

/// <summary>
/// Serviço para gerenciar o tenant (empresa) atual da requisição
/// </summary>
public interface ITenantService
{
    string? TenantIdAtual { get; }
    ConfiguracaoEmpresa? TenantAtual { get; }
    ConfiguracaoEmpresa? ObterConfiguracaoPorId(string tenantId);
    List<ConfiguracaoEmpresa> ObterEmpresasAtivas();
    void DefinirTenant(string tenantId);
}

public class TenantService : ITenantService
{
    private readonly ConfiguracoesEmpresas _configuracoes;
    private string? _tenantIdAtual;

    public TenantService(IOptions<ConfiguracoesEmpresas> configuracoes)
    {
        _configuracoes = configuracoes.Value;
    }

    public string? TenantIdAtual => _tenantIdAtual;

    public ConfiguracaoEmpresa? TenantAtual
    {
        get
        {
            if (string.IsNullOrEmpty(_tenantIdAtual))
                return null;

            return ObterConfiguracaoPorId(_tenantIdAtual);
        }
    }

    public ConfiguracaoEmpresa? ObterConfiguracaoPorId(string tenantId)
    {
        return _configuracoes.Empresas
            .FirstOrDefault(e => e.Id.Equals(tenantId, StringComparison.OrdinalIgnoreCase) && e.Ativo);
    }

    public List<ConfiguracaoEmpresa> ObterEmpresasAtivas()
    {
        return _configuracoes.Empresas
            .Where(e => e.Ativo)
            .ToList();
    }

    public void DefinirTenant(string tenantId)
    {
        var empresa = ObterConfiguracaoPorId(tenantId);
        if (empresa == null)
        {
            throw new InvalidOperationException($"Empresa '{tenantId}' não encontrada ou inativa.");
        }

        _tenantIdAtual = tenantId;
    }
}
