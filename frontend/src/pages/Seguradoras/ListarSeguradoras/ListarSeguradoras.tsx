import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCNPJ } from '../../../utils/formatters';
import { entitiesService } from '../../../services/entitiesService';
import { buildCommonHeaders } from '../../../services/api';
import Icon from '../../../components/UI/Icon';
import { Icon as ThemedIcon } from '../../../ui';
import { GenericViewModal } from '../../../components/UI/feedback/GenericViewModal';
import { ConfirmDeleteModal } from '../../../components/UI/feedback/ConfirmDeleteModal';
import { seguradoraConfig } from '../../../components/Seguradoras/SeguradoraConfig';

interface Seguradora {
  id?: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  apolice?: string;
  ativo?: boolean;
}

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

export function ListarSeguradoras() {
  const navigate = useNavigate();
  const [seguradoras, setSeguradoras] = useState<Seguradora[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [filtroTemp, setFiltroTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');

  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  // Estados para modais
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [seguradoraSelecionada, setSeguradoraSelecionada] = useState<Seguradora | null>(null);

  // Estados do modal de exclusão
  const [modalExclusao, setModalExclusao] = useState(false);
  const [seguradoraExclusao, setSeguradoraExclusao] = useState<Seguradora | null>(null);
  const [excludindo, setExcluindo] = useState(false);


  useEffect(() => {
    carregarSeguradoras();
  }, [paginaAtual, tamanhoPagina, filtro, filtroStatus]);

  const carregarSeguradoras = async () => {
    setCarregando(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';
      const params = new URLSearchParams({
        pagina: paginaAtual.toString(),
        tamanhoPagina: tamanhoPagina.toString()
      });

      if (filtro.trim()) {
        params.append('busca', filtro.trim());
      }

      const response = await fetch(`${API_BASE_URL}/seguradoras?${params}`, {
        headers: buildCommonHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const seguradorasMapeadas: Seguradora[] = (data.itens || data.items || data.Itens || []).map((seguradora: any) => ({
        id: seguradora.id || seguradora.Id,
        cnpj: seguradora.cnpj || seguradora.Cnpj,
        razaoSocial: seguradora.razaoSocial || seguradora.RazaoSocial || seguradora.nome || seguradora.Nome,
        nomeFantasia: seguradora.nomeFantasia || seguradora.NomeFantasia,
        apolice: seguradora.apolice || seguradora.Apolice,
        ativo: seguradora.ativo !== undefined ? seguradora.ativo : (seguradora.Ativo !== undefined ? seguradora.Ativo : true)
      }));

      setSeguradoras(seguradorasMapeadas);
      setPaginacao({
        totalItems: data.totalItens || data.totalItems || data.TotalItens || seguradorasMapeadas.length,
        totalPages: data.totalPaginas || data.totalPages || data.TotalPaginas || 1,
        currentPage: data.pagina || data.currentPage || data.Pagina || 1,
        pageSize: data.tamanhoPagina || data.pageSize || data.TamanhoPagina || 10,
        hasNextPage: data.temProximaPagina || data.hasNextPage || data.TemProxima || false,
        hasPreviousPage: data.temPaginaAnterior || data.hasPreviousPage || data.TemAnterior || false,
        startItem: data.startItem || 1,
        endItem: data.endItem || seguradorasMapeadas.length
      });
    } catch (error) {
      console.error('Erro ao carregar seguradoras:', error);
      setSeguradoras([]);
      setPaginacao({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        hasNextPage: false,
        hasPreviousPage: false,
        startItem: 0,
        endItem: 0
      });
    } finally {
      setCarregando(false);
    }
  };

  const abrirFormularioNovo = () => {
    navigate('/seguradoras/novo');
  };

  const abrirFormularioEdicao = (seguradora: Seguradora) => {
    if (seguradora.id) {
      navigate(`/seguradoras/${seguradora.id}/editar`, { state: { seguradora } });
    } else {
      navigate('/seguradoras/novo', { state: { seguradora } });
    }
  };

  const abrirModalVisualizacao = (seguradora: Seguradora) => {
    setSeguradoraSelecionada(seguradora);
    setModalVisualizacao(true);
  };

  const abrirModalExclusao = (seguradora: Seguradora) => {
    setSeguradoraExclusao(seguradora);
    setModalExclusao(true);
  };

  const fecharModais = () => {
    setModalVisualizacao(false);
    setSeguradoraSelecionada(null);
    setModalExclusao(false);
    setSeguradoraExclusao(null);
  };

  const handleDelete = async () => {
    if (!seguradoraExclusao?.id) return;

    try {
      setExcluindo(true);

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/seguradoras/${seguradoraExclusao.id}`, {
        method: 'DELETE',
        headers: buildCommonHeaders()
      });

      if (!response.ok) {
        throw new Error('Erro ao desativar seguradora');
      }

      fecharModais();
      carregarSeguradoras();
    } catch (error) {
      console.error('Erro ao desativar seguradora:', error);
    } finally {
      setExcluindo(false);
    }
  };

  const aplicarFiltros = () => {
    setFiltro(filtroTemp);
    setFiltroStatus(filtroStatusTemp);
    setPaginaAtual(1);
  };

  const limparFiltros = () => {
    setFiltroTemp('');
    setFiltroStatusTemp('');
    setFiltro('');
    setFiltroStatus('');
    setPaginaAtual(1);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando seguradoras...</span>
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
            <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-slate-600/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 dark:from-slate-600 dark:via-slate-500 dark:to-slate-400" aria-hidden="true" />
              <span className="absolute inset-0 opacity-40 blur-lg bg-slate-600" aria-hidden="true" />
              <div className="relative h-full w-full flex items-center justify-center">
                <ThemedIcon name="shield-alt" className="text-white text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Seguradoras</h1>
              <p className="text-muted-foreground text-lg">Gerencie as seguradoras cadastradas no sistema</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={abrirFormularioNovo}
          >
            <Icon name="plus" size="lg" />
            <span>Nova Seguradora</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Razão social ou CNPJ..."
                value={filtroTemp}
                onChange={(e) => setFiltroTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filtroStatusTemp}
                onChange={(e) => setFiltroStatusTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <button
                onClick={aplicarFiltros}
                className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon name="search" />
                Filtrar
              </button>
            </div>

            <div>
              <button
                onClick={limparFiltros}
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!filtroTemp && !filtroStatusTemp}
              >
                <Icon name="times" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(filtro || filtroStatus) && (
          <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-slate-700 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-300">
                Filtros ativos:
                {filtro && <span className="ml-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">{filtro}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {seguradoras.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="shield-alt" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtro || filtroStatus) ? 'Nenhuma seguradora encontrada com os filtros aplicados' : 'Nenhuma seguradora encontrada'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtro || filtroStatus) ? 'Tente ajustar os filtros ou limpar para ver todas as seguradoras.' : 'Adicione uma nova seguradora para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div className="text-center">CNPJ</div>
                <div className="text-center">Razão Social</div>
                <div className="text-center">Apólice</div>
                <div className="text-center">Status</div>
                <div className="text-center">Ações</div>
              </div>

              {seguradoras.map((seguradora) => (
                <div key={seguradora.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{formatCNPJ(seguradora.cnpj)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{seguradora.razaoSocial}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{seguradora.apolice || 'N/A'}</div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-sm font-semibold ${
                      seguradora.ativo
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {seguradora.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirModalVisualizacao(seguradora)}
                      title="Visualizar"
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirFormularioEdicao(seguradora)}
                      title="Editar"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirModalExclusao(seguradora)}
                      title="Desativar"
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
        {paginacao && paginacao.totalItems > 0 && (
          <div className="mt-6 bg-card border-t border-gray-200 dark:border-0 p-4 rounded-b-lg">
            <div className="flex flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground text-left">
                Mostrando {paginacao.startItem || ((paginacao.currentPage - 1) * paginacao.pageSize) + 1} até {paginacao.endItem || Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} seguradoras
              </div>

              {paginacao.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaAtual(paginacao.currentPage - 1)}
                    disabled={!paginacao.hasPreviousPage}
                    className="px-4 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground hover:bg-background dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                  >
                    Anterior
                  </button>

                  <span className="px-4 py-2 text-foreground font-medium text-sm whitespace-nowrap">
                    {paginacao.currentPage} / {paginacao.totalPages}
                  </span>

                  <button
                    onClick={() => setPaginaAtual(paginacao.currentPage + 1)}
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
                  value={tamanhoPagina}
                  onChange={(e) => {
                    setTamanhoPagina(Number(e.target.value));
                    setPaginaAtual(1);
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-0 rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
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

        {/* Modal de visualização */}
        <GenericViewModal
          isOpen={modalVisualizacao}
          onClose={fecharModais}
          item={seguradoraSelecionada}
          title={seguradoraConfig.view.title}
          subtitle={seguradoraConfig.view.subtitle}
          headerIcon={seguradoraConfig.view.headerIcon}
          headerColor={seguradoraConfig.view.headerColor}
          sections={seguradoraSelecionada ? seguradoraConfig.view.getSections(seguradoraSelecionada) : []}
          actions={
            seguradoraSelecionada
              ? [
                  {
                    label: 'Editar Seguradora',
                    icon: 'edit',
                    variant: 'warning' as const,
                    onClick: () => {
                      fecharModais();
                      abrirFormularioEdicao(seguradoraSelecionada);
                    }
                  }
                ]
              : []
          }
          statusConfig={seguradoraSelecionada ? seguradoraConfig.view.getStatusConfig?.(seguradoraSelecionada) : undefined}
          idField={seguradoraConfig.view.idField}
        />

        {/* Modal de exclusão */}
        <ConfirmDeleteModal
          isOpen={modalExclusao}
          title="Desativar Seguradora"
          message="Tem certeza de que deseja desativar esta seguradora? Ela não será mais exibida nas listagens."
          itemName={
            seguradoraExclusao
              ? `${seguradoraExclusao.razaoSocial} (${formatCNPJ(seguradoraExclusao.cnpj)})`
              : ''
          }
          onConfirm={handleDelete}
          onClose={fecharModais}
          loading={excludindo}
        />
      </div>
    </div>
  );
}
