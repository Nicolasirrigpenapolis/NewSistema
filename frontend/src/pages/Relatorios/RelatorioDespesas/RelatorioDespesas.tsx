import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/UI/Icon';
import { relatoriosService, RelatorioDespesasFiltro, RelatorioDespesasItem, PagedResult, TodosTiposDespesa } from '../../../services/relatoriosService';
import { viagensService } from '../../../services/viagensService';

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

export function RelatorioFinanceiroViagens() {
  const navigate = useNavigate();
  const [viagens, setViagens] = useState<RelatorioDespesasItem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState<'excel' | 'pdf' | null>(null);

  // Estados dos filtros
  const [filtros, setFiltros] = useState<RelatorioDespesasFiltro>({
    page: 1,
    pageSize: 10,
    sortBy: 'dataInicio',
    sortDirection: 'desc'
  });

  // Estados temporários dos filtros (antes de aplicar)
  const [filtrosTemp, setFiltrosTemp] = useState({
    dataInicio: '',
    dataFim: '',
    placa: '',
    tipoDespesa: ''
  });

  // Estados para paginação e resumo
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);
  const [resumo, setResumo] = useState<{
    totalViagens: number;
    receitaTotalGeral: number;
    despesaTotalGeral: number;
    saldoLiquidoGeral: number;
    despesasPorTipo: Record<string, number>;
  } | null>(null);

  // Aplicar filtros automaticamente com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const { dataInicio, dataFim, placa, tipoDespesa } = filtrosTemp;

      // Validar datas
      if (dataInicio && dataFim && new Date(dataFim) < new Date(dataInicio)) {
        return; // Não aplica filtro se datas inválidas
      }

      // Aplicar automaticamente se algum filtro mudou
      if (dataInicio || dataFim || placa || tipoDespesa) {
        aplicarFiltros();
      }
    }, 800); // 800ms de debounce

    return () => clearTimeout(timer);
  }, [filtrosTemp.dataInicio, filtrosTemp.dataFim, filtrosTemp.placa, filtrosTemp.tipoDespesa]);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setCarregando(true);

      // Carregar relatório paginado
      const responseRelatorio = await relatoriosService.getRelatorioDespesas(filtros);

      if (responseRelatorio.success && responseRelatorio.data) {
        setViagens(responseRelatorio.data.items);
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

      const responseResumo = await relatoriosService.getResumoDespesas(filtrosResumo);

      if (responseResumo.success && responseResumo.data) {
        setResumo({
          totalViagens: responseResumo.data.totalViagens,
          receitaTotalGeral: responseResumo.data.receitaTotalGeral,
          despesaTotalGeral: responseResumo.data.despesaTotalGeral,
          saldoLiquidoGeral: responseResumo.data.saldoLiquidoGeral,
          despesasPorTipo: responseResumo.data.despesasPorTipo
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = () => {
    const novosFiltros: RelatorioDespesasFiltro = {
      ...filtros,
      page: 1, // Reset para primeira página
      dataInicio: filtrosTemp.dataInicio || undefined,
      dataFim: filtrosTemp.dataFim || undefined,
      placa: filtrosTemp.placa || undefined,
      tipoDespesa: filtrosTemp.tipoDespesa || undefined
    };

    setFiltros(novosFiltros);
  };

  const limparFiltros = () => {
    setFiltrosTemp({
      dataInicio: '',
      dataFim: '',
      placa: '',
      tipoDespesa: ''
    });

    setFiltros({
      page: 1,
      pageSize: 10,
      sortBy: 'dataInicio',
      sortDirection: 'desc'
    });
  };

  const exportarExcel = async () => {
    try {
      setExportando('excel');

      // Usar desestruturação ao invés de delete
      const { page, pageSize, ...filtrosExport } = filtros;

      const response = await relatoriosService.exportarDespesasExcel(filtrosExport);

      if (response.success && response.data) {
        relatoriosService.downloadFile(response.data, 'relatorio-despesas-viagens.xlsx');
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

      const response = await relatoriosService.exportarDespesasPdf(filtrosExport);

      if (response.success && response.data) {
        relatoriosService.downloadFile(response.data, 'relatorio-despesas-viagens.pdf');
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

  const getSaldoColor = (saldo: number) => {
    if (saldo > 0) return 'text-green-600';
    if (saldo < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleSort = (campo: string) => {
    const novaDirecao = filtros.sortBy === campo && filtros.sortDirection === 'asc' ? 'desc' : 'asc';
    setFiltros({ ...filtros, sortBy: campo, sortDirection: novaDirecao, page: 1 });
  };

  const getSortIcon = (campo: string) => {
    if (filtros.sortBy !== campo) return 'sort';
    return filtros.sortDirection === 'asc' ? 'sort-up' : 'sort-down';
  };

  const temFiltrosAtivos = filtros.dataInicio || filtros.dataFim || filtros.placa || filtros.tipoDespesa;

  // Validar se data fim é menor que data início
  const datasInvalidas = filtrosTemp.dataInicio && filtrosTemp.dataFim && new Date(filtrosTemp.dataFim) < new Date(filtrosTemp.dataInicio);

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta viagem? Todas as despesas e receitas serão excluídas também.')) {
      return;
    }

    const response = await viagensService.excluir(id);
    if (response.success) {
      alert('Viagem excluída com sucesso!');
      carregarDados(); // Recarregar dados
    } else {
      alert(response.message || 'Erro ao excluir viagem');
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
            <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="bar-chart" className="text-white" size="xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Relatório de Despesas/Receitas</h1>
              <p className="text-muted-foreground text-lg">Controle financeiro de viagens</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/viagens/nova')}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Icon name="plus" />
              Nova Viagem
            </button>

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
                  <p className="text-sm text-muted-foreground">Total de Viagens</p>
                  <p className="text-2xl font-bold text-foreground">{resumo.totalViagens}</p>
                </div>
                <Icon name="truck" className="text-blue-500" size="lg" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">{formatarMoeda(resumo.receitaTotalGeral)}</p>
                </div>
                <Icon name="trending-up" className="text-green-500" size="lg" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Despesa Total</p>
                  <p className="text-2xl font-bold text-red-600">{formatarMoeda(resumo.despesaTotalGeral)}</p>
                </div>
                <Icon name="trending-down" className="text-red-500" size="lg" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Líquido</p>
                  <p className={`text-2xl font-bold ${getSaldoColor(resumo.saldoLiquidoGeral)}`}>
                    {formatarMoeda(resumo.saldoLiquidoGeral)}
                  </p>
                </div>
                <Icon name="dollar-sign" className={resumo.saldoLiquidoGeral >= 0 ? "text-green-500" : "text-red-500"} size="lg" />
              </div>
            </div>
          </div>
        )}

        {/* Top Despesas por Tipo */}
        {resumo && Object.keys(resumo.despesasPorTipo).length > 0 && (
          <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Despesas por Tipo</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(resumo.despesasPorTipo)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([tipo, valor]) => (
                  <div key={tipo} className="flex items-center justify-between p-3 bg-background dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-foreground">{tipo}</span>
                    <span className="text-sm font-bold text-orange-600">{formatarMoeda(valor)}</span>
                  </div>
                ))}
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
              <label className="block text-sm font-medium text-foreground mb-2">Tipo Despesa</label>
              <select
                value={filtrosTemp.tipoDespesa}
                onChange={(e) => setFiltrosTemp({ ...filtrosTemp, tipoDespesa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">Todos os tipos</option>
                {TodosTiposDespesa.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={aplicarFiltros}
                disabled={datasInvalidas}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Filtros ativos aplicados
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {viagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="bar-chart" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {temFiltrosAtivos ? 'Nenhuma viagem encontrada' : 'Nenhuma viagem registrada'}
              </h3>
              <p className="text-muted-foreground text-center">
                {temFiltrosAtivos ? 'Tente ajustar os filtros para encontrar registros.' : 'Registre viagens para visualizar o relatório.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-8 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <button onClick={() => handleSort('dataInicio')} className="text-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                  Período
                  <Icon name={getSortIcon('dataInicio')} size="sm" />
                </button>
                <button onClick={() => handleSort('veiculoPlaca')} className="text-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                  Veículo
                  <Icon name={getSortIcon('veiculoPlaca')} size="sm" />
                </button>
                <div className="text-center">Origem/Destino</div>
                <button onClick={() => handleSort('receitaTotal')} className="text-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                  Receita
                  <Icon name={getSortIcon('receitaTotal')} size="sm" />
                </button>
                <button onClick={() => handleSort('totalDespesas')} className="text-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                  Despesas
                  <Icon name={getSortIcon('totalDespesas')} size="sm" />
                </button>
                <button onClick={() => handleSort('saldoLiquido')} className="text-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                  Saldo
                  <Icon name={getSortIcon('saldoLiquido')} size="sm" />
                </button>
                <button onClick={() => handleSort('duracaoDias')} className="text-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                  Duração
                  <Icon name={getSortIcon('duracaoDias')} size="sm" />
                </button>
                <div className="text-center">Ações</div>
              </div>

              {viagens.map((viagem) => (
                <div key={viagem.id} className="grid grid-cols-8 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground text-sm">{formatarData(viagem.dataInicio)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">até {formatarData(viagem.dataFim)}</div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium text-foreground">{viagem.veiculoPlaca}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{viagem.veiculoMarca}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-foreground">{viagem.origemDestino || 'Não informado'}</div>
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-green-600">{formatarMoeda(viagem.receitaTotal)}</div>
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-red-600">{formatarMoeda(viagem.totalDespesas)}</div>
                  </div>

                  <div className="text-center">
                    <div className={`font-bold ${getSaldoColor(viagem.saldoLiquido)}`}>
                      {formatarMoeda(viagem.saldoLiquido)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {viagem.duracaoDias} {viagem.duracaoDias === 1 ? 'dia' : 'dias'}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigate(`/viagens/editar/${viagem.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar viagem"
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      onClick={() => handleExcluir(viagem.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Excluir viagem"
                    >
                      <Icon name="trash" size="sm" />
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
                Mostrando {paginacao.startItem} até {paginacao.endItem} de {paginacao.totalItems} viagens
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
                  className="px-3 py-1 border border-gray-300 dark:border-0 rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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