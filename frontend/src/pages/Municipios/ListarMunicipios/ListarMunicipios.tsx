import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildCommonHeaders } from '../../../services/api';
import Icon from '../../../components/UI/Icon';
import { Icon as ThemedIcon } from '../../../ui';
import { GenericViewModal } from '../../../components/UI/feedback/GenericViewModal';
import { ConfirmDeleteModal } from '../../../components/UI/feedback/ConfirmDeleteModal';
import { municipioConfig } from '../../../components/Municipios/MunicipioConfig';
import { useAuth } from '../../../contexts/AuthContext';

interface Municipio {
  id?: number;
  codigo: number;
  nome: string;
  uf: string;
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

interface FiltrosMunicipios {
  status: string;
  uf: string;
}

export function ListarMunicipios() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Estados temporários dos filtros
  const [termoBuscaTemp, setTermoBuscaTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');
  const [filtroUfTemp, setFiltroUfTemp] = useState('');

  // Estados dos filtros aplicados
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroUf, setFiltroUf] = useState('');

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  // Estados dos modais
  const [municipioVisualizacao, setMunicipioVisualizacao] = useState<Municipio | null>(null);
  const [municipioExclusao, setMunicipioExclusao] = useState<Municipio | null>(null);

  // Estados de loading
  const [excluindo, setExcluindo] = useState(false);
  const [importandoIBGE, setImportandoIBGE] = useState(false);

  useEffect(() => {
    carregarMunicipios(paginaAtual, termoBusca, filtroStatus, filtroUf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtual, tamanhoPagina, termoBusca, filtroStatus, filtroUf]);

  const carregarMunicipios = async (
    pagina: number = paginaAtual,
    busca: string = termoBusca,
    status: string = filtroStatus,
    uf: string = filtroUf
  ) => {
    try {
      setCarregando(true);

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';
      const params = new URLSearchParams({
        Page: pagina.toString(),
        PageSize: tamanhoPagina.toString()
      });

      if (busca.trim()) {
        params.append('Search', busca.trim());
      }

      const response = await fetch(`${API_BASE_URL}/municipios?${params}`, {
        headers: buildCommonHeaders()
      });

      if (!response.ok) {
        setMunicipios([]);
        setPaginacao(null);
        return;
      }

      const data: PaginationData & { items: Municipio[] } = await response.json();

      // Aplicar filtros de status e UF no frontend
      let municipiosFiltrados = data.items || [];

      if (status) {
        const ativo = status === 'ativo';
        municipiosFiltrados = municipiosFiltrados.filter(m => m.ativo === ativo);
      }

      if (uf) {
        municipiosFiltrados = municipiosFiltrados.filter(m => m.uf === uf);
      }

      setMunicipios(municipiosFiltrados);
      setPaginacao({
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        pageSize: data.pageSize,
        hasNextPage: data.hasNextPage,
        hasPreviousPage: data.hasPreviousPage,
        startItem: data.startItem,
        endItem: data.endItem
      });
    } catch (error) {
      console.error('Erro ao carregar municípios:', error);
      setMunicipios([]);
      setPaginacao(null);
    } finally {
      setCarregando(false);
    }
  };



  const aplicarFiltros = () => {
    setTermoBusca(termoBuscaTemp);
    setFiltroStatus(filtroStatusTemp);
    setFiltroUf(filtroUfTemp);
    setPaginaAtual(1);
  };

  const limparFiltros = () => {
    setTermoBuscaTemp('');
    setFiltroStatusTemp('');
    setFiltroUfTemp('');
    setTermoBusca('');
    setFiltroStatus('');
    setFiltroUf('');
    setPaginaAtual(1);
  };

  const abrirNovo = () => navigate('/municipios/novo');

  const abrirEdicao = (municipio: Municipio) => {
    if (municipio.id) {
      navigate(`/municipios/${municipio.id}/editar`, { state: { municipio } });
    } else {
      navigate('/municipios/novo', { state: { municipio } });
    }
  };

  const abrirModalVisualizacao = (municipio: Municipio) => {
    setMunicipioVisualizacao(municipio);
  };

  const fecharModais = () => {
    setMunicipioVisualizacao(null);
    setMunicipioExclusao(null);
  };

  const abrirModalExclusao = (municipio: Municipio) => {
    setMunicipioExclusao(municipio);
  };

  const handleDelete = async () => {
    if (!municipioExclusao?.id) return;

    try {
      setExcluindo(true);

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/municipios/${municipioExclusao.id}`, {
        method: 'DELETE',
        headers: buildCommonHeaders()
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir município');
      }

      fecharModais();
      carregarMunicipios();
    } catch (error) {
      console.error('Erro ao excluir município:', error);
    } finally {
      setExcluindo(false);
    }
  };

  const importarTodosIBGE = async () => {
    try {
      setImportandoIBGE(true);

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';
      
      const response = await fetch(`${API_BASE_URL}/municipios/importar-todos-ibge`, {
        method: 'POST',
        headers: buildCommonHeaders()
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro do servidor:', errorData);
        throw new Error('Erro ao importar municípios do IBGE');
      }

      const result = await response.json();
      alert(`Importação concluída!\nInseridos: ${result.totalInseridos || 0}\nAtualizados: ${result.totalAtualizados || 0}\nIgnorados: ${result.totalIgnorados || 0}`);
      carregarMunicipios();
    } catch (error) {
      console.error('Erro ao importar municípios do IBGE:', error);
      alert('Erro ao importar municípios do IBGE. Tente novamente.');
    } finally {
      setImportandoIBGE(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando municípios...</span>
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
            <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-lime-600/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-lime-700 via-lime-600 to-lime-500 dark:from-lime-600 dark:via-lime-500 dark:to-lime-400" aria-hidden="true" />
              <span className="absolute inset-0 opacity-40 blur-lg bg-lime-600" aria-hidden="true" />
              <div className="relative h-full w-full flex items-center justify-center">
                <ThemedIcon name="map-marker-alt" className="text-white text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Municípios</h1>
              <p className="text-muted-foreground text-lg">Gerencie os municípios cadastrados no sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.username === 'programador' && (
              <button
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={importarTodosIBGE}
                disabled={importandoIBGE}
              >
                <Icon name={importandoIBGE ? "spinner" : "download"} size="lg" />
                <span>{importandoIBGE ? 'Importando...' : 'Importar IBGE'}</span>
              </button>
            )}
            <button
              className="px-6 py-3 bg-gradient-to-r from-lime-700 to-lime-600 hover:from-lime-800 hover:to-lime-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={abrirNovo}
            >
              <Icon name="plus" size="lg" />
              <span>Novo Município</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Nome, código ou UF..."
                value={termoBuscaTemp}
                onChange={(e) => setTermoBuscaTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-600/20 focus:border-lime-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">UF</label>
              <select
                value={filtroUfTemp}
                onChange={(e) => setFiltroUfTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-lime-600/20 focus:border-lime-600"
              >
                <option value="">Todas as UF</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filtroStatusTemp}
                onChange={(e) => setFiltroStatusTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-lime-600/20 focus:border-lime-600"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <button
                onClick={aplicarFiltros}
                className="w-full px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon name="search" />
                Filtrar
              </button>
            </div>

            <div>
              <button
                onClick={limparFiltros}
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!filtroStatusTemp && !filtroUfTemp && !termoBuscaTemp}
              >
                <Icon name="times" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(termoBusca || filtroStatus || filtroUf) && (
          <div className="bg-lime-50 dark:bg-lime-900/20 border border-lime-200 dark:border-lime-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-lime-700 dark:text-lime-400" />
              <span className="text-sm font-medium text-lime-800 dark:text-lime-300">
                Filtros ativos:
                {termoBusca && <span className="ml-1 px-2 py-1 bg-lime-100 dark:bg-lime-800 rounded text-xs">{termoBusca}</span>}
                {filtroUf && <span className="ml-1 px-2 py-1 bg-lime-100 dark:bg-lime-800 rounded text-xs">{filtroUf}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-lime-100 dark:bg-lime-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {municipios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="map-marker-alt" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(termoBusca || filtroStatus || filtroUf) ? 'Nenhum município encontrado com os filtros aplicados' : 'Nenhum município encontrado'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(termoBusca || filtroStatus || filtroUf) ? 'Tente ajustar os filtros ou limpar para ver todos os municípios.' : 'Adicione um novo município ou importe do IBGE para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div className="text-center">Código IBGE</div>
                <div className="text-center">Nome</div>
                <div className="text-center">UF</div>
                <div className="text-center">Status</div>
                <div className="text-center">Ações</div>
              </div>

              {municipios.map((municipio) => (
                <div key={municipio.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{municipio.codigo}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Código IBGE</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{municipio.nome}</div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className="text-sm font-semibold text-lime-700 dark:text-lime-400">
                      {municipio.uf}
                    </span>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-sm font-semibold ${
                      municipio.ativo
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {municipio.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirModalVisualizacao(municipio)}
                      title="Visualizar"
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirEdicao(municipio)}
                      title="Editar"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirModalExclusao(municipio)}
                      title="Excluir"
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
                Mostrando {paginacao.startItem || ((paginacao.currentPage - 1) * paginacao.pageSize) + 1} até {paginacao.endItem || Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} municípios
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
                  className="px-3 py-1 border border-gray-300 dark:border-0 rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-lime-600/20 focus:border-lime-600"
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
          isOpen={!!municipioVisualizacao}
          onClose={fecharModais}
          item={municipioVisualizacao}
          title={municipioConfig.view.title}
          subtitle={municipioConfig.view.subtitle}
          headerIcon={municipioConfig.view.headerIcon}
          headerColor={municipioConfig.view.headerColor}
          sections={municipioVisualizacao ? municipioConfig.view.getSections(municipioVisualizacao) : []}
          actions={
            municipioVisualizacao
              ? [
                  {
                    label: 'Editar Município',
                    icon: 'edit',
                    variant: 'warning' as const,
                    onClick: () => {
                      fecharModais();
                      abrirEdicao(municipioVisualizacao);
                    }
                  }
                ]
              : []
          }
          statusConfig={municipioVisualizacao ? municipioConfig.view.getStatusConfig?.(municipioVisualizacao) : undefined}
          idField={municipioConfig.view.idField}
        />

        {/* Modal de exclusão */}
        <ConfirmDeleteModal
          isOpen={!!municipioExclusao}
          title="Excluir Município"
          message="Tem certeza de que deseja excluir este município?"
          itemName={municipioExclusao ? `${municipioExclusao.nome}/${municipioExclusao.uf}` : ''}
          onConfirm={handleDelete}
          onClose={fecharModais}
          loading={excluindo}
        />
      </div>
    </div>
  );
}
