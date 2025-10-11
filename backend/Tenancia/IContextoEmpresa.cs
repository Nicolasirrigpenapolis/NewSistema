using Backend.Api.Configuracoes;

namespace Backend.Api.Tenancia;

/// <summary>
/// Expõe os metadados da empresa resolvedores para o ciclo de vida atual da aplicação.
/// </summary>
public interface IContextoEmpresa
{
    string IdentificadorEmpresa { get; }
    string NomeExibicao { get; }
    string StringConexao { get; }
    string? CodigoExterno { get; }
    OpcoesArmazenamentoEmpresa Armazenamento { get; }
    OpcoesIdentidadeVisualEmpresa IdentidadeVisual { get; }
}
