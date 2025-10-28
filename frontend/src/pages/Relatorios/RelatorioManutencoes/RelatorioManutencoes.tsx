import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../ui';
import { relatoriosService, RelatorioManutencaoFiltro, RelatorioManutencaoItem } from '../../../services/relatoriosService';
import { manutencoesService } from '../../../services/manutencoesService';

interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startItem: number;
  endItem: number;
}

export function RelatorioManutencoes() {
  const navigate = useNavigate();
  const [manutencoes, setManutencoes] = useState<RelatorioManutencaoItem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState<'excel' | 'pdf' | null>(null);

  // Estados dos filtros
  const [filtros, setFiltros] = useState<RelatorioManutencaoFiltro>({
    page: 1,
    pageSize: 10,
    sortBy: 'dataManutencao',
    sortDirection: 'desc'
  });

  // Estados temporários dos filtros (antes de aplicar)
  const [filtrosTemp, setFiltrosTemp] = useState({
    dataInicio: '',
    dataFim: '',
    placa: '',
    peca: '',
    fornecedorId: ''
  });

  // Estados para paginação e resumo
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);
  const [resumo, setResumo] = useState<{
    totalManutencoes: number;
    valorTotalMaoObra: number;
    valorTotalPecas: number;
    valorTotalGeral: number;
  } | null>(null);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, [filtros]);

  // Aplicar filtros automaticamente com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const { dataInicio, dataFim, placa, peca } = filtrosTemp;

      // Validar datas
      if (dataInicio && dataFim && new Date(dataFim) < new Date(dataInicio)) {
        return; // Não aplica filtro se datas inválidas
      }

      // Aplicar automaticamente se algum filtro mudou
      if (dataInicio || dataFim || placa || peca) {
        aplicarFiltros();
      }
    }, 800); // 800ms de debounce

    return () => clearTimeout(timer);
  }, [filtrosTemp.dataInicio, filtrosTemp.dataFim, filtrosTemp.placa, filtrosTemp.peca]);

  const carregarDados = async () => {
    try {
      setCarregando(true);

      // Carregar relatório paginado
      const responseRelatorio = await relatoriosService.getRelatorioManutencao(filtros);

      if (responseRelatorio.success && responseRelatorio.data) {
        setManutencoes(responseRelatorio.data.items);
        setPaginacao({
          totalItems: responseRelatorio.data.totalItems,
          totalPages: responseRelatorio.data.totalPages,
          currentPage: responseRelatorio.data.page,
          pageSize: responseRelatorio.data.pageSize,
          hasNextPage: responseRelatorio.data.hasNextPage,
          hasPreviousPage: responseRelatorio.data.hasPreviousPage,
          startItem: responseRelatorio.data.startItem,
          endItem: responseRelatorio.data.endItem
        });
      }

      // Carregar resumo (sem paginação) - usar desestruturação
      const { page, pageSize, ...filtrosResumo } = filtros;

      const responseResumo = await relatoriosService.getResumoManutencao(filtrosResumo);

      if (responseResumo.success && responseResumo.data) {
        setResumo({
          totalManutencoes: responseResumo.data.totalManutencoes,
          valorTotalMaoObra: responseResumo.data.valorTotalMaoObra,
          valorTotalPecas: responseResumo.data.valorTotalPecas,
          valorTotalGeral: responseResumo.data.valorTotalGeral
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = () => {
    const novosFiltros: RelatorioManutencaoFiltro = {
      ...filtros,
      page: 1, // Reset para primeira página
      dataInicio: filtrosTemp.dataInicio || undefined,
      dataFim: filtrosTemp.dataFim || undefined,
      placa: filtrosTemp.placa || undefined,
      peca: filtrosTemp.peca || undefined,
      fornecedorId: filtrosTemp.fornecedorId ? parseInt(filtrosTemp.fornecedorId) : undefined
    };

    setFiltros(novosFiltros);
  };

  const limparFiltros = () => {
    setFiltrosTemp({
      dataInicio: '',
      dataFim: '',
      placa: '',
      peca: '',
      fornecedorId: ''
    });

    setFiltros({
      page: 1,
      pageSize: 10,
      sortBy: 'dataManutencao',
      sortDirection: 'desc'
    });
  };

  const exportarExcel = async () => {
    try {
      setExportando('excel');

      // Usar desestruturação ao invés de delete
      const { page, pageSize, ...filtrosExport } = filtros;

      const response = await relatoriosService.exportarManutencaoExcel(filtrosExport);

      if (response.success && response.data) {
        relatoriosService.downloadFile(response.data, 'relatorio-manutencao.xlsx');
      }
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
    } finally {
      setExportando(null);
    }
  };

  const exportarPdf = async () => {
    try {
      setExportando('pdf');

      // Usar desestruturação ao invés de delete
      const { page, pageSize, ...filtrosExport } = filtros;

      const response = await relatoriosService.exportarManutencaoPdf(filtrosExport);

      if (response.success && response.data) {
        relatoriosService.downloadFile(response.data, 'relatorio-manutencao.pdf');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setExportando(null);
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return relatoriosService.formatCurrency(valor);
  };

  const handleSort = (campo: string) => {
    const novaDirecao = filtros.sortBy === campo && filtros.sortDirection === 'asc' ? 'desc' : 'asc';
    setFiltros({ ...filtros, sortBy: campo, sortDirection: novaDirecao, page: 1 });
  };

  const getSortIcon = (campo: string) => {
    if (filtros.sortBy !== campo) return 'sort';
    return filtros.sortDirection === 'asc' ? 'sort-up' : 'sort-down';
  };

  const temFiltrosAtivos = filtros.dataInicio || filtros.dataFim || filtros.placa || filtros.peca || filtros.fornecedorId;

  // Validar se data fim é menor que data início
  const datasInvalidas = filtrosTemp.dataInicio && filtrosTemp.dataFim && new Date(filtrosTemp.dataFim) < new Date(filtrosTemp.dataInicio);

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta manutenção?')) return;

    const response = await manutencoesService.deleteManutencao(id);
    if (response.success) {
      alert('Manutenção excluída com sucesso!');
      carregarDados();
    } else {
      alert(response.message || 'Erro ao excluir manutenção');
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando relatório...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-2 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="wrench" className="text-white" size="xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Manutenção de Veículos</h1>
              <p className="text-muted-foreground text-lg">Monitore o histórico de intervenções, custos e disponibilidade da frota.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end">
            <button
              onClick={exportarExcel}
              disabled={exportando === 'excel'}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {exportando === 'excel' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Icon name="download" />
              )}
              Excel
            </button>

            <button
              onClick={exportarPdf}
              disabled={exportando === 'pdf'}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {exportando === 'pdf' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Icon name="download" />
              )}
              PDF
            </button>
          </div>
        </div>

        {/* Cards de Resumo */}
        {resumo && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Manutenções</p>
                  <p className="text-2xl font-bold text-foreground">{resumo.totalManutencoes}</p>
                </div>
                <Icon name="wrench" className="text-blue-500" size="lg" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mão de Obra</p>
                  <p className="text-2xl font-bold text-foreground">{formatarMoeda(resumo.valorTotalMaoObra)}</p>
                </div>
                <Icon name="user" className="text-yellow-500" size="lg" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Peças</p>
                  <p className="text-2xl font-bold text-foreground">{formatarMoeda(resumo.valorTotalPecas)}</p>
                </div>
                <Icon name="cog" className="text-orange-500" size="lg" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Geral</p>
                  <p className="text-2xl font-bold text-green-600">{formatarMoeda(resumo.valorTotalGeral)}</p>
                </div>
                <Icon name="dollar-sign" className="text-green-500" size="lg" />
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Data Início</label>
              <input
                type="date"
                value={filtrosTemp.dataInicio}
                onChange={(e) => setFiltrosTemp({ ...filtrosTemp, dataInicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Data Fim</label>
              <input
                type="date"
                value={filtrosTemp.dataFim}
                onChange={(e) => setFiltrosTemp({ ...filtrosTemp, dataFim: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${
                  datasInvalidas ? 'border-red-500' : 'border-gray-300 dark:border-0'
                }`}
              />
              {datasInvalidas && (
                <p className="text-xs text-red-500 mt-1">Data fim deve ser maior que data início</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Placa</label>
              <input
                type="text"
                placeholder="Ex: ABC-1234"
                value={filtrosTemp.placa}
                onChange={(e) => setFiltrosTemp({ ...filtrosTemp, placa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Peça</label>
              <input
                type="text"
                placeholder="Nome da peça..."
                value={filtrosTemp.peca}
                onChange={(e) => setFiltrosTemp({ ...filtrosTemp, peca: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <button
                onClick={aplicarFiltros}
                disabled={datasInvalidas}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="search" />
                Filtrar
              </button>
            </div>

            <div>
              <button
                onClick={limparFiltros}
                disabled={!temFiltrosAtivos}
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="times" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {temFiltrosAtivos && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Filtros ativos aplicados
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {manutencoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="wrench" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {temFiltrosAtivos ? 'Nenhuma manutenção encontrada' : 'Nenhuma manutenção registrada'}
              </h3>
              <p className="text-muted-foreground text-center">
                {temFiltrosAtivos ? 'Tente ajustar os filtros para encontrar registros.' : 'Registre manutenções para visualizar o relatório.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-8 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <button onClick={() => handleSort('dataManutencao')} className="text-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
                  Data
                  <Icon name={getSortIcon('dataManutencao')} size="sm" />
                </button>
                <button onClick={() => handleSort('veiculoPlaca')} className="text-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
                  Veículo
                  <Icon name={getSortIcon('veiculoPlaca')} size="sm" />
                </button>
                <div className="text-center">Descrição</div>
                <button onClick={() => handleSort('fornecedorNome')} className="text-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
                  Fornecedor
                  <Icon name={getSortIcon('fornecedorNome')} size="sm" />
                </button>
                <button onClick={() => handleSort('valorMaoObra')} className="text-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
                  Mão de Obra
                  <Icon name={getSortIcon('valorMaoObra')} size="sm" />
                </button>
                <button onClick={() => handleSort('valorPecas')} className="text-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
                  Peças
                  <Icon name={getSortIcon('valorPecas')} size="sm" />
                </button>
                <button onClick={() => handleSort('valorTotal')} className="text-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
                  Total
                  <Icon name={getSortIcon('valorTotal')} size="sm" />
                </button>
                <div className="text-center">Ações</div>
              </div>

              {manutencoes.map((manutencao) => (
                <div
                  key={manutencao.id}
                  className="grid grid-cols-8 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="text-center">
                    <div className="font-medium text-foreground">{formatarData(manutencao.dataManutencao)}</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium text-foreground">{manutencao.veiculoPlaca}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{manutencao.veiculoMarca}</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium text-foreground text-sm">{manutencao.descricao}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-foreground">{manutencao.fornecedorNome || 'Não informado'}</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium text-yellow-600">{formatarMoeda(manutencao.valorMaoObra)}</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium text-orange-600">{formatarMoeda(manutencao.valorPecas)}</div>
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-green-600">{formatarMoeda(manutencao.valorTotal)}</div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigate(`/manutencoes/editar/${manutencao.id}`)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar manutenção"
                    >
                      <Icon name="edit" className="text-blue-600 dark:text-blue-400" size="sm" />
                    </button>
                    <button
                      onClick={() => handleExcluir(manutencao.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Excluir manutenção"
                    >
                      <Icon name="trash" className="text-red-600 dark:text-red-400" size="sm" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Paginação */}
        {paginacao && paginacao.totalItems > 0 && (
          <div className="mt-6 bg-card border-t border-gray-200 dark:border-0 p-4 rounded-b-lg">
            <div className="flex flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground text-left">
                Mostrando {paginacao.startItem} até {paginacao.endItem} de {paginacao.totalItems} manutenções
              </div>

              {paginacao.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFiltros({ ...filtros, page: (filtros.page || 1) - 1 })}
                    disabled={!paginacao.hasPreviousPage}
                    className="px-4 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground hover:bg-background dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                  >
                    Anterior
                  </button>

                  <span className="px-4 py-2 text-foreground font-medium text-sm whitespace-nowrap">
                    {paginacao.currentPage} / {paginacao.totalPages}
                  </span>

                  <button
                    onClick={() => setFiltros({ ...filtros, page: (filtros.page || 1) + 1 })}
                    disabled={!paginacao.hasNextPage}
                    className="px-4 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground hover:bg-background dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                  >
                    Próxima
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="text-sm text-foreground">Itens por página:</label>
                <select
                  value={filtros.pageSize}
                  onChange={(e) => setFiltros({ ...filtros, pageSize: Number(e.target.value), page: 1 })}
                  className="px-3 py-1 border border-gray-300 dark:border-0 rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}