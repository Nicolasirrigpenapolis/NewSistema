import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../ui';
import Icon2 from '../../../components/UI/Icon';
import { relatoriosService, RelatorioDespesasFiltro, RelatorioDespesasItem } from '../../../services/relatoriosService';
import { viagensService } from '../../../services/viagensService';
import { useEmitente } from '../../../contexts/EmitenteContext';
import { GenericViewModal } from '../../../components/UI/feedback/GenericViewModal';
import { viagemConfig } from '../../../components/Viagens/ViagemConfig';

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

export function ListarViagens() {
  const navigate = useNavigate();
  const { nomeExibicao, logoUrl } = useEmitente();
  const [viagens, setViagens] = useState<RelatorioDespesasItem[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Estados temporários dos filtros
  const [filtroDataInicioTemp, setFiltroDataInicioTemp] = useState('');
  const [filtroDataFimTemp, setFiltroDataFimTemp] = useState('');
  const [filtroPlacaTemp, setFiltroPlacaTemp] = useState('');
  const [filtroOrigemTemp, setFiltroOrigemTemp] = useState('');
  const [filtroDestinoTemp, setFiltroDestinoTemp] = useState('');
  const [filtroTipoDespesaTemp, setFiltroTipoDespesaTemp] = useState('');

  // Estados dos filtros aplicados
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroPlaca, setFiltroPlaca] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [filtroDestino, setFiltroDestino] = useState('');
  const [filtroTipoDespesa, setFiltroTipoDespesa] = useState('');

  // Estados do modal
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [viagemAtual, setViagemAtual] = useState<RelatorioDespesasItem | null>(null);

  const [filtros, setFiltros] = useState<RelatorioDespesasFiltro>({
    page: 1,
    pageSize: 10,
    sortBy: 'dataInicio',
    sortDirection: 'desc'
  });

  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
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
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltros = () => {
    setFiltroDataInicio(filtroDataInicioTemp);
    setFiltroDataFim(filtroDataFimTemp);
    setFiltroPlaca(filtroPlacaTemp);
    setFiltroOrigem(filtroOrigemTemp);
    setFiltroDestino(filtroDestinoTemp);
    setFiltroTipoDespesa(filtroTipoDespesaTemp);
    setFiltros((prev) => ({
      ...prev,
      page: 1,
      dataInicio: filtroDataInicioTemp || undefined,
      dataFim: filtroDataFimTemp || undefined,
      placa: filtroPlacaTemp?.trim() || undefined,
      tipoDespesa: filtroTipoDespesaTemp?.trim() || undefined
    }));
  };

  const limparFiltros = () => {
    setFiltroDataInicioTemp('');
    setFiltroDataFimTemp('');
    setFiltroPlacaTemp('');
    setFiltroOrigemTemp('');
    setFiltroDestinoTemp('');
    setFiltroTipoDespesaTemp('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroPlaca('');
    setFiltroOrigem('');
    setFiltroDestino('');
    setFiltroTipoDespesa('');
    setFiltros({
      page: 1,
      pageSize: filtros.pageSize,
      sortBy: 'dataInicio',
      sortDirection: 'desc'
    });
  };

  const formatarData = (dataString: string) => new Date(dataString).toLocaleDateString('pt-BR');
  const formatarMoeda = (valor: number) => relatoriosService.formatCurrency(valor);
  const getSaldoColor = (saldo: number) => (saldo > 0 ? 'text-emerald-600 dark:text-emerald-400' : saldo < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500');

  const abrirModalVisualizacao = async (viagem: RelatorioDespesasItem) => {
    setViagemAtual(viagem);
    setModalVisualizacao(true);
  };

  const fecharModal = () => {
    setModalVisualizacao(false);
    setViagemAtual(null);
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Confirma a exclusão desta viagem? Receitas e despesas associadas serão removidas.')) {
      return;
    }

    const response = await viagensService.excluir(id);
    if (response.success) {
      carregarDados();
    } else {
      alert(response.message || 'Erro ao excluir viagem');
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full py-4">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando viagens...</span>
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
            <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-amber-500/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-500 to-orange-600 dark:from-amber-500 dark:via-amber-400 dark:to-orange-500" aria-hidden="true" />
              <span className="absolute inset-0 opacity-40 blur-lg bg-amber-400" aria-hidden="true" />
              <div className="relative h-full w-full flex items-center justify-center">
                <Icon2 name="route" className="text-white text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Gestão de Viagens</h1>
              <p className="text-muted-foreground text-lg">Controle e acompanhe todas as viagens registradas</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => navigate('/viagens/nova')}
          >
            <Icon2 name="plus" size="lg" />
            <span>Nova Viagem</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Data Início</label>
              <input
                type="date"
                value={filtroDataInicioTemp}
                onChange={(e) => setFiltroDataInicioTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Data Fim</label>
              <input
                type="date"
                value={filtroDataFimTemp}
                onChange={(e) => setFiltroDataFimTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Origem</label>
              <input
                type="text"
                placeholder="Cidade origem"
                value={filtroOrigemTemp}
                onChange={(e) => setFiltroOrigemTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Destino</label>
              <input
                type="text"
                placeholder="Cidade destino"
                value={filtroDestinoTemp}
                onChange={(e) => setFiltroDestinoTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="col-span-1">
              <button
                onClick={aplicarFiltros}
                className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon2 name="search" />
                Filtrar
              </button>
            </div>

            <div className="col-span-1">
              <button
                onClick={limparFiltros}
                className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!filtroDataInicioTemp && !filtroDataFimTemp && !filtroPlacaTemp && !filtroOrigemTemp && !filtroDestinoTemp && !filtroTipoDespesaTemp}
              >
                <Icon2 name="times" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(filtroDataInicio || filtroDataFim || filtroPlaca || filtroOrigem || filtroDestino || filtroTipoDespesa) && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Icon2 name="filter" className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Filtros ativos:
                {filtroDataInicio && <span className="ml-1 px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs">Início: {new Date(filtroDataInicio).toLocaleDateString('pt-BR')}</span>}
                {filtroDataFim && <span className="ml-1 px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs">Fim: {new Date(filtroDataFim).toLocaleDateString('pt-BR')}</span>}
                {filtroPlaca && <span className="ml-1 px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs">Placa: {filtroPlaca}</span>}
                {filtroOrigem && <span className="ml-1 px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs">Origem: {filtroOrigem}</span>}
                {filtroDestino && <span className="ml-1 px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs">Destino: {filtroDestino}</span>}
                {filtroTipoDespesa && <span className="ml-1 px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs">Tipo: {filtroTipoDespesa}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {viagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon2 name="route" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtroDataInicio || filtroDataFim || filtroPlaca || filtroOrigem || filtroDestino || filtroTipoDespesa) ? 'Nenhuma viagem encontrada com os filtros aplicados' : 'Nenhuma viagem encontrada'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtroDataInicio || filtroDataFim || filtroPlaca || filtroOrigem || filtroDestino || filtroTipoDespesa) ? 'Tente ajustar os filtros ou limpar para ver todas as viagens.' : 'Adicione uma nova viagem para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div className="text-center">Período</div>
                <div className="text-center">Veículo</div>
                <div className="text-center">Rota</div>
                <div className="text-center">Receita</div>
                <div className="text-center">Despesas</div>
                <div className="text-center">Saldo</div>
                <div className="text-center">Ações</div>
              </div>

              {viagens.map((viagem) => (
                <div key={viagem.id} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{formatarData(viagem.dataInicio)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">até {formatarData(viagem.dataFim)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{viagem.veiculoPlaca}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{viagem.veiculoMarca || 'N/A'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{viagem.origemDestino || 'Não informado'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{viagem.duracaoDias} {viagem.duracaoDias === 1 ? 'dia' : 'dias'}</div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatarMoeda(viagem.receitaTotal)}
                    </span>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {formatarMoeda(viagem.totalDespesas)}
                    </span>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-sm font-semibold ${getSaldoColor(viagem.saldoLiquido)}`}>
                      {formatarMoeda(viagem.saldoLiquido)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirModalVisualizacao(viagem)}
                      title="Visualizar"
                    >
                      <Icon2 name="eye" />
                    </button>
                    <button
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => navigate(`/viagens/editar/${viagem.id}`)}
                      title="Editar"
                    >
                      <Icon2 name="edit" />
                    </button>
                    <button
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => handleExcluir(viagem.id)}
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

        {/* Paginação */}
        {paginacao && paginacao.totalItems > 0 && (
          <div className="mt-6 bg-card border-t border-gray-200 dark:border-0 p-4 rounded-b-lg">
            <div className="flex flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground text-left">
                Mostrando {paginacao.startItem || ((paginacao.currentPage - 1) * paginacao.pageSize) + 1} até {paginacao.endItem || Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} viagens
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
                  className="px-3 py-1 border border-gray-300 dark:border-0 rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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

      {/* Modal de Visualização */}
      <GenericViewModal
        isOpen={modalVisualizacao}
        onClose={fecharModal}
        item={viagemAtual as any}
        title={viagemConfig.view.title}
        subtitle={viagemConfig.view.subtitle}
        headerIcon={viagemConfig.view.headerIcon}
        headerColor={viagemConfig.view.headerColor}
        sections={viagemAtual ? viagemConfig.view.getSections(viagemAtual as any) : []}
        actions={viagemAtual ? [
          {
            label: 'Editar viagem',
            icon: 'edit',
            onClick: () => {
              fecharModal();
              navigate(`/viagens/editar/${viagemAtual.id}`, { state: { viagem: viagemAtual } });
            },
            variant: 'primary'
          }
        ] : []}
      />
    </div>
  );
}
