import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../ui';
import Icon2 from '../../../components/UI/Icon';
import { relatoriosService, RelatorioManutencaoFiltro, RelatorioManutencaoItem } from '../../../services/relatoriosService';
import { manutencoesService } from '../../../services/manutencoesService';
import { GenericViewModal } from '../../../components/UI/feedback/GenericViewModal';
import { ConfirmDeleteModal } from '../../../components/UI/feedback/ConfirmDeleteModal';
import { manutencaoConfig } from '../../../components/Manutencoes/ManutencaoConfig';
import { useEmitente } from '../../../contexts/EmitenteContext';

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

const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR');

export function ListarManutencoes() {
  const navigate = useNavigate();
  const { nomeExibicao } = useEmitente();

  const [manutencoes, setManutencoes] = useState<RelatorioManutencaoItem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState<'excel' | 'pdf' | null>(null);

  // Estados temporÃ¡rios dos filtros
  const [filtroDataInicioTemp, setFiltroDataInicioTemp] = useState('');
  const [filtroDataFimTemp, setFiltroDataFimTemp] = useState('');
  const [filtroPlacaTemp, setFiltroPlacaTemp] = useState('');
  const [filtroPecaTemp, setFiltroPecaTemp] = useState('');
  const [filtroFornecedorTemp, setFiltroFornecedorTemp] = useState('');

  // Estados dos filtros aplicados
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroPlaca, setFiltroPlaca] = useState('');
  const [filtroPeca, setFiltroPeca] = useState('');
  const [filtroFornecedor, setFiltroFornecedor] = useState('');

  const [filtros, setFiltros] = useState<RelatorioManutencaoFiltro>({
    page: 1,
    pageSize: 10,
    sortBy: 'dataManutencao',
    sortDirection: 'desc'
  });

  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [manutencaoAtual, setManutencaoAtual] = useState<RelatorioManutencaoItem | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setCarregando(true);

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
    } catch (error) {
      console.error('Erro ao carregar manutenÃ§Ãµes:', error);
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = () => {
    setFiltroDataInicio(filtroDataInicioTemp);
    setFiltroDataFim(filtroDataFimTemp);
    setFiltroPlaca(filtroPlacaTemp);
    setFiltroPeca(filtroPecaTemp);
    setFiltroFornecedor(filtroFornecedorTemp);
    setFiltros((prev) => ({
      ...prev,
      page: 1,
      dataInicio: filtroDataInicioTemp || undefined,
      dataFim: filtroDataFimTemp || undefined,
      placa: filtroPlacaTemp?.trim() || undefined,
      peca: filtroPecaTemp?.trim() || undefined,
      fornecedorId: filtroFornecedorTemp ? Number(filtroFornecedorTemp) : undefined
    }));
  };

  const limparFiltros = () => {
    setFiltroDataInicioTemp('');
    setFiltroDataFimTemp('');
    setFiltroPlacaTemp('');
    setFiltroPecaTemp('');
    setFiltroFornecedorTemp('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroPlaca('');
    setFiltroPeca('');
    setFiltroFornecedor('');
    setFiltros({
      page: 1,
      pageSize: filtros.pageSize,
      sortBy: 'dataManutencao',
      sortDirection: 'desc'
    });
  };

  const handleExportacao = async (formato: 'excel' | 'pdf') => {
    try {
      setExportando(formato);

      const { page: _page, pageSize: _pageSize, ...filtrosExport } = filtros;
      const tituloRelatorio = nomeExibicao ? 'Relatorio de Manutencoes - ' + nomeExibicao : undefined;
      const filtrosComMetadados: RelatorioManutencaoFiltro = {
        ...filtrosExport,
        tituloRelatorio
      };

      if (formato === 'excel') {
        const response = await relatoriosService.exportarManutencaoExcel(filtrosComMetadados);
        if (response.success && response.data) {
          relatoriosService.downloadFile(response.data, 'relatorio-manutencoes.xlsx');
        } else {
          throw new Error(response.message || 'Falha ao gerar Excel');
        }
      } else {
        const response = await relatoriosService.exportarManutencaoPdf(filtrosComMetadados);
        if (response.success && response.data) {
          relatoriosService.downloadFile(response.data, 'relatorio-manutencoes.pdf');
        } else {
          throw new Error(response.message || 'Falha ao gerar PDF');
        }
      }
    } catch (error) {
      console.error('Erro ao exportar manutencoes:', error);
      alert('Erro ao exportar relatorio. Tente novamente.');
    } finally {
      setExportando(null);
    }
  };
  const abrirModalVisualizacao = async (manutencao: RelatorioManutencaoItem) => {
    setManutencaoAtual(manutencao);
    setModalVisualizacao(true);
  };

  const abrirModalExclusao = (manutencao: RelatorioManutencaoItem) => {
    setManutencaoAtual(manutencao);
    setModalExclusao(true);
  };

  const fecharModais = () => {
    setModalVisualizacao(false);
    setModalExclusao(false);
    setManutencaoAtual(null);
  };

  const handleExcluir = async () => {
    if (!manutencaoAtual?.id) return;

    setExcluindo(true);
    try {
      const resposta = await manutencoesService.deleteManutencao(manutencaoAtual.id);
      if (resposta.success) {
        fecharModais();
        carregarDados();
      } else {
        throw new Error(resposta.message || 'Erro ao excluir manutenÃ§Ã£o');
      }
    } catch (error) {
      console.error('Erro ao excluir manutenÃ§Ã£o:', error);
      alert('NÃ£o foi possÃ­vel excluir esta manutenÃ§Ã£o.');
    } finally {
      setExcluindo(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando manutenÃ§Ãµes...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-green-500/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 dark:from-green-500 dark:via-green-400 dark:to-emerald-500" aria-hidden="true" />
              <span className="absolute inset-0 opacity-40 blur-lg bg-green-400" aria-hidden="true" />
              <div className="relative h-full w-full flex items-center justify-center">
                <Icon2 name="wrench" className="text-white text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Manutenções de Veículos</h1>
              <p className="text-muted-foreground text-lg">Registre e acompanhe as manutenções da frota</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExportacao('excel')}
              disabled={exportando === 'excel'}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exportando === 'excel' ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <Icon2 name="file-excel" />
                  <span>Excel</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleExportacao('pdf')}
              disabled={exportando === 'pdf'}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exportando === 'pdf' ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <Icon2 name="file-pdf" />
                  <span>PDF</span>
                </>
              )}
            </button>
            <button
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => navigate('/manutencoes/novo')}
            >
              <Icon2 name="plus" size="lg" />
              <span>Nova Manutenção</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-none border-x-0 border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Data Início</label>
              <input
                type="date"
                value={filtroDataInicioTemp}
                onChange={(e) => setFiltroDataInicioTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Data Fim</label>
              <input
                type="date"
                value={filtroDataFimTemp}
                onChange={(e) => setFiltroDataFimTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Placa</label>
              <input
                type="text"
                placeholder="ABC1D23"
                value={filtroPlacaTemp}
                onChange={(e) => setFiltroPlacaTemp(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Peça</label>
              <input
                type="text"
                placeholder="Ex: óleo, filtro"
                value={filtroPecaTemp}
                onChange={(e) => setFiltroPecaTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Fornecedor</label>
              <input
                type="number"
                placeholder="ID"
                value={filtroFornecedorTemp}
                onChange={(e) => setFiltroFornecedorTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>

            <div className="col-span-1">
              <button
                onClick={aplicarFiltros}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon2 name="search" />
                Filtrar
              </button>
            </div>

            <div className="col-span-1">
              <button
                onClick={limparFiltros}
                className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!filtroDataInicioTemp && !filtroDataFimTemp && !filtroPlacaTemp && !filtroPecaTemp && !filtroFornecedorTemp}
              >
                <Icon2 name="times" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(filtroDataInicio || filtroDataFim || filtroPlaca || filtroPeca || filtroFornecedor) && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-none border-x-0 border-green-200 dark:border-green-800 p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon2 name="filter" className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Filtros ativos:
                {filtroDataInicio && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">InÃ­cio: {new Date(filtroDataInicio).toLocaleDateString('pt-BR')}</span>}
                {filtroDataFim && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">Fim: {new Date(filtroDataFim).toLocaleDateString('pt-BR')}</span>}
                {filtroPlaca && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">{filtroPlaca}</span>}
                {filtroPeca && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">PeÃ§a: {filtroPeca}</span>}
                {filtroFornecedor && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">Fornecedor: {filtroFornecedor}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-none border-x-0 border-gray-200 dark:border-0 shadow-sm">
          {manutencoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon2 name="wrench" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtroDataInicio || filtroDataFim || filtroPlaca) ? 'Nenhuma manutenção encontrada com os filtros aplicados' : 'Nenhuma manutenção encontrada'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtroDataInicio || filtroDataFim || filtroPlaca) ? 'Tente ajustar os filtros ou limpar para ver todas as manutenções.' : 'Adicione uma nova manutenção para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div className="text-center">Data</div>
                <div className="text-center">Veículo</div>
                <div className="text-center">Descrição</div>
                <div className="text-center">Fornecedor</div>
                <div className="text-center">Mão de Obra</div>
                <div className="text-center">Valor Total</div>
                <div className="text-center">Ações</div>
              </div>

              {manutencoes.map((manutencao) => (
                <div key={manutencao.id} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{formatDate(manutencao.dataManutencao)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{manutencao.veiculoPlaca || 'N/A'}</div>
                    {manutencao.veiculoMarca && <div className="text-xs text-muted-foreground">{manutencao.veiculoMarca}</div>}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{manutencao.descricao || 'Não informado'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{manutencao.fornecedorNome || 'Não informado'}</div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {relatoriosService.formatCurrency(manutencao.valorMaoObra)}
                    </span>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {relatoriosService.formatCurrency(manutencao.valorTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirModalVisualizacao(manutencao)}
                      title="Visualizar"
                    >
                      <Icon2 name="eye" />
                    </button>
                    <button
                      className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => navigate(`/manutencoes/${manutencao.id}/editar`, { state: { manutencao } })}
                      title="Editar"
                    >
                      <Icon2 name="edit" />
                    </button>
                    <button
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirModalExclusao(manutencao)}
                      title="Excluir"
                    >
                      <Icon2 name="trash" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* PaginaÃ§Ã£o */}
        {paginacao && paginacao.totalItems > 0 && (
          <div className="mt-6 bg-card border-t border-gray-200 dark:border-0 p-4 rounded-none border-x-0">
            <div className="flex flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground text-left">
                Mostrando {paginacao.startItem || ((paginacao.currentPage - 1) * paginacao.pageSize) + 1} até {paginacao.endItem || Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} manutenções
              </div>

              {paginacao.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFiltros({ ...filtros, page: paginacao.currentPage - 1 })}
                    disabled={!paginacao.hasPreviousPage}
                    className="px-4 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground hover:bg-background dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                  >
                    Anterior
                  </button>

                  <span className="px-4 py-2 text-foreground font-medium text-sm whitespace-nowrap">
                    {paginacao.currentPage} / {paginacao.totalPages}
                  </span>

                  <button
                    onClick={() => setFiltros({ ...filtros, page: paginacao.currentPage + 1 })}
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
                  onChange={(e) => {
                    setFiltros({ ...filtros, pageSize: Number(e.target.value), page: 1 });
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-0 rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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

      <GenericViewModal
        isOpen={modalVisualizacao}
        onClose={fecharModais}
        item={manutencaoAtual as any}
        title={manutencaoConfig.view.title}
        subtitle={manutencaoConfig.view.subtitle}
        headerIcon={manutencaoConfig.view.headerIcon}
        headerColor={manutencaoConfig.view.headerColor}
        sections={manutencaoAtual ? manutencaoConfig.view.getSections(manutencaoAtual as any) : []}
        statusConfig={manutencaoAtual ? manutencaoConfig.view.getStatusConfig?.(manutencaoAtual as any) : undefined}
        actions={manutencaoAtual ? [
          {
            label: 'Editar manutenção',
            icon: 'edit',
            onClick: () => {
              fecharModais();
              navigate(`/manutencoes/${manutencaoAtual.id}/editar`, { state: { manutencao: manutencaoAtual } });
            },
            variant: 'primary'
          }
        ] : []}
      />

      <ConfirmDeleteModal
        isOpen={modalExclusao}
        title="Excluir manutenção"
        message="Tem certeza de que deseja excluir esta manutenção? Essa ação não pode ser desfeita."
        itemName={manutencaoAtual ? `manutenção do veículo ${manutencaoAtual.veiculoPlaca}` : ''}
        onConfirm={handleExcluir}
        onClose={fecharModais}
        loading={excluindo}
      />
    </div>
  );
}
