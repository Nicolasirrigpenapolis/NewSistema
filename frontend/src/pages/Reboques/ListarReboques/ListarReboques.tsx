import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reboquesService, ReboqueList, ReboqueDetail } from '../../../services/reboquesService';
import Icon from '../../../components/UI/Icon';
import { Icon as ThemedIcon } from '../../../ui';
import { GenericViewModal } from '../../../components/UI/feedback/GenericViewModal';
import { ConfirmDeleteModal } from '../../../components/UI/feedback/ConfirmDeleteModal';
import { reboqueConfig } from '../../../components/Reboques/ReboqueConfig';
import { formatPlaca } from '../../../utils/formatters';
import { getTipoRodadoNome, getTipoCarroceriaNome } from '../../../utils/mappings';
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

export function ListarReboques() {
  const [reboques, setReboques] = useState<ReboqueList[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [filtroTemp, setFiltroTemp] = useState('');
  const [filtroUfTemp, setFiltroUfTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');

  const [filtro, setFiltro] = useState('');
  const [filtroUf, setFiltroUf] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  // Estados dos modais CRUD
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [reboqueAtual, setReboqueAtual] = useState<ReboqueDetail | null>(null);

  // Estados de loading
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarReboques();
  }, [paginaAtual, tamanhoPagina, filtro, filtroUf, filtroStatus]);

  const carregarReboques = async (pagina: number = paginaAtual, busca: string = filtro) => {
    try {
      setCarregando(true);

      const response = await reboquesService.listarReboques(
        pagina,
        tamanhoPagina,
        busca || undefined,
        'placa',
        'asc'
      );

      if (response.sucesso && response.data && Array.isArray(response.data.items)) {
        setReboques(response.data.items);
        setPaginacao({
          totalItems: response.data.totalItems,
          totalPages: response.data.totalPages,
          currentPage: response.data.page || response.data.currentPage,
          pageSize: response.data.pageSize,
          hasNextPage: response.data.hasNextPage,
          hasPreviousPage: response.data.hasPreviousPage,
          startItem: response.data.startItem || ((response.data.page - 1) * response.data.pageSize) + 1,
          endItem: response.data.endItem || Math.min(response.data.page * response.data.pageSize, response.data.totalItems)
        });
      } else {
        console.error('Erro ao carregar reboques:', response.mensagem || 'Erro ao carregar reboques');
        setReboques([]);
      }
    } catch (error) {
      console.error('Erro ao carregar reboques:', error);
      setReboques([]);
    } finally {
      setCarregando(false);
    }
  };

  // Handlers dos modais
  const navigate = useNavigate();

  const abrirNovo = () => navigate('/reboques/novo');

  const abrirEdicao = async (reboque: ReboqueList) => {
    // prefer loading details in the edit page; pass summary via state
    navigate(`/reboques/${reboque.id}/editar`, { state: { reboque } });
  };

  const abrirModalVisualizacao = async (reboque: ReboqueList) => {
    try {
      const response = await reboquesService.buscarReboque(reboque.id);
      if (response.sucesso && response.data) {
        setReboqueAtual(response.data);
        setModalVisualizacao(true);
      }
    } catch (error) {
      console.error('Erro ao buscar reboque:', error);
    }
  };

  const abrirModalExclusao = async (reboque: ReboqueList) => {
    try {
      const response = await reboquesService.buscarReboque(reboque.id);
      if (response.sucesso && response.data) {
        setReboqueAtual(response.data);
        setModalExclusao(true);
      }
    } catch (error) {
      console.error('Erro ao buscar reboque:', error);
    }
  };

  const fecharModais = () => {
    setModalVisualizacao(false);
    setModalExclusao(false);
    setReboqueAtual(null);
  };

  const handleDelete = async () => {
    if (!reboqueAtual?.id) return;

    try {
      setExcluindo(true);
      const resposta = await reboquesService.excluirReboque(reboqueAtual.id);

      if (resposta.sucesso) {
        fecharModais();
        carregarReboques();
      } else {
        throw new Error(resposta.mensagem || 'Erro ao excluir reboque');
      }
    } catch (error) {
      console.error('Erro ao excluir reboque:', error);
      // Aqui você poderia mostrar um toast de erro
    } finally {
      setExcluindo(false);
    }
  };

  const aplicarFiltros = () => {
    setFiltro(filtroTemp);
    setFiltroUf(filtroUfTemp);
    setFiltroStatus(filtroStatusTemp);
    setPaginaAtual(1);
  };

  const limparFiltros = () => {
    setFiltroTemp('');
    setFiltroUfTemp('');
    setFiltroStatusTemp('');
    setFiltro('');
    setFiltroUf('');
    setFiltroStatus('');
    setPaginaAtual(1);
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarTara = (tara: number) => {
    return reboquesService.formatarTara(tara);
  };

  // Filtragem local adicional (UF e Status que não são suportados pela API)
  const reboquesFiltrados = (() => {
    // Garantir que reboques seja um array válido
    if (!Array.isArray(reboques)) {
      return [];
    }

    let reboquesFiltraods = [...reboques];

    if (filtroUf) {
      reboquesFiltraods = reboquesFiltraods.filter(reboque => reboque.uf === filtroUf);
    }

    if (filtroStatus) {
      const isAtivo = filtroStatus === 'ativo';
      reboquesFiltraods = reboquesFiltraods.filter(reboque => reboque.ativo === isAtivo);
    }

    return reboquesFiltraods;
  })();

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando reboques...</span>
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
            <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-amber-700/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-amber-800 via-amber-700 to-amber-600 dark:from-amber-700 dark:via-amber-600 dark:to-amber-500" aria-hidden="true" />
              <span className="absolute inset-0 opacity-40 blur-lg bg-amber-700" aria-hidden="true" />
              <div className="relative h-full w-full flex items-center justify-center">
                <ThemedIcon name="truck" className="!text-white text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Reboques</h1>
              <p className="text-muted-foreground text-lg">Gerencie os reboques cadastrados no sistema</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-900 hover:to-amber-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={abrirNovo}
          >
            <Icon name="plus" size="lg" />
            <span>Novo Reboque</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Placa ou RNTRC..."
                value={filtroTemp}
                onChange={(e) => setFiltroTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">UF</label>
              <select
                value={filtroUfTemp}
                onChange={(e) => setFiltroUfTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
              >
                <option value="">Todas as UF</option>
                {reboquesService.getEstados().map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filtroStatusTemp}
                onChange={(e) => setFiltroStatusTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <button
                onClick={aplicarFiltros}
                className="w-full px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon name="search" />
                Filtrar
              </button>
            </div>

            <div>
              <button
                onClick={limparFiltros}
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!filtroTemp && !filtroUfTemp && !filtroStatusTemp}
              >
                <Icon name="times" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(filtro || filtroUf || filtroStatus) && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-amber-800 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-900 dark:text-amber-300">
                Filtros ativos:
                {filtro && <span className="ml-1 px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs">{filtro}</span>}
                {filtroUf && <span className="ml-1 px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs">{filtroUf}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {reboquesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="truck" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtro || filtroUf || filtroStatus) ? 'Nenhum reboque encontrado com os filtros aplicados' : 'Nenhum reboque encontrado'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtro || filtroUf || filtroStatus) ? 'Tente ajustar os filtros ou limpar para ver todos os reboques.' : 'Cadastre um novo reboque para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-9 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div>Placa</div>
                <div>Tara</div>
                <div>Tipo Rodado</div>
                <div>Tipo Carroceria</div>
                <div>UF</div>
                <div>RNTRC</div>
                <div>Status</div>
                <div>Data Cadastro</div>
                <div className="text-center">Ações</div>
              </div>

              {reboquesFiltrados.map((reboque) => (
                <div
                  key={reboque.id}
                  className="grid grid-cols-9 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-150 items-center"
                >
                  <div className="text-foreground font-mono font-semibold">{formatPlaca(reboque.placa)}</div>
                  <div className="text-foreground">{formatarTara(reboque.tara)}</div>
                  <div className="text-muted-foreground">{getTipoRodadoNome(reboque.tipoRodado)}</div>
                  <div className="text-muted-foreground">{getTipoCarroceriaNome(reboque.tipoCarroceria)}</div>
                  <div className="text-foreground">{reboque.uf}</div>
                  <div className="text-muted-foreground">{reboque.rntrc || '-'}</div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${reboque.ativo
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                    >
                      <Icon name={reboque.ativo ? 'check-circle' : 'times-circle'} />
                      {reboque.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="text-muted-foreground">{formatarData(reboque.dataCriacao)}</div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Visualizar"
                      onClick={() => abrirModalVisualizacao(reboque)}
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      title="Editar"
                      onClick={() => abrirEdicao(reboque)}
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Excluir"
                      onClick={() => abrirModalExclusao(reboque)}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Paginação */}
        {paginacao && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Itens por página:</label>
              <select
                value={tamanhoPagina}
                onChange={(e) => {
                  setTamanhoPagina(Number(e.target.value));
                  setPaginaAtual(1);
                }}
                className="px-3 py-1.5 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex justify-center">
              <span className="text-sm text-muted-foreground">
                {paginacao.currentPage} / {paginacao.totalPages}
              </span>
            </div>

            {paginacao.totalPages > 1 && (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setPaginaAtual(paginaAtual - 1)}
                  disabled={!paginacao.hasPreviousPage}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
                  title="Página anterior"
                >
                  <Icon name="chevron-left" />
                </button>
                <button
                  onClick={() => setPaginaAtual(paginaAtual + 1)}
                  disabled={!paginacao.hasNextPage}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
                  title="Próxima página"
                >
                  <Icon name="chevron-right" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal de visualização */}
        <GenericViewModal
          isOpen={modalVisualizacao}
          onClose={fecharModais}
          item={reboqueAtual}
          title={reboqueConfig.view.title}
          subtitle={reboqueConfig.view.subtitle}
          headerIcon={reboqueConfig.view.headerIcon}
          headerColor={reboqueConfig.view.headerColor}
          sections={reboqueAtual ? reboqueConfig.view.getSections(reboqueAtual) : []}
          actions={
            reboqueAtual
              ? [
                  {
                    label: 'Editar Reboque',
                    icon: 'edit',
                    variant: 'warning' as const,
                    onClick: () => {
                      fecharModais();
                      abrirEdicao(reboqueAtual);
                    }
                  }
                ]
              : []
          }
          statusConfig={reboqueAtual ? reboqueConfig.view.getStatusConfig?.(reboqueAtual) : undefined}
          idField={reboqueConfig.view.idField}
        />

        {/* Modal de exclusão */}
        <ConfirmDeleteModal
          isOpen={modalExclusao}
          title="Excluir Reboque"
          message="Tem certeza de que deseja excluir este reboque?"
          itemName={reboqueAtual ? `reboque ${formatPlaca(reboqueAtual.placa)}` : ''}
          onConfirm={handleDelete}
          onClose={fecharModais}
          loading={excluindo}
        />
      </div>
    </div>
  );
}

