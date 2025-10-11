import React, { useState, useEffect } from 'react';
import { ReboqueCRUD } from '../../../components/Reboques/ReboqueCRUD';
import { reboquesService, ReboqueList, ReboqueDetail } from '../../../services/reboquesService';
import Icon from '../../../components/UI/Icon';

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
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [reboqueAtual, setReboqueAtual] = useState<ReboqueDetail | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Estados de loading
  const [salvando, setSalvando] = useState(false);
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
  const abrirModalNovo = () => {
    setReboqueAtual(null);
    setModoEdicao(false);
    setModalFormulario(true);
  };

  const abrirModalEdicao = async (reboque: ReboqueList) => {
    try {
      const response = await reboquesService.buscarReboque(reboque.id);
      if (response.sucesso && response.data) {
        setReboqueAtual(response.data);
        setModoEdicao(true);
        setModalFormulario(true);
      }
    } catch (error) {
      console.error('Erro ao buscar reboque:', error);
    }
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
    setModalFormulario(false);
    setModalExclusao(false);
    setReboqueAtual(null);
    setModoEdicao(false);
  };

  // Handlers de CRUD
  const handleSave = async (dadosReboque: ReboqueDetail) => {
    try {
      setSalvando(true);

      let resposta;
      if (modoEdicao && reboqueAtual?.id) {
        resposta = await reboquesService.atualizarReboque(reboqueAtual.id, dadosReboque);
      } else {
        resposta = await reboquesService.criarReboque(dadosReboque);
      }

      if (resposta.sucesso) {
        fecharModais();
        carregarReboques();
      } else {
        throw new Error(resposta.mensagem || 'Erro ao salvar reboque');
      }
    } catch (error) {
      console.error('Erro ao salvar reboque:', error);
      throw error; // Re-throw para que o modal possa mostrar o erro
    } finally {
      setSalvando(false);
    }
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
              <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando reboques...</span>
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
            <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="truck" className="text-white" size="xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Reboques</h1>
              <p className="text-muted-foreground text-lg">Gerencie os reboques para transporte de carga</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={abrirModalNovo}
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
                value={filtroTemp}
                onChange={(e) => setFiltroTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                placeholder="Placa ou RNTRC..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">UF</label>
              <select
                value={filtroUfTemp}
                onChange={(e) => setFiltroUfTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="">Todos os estados</option>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <button
                onClick={aplicarFiltros}
                className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Filtros ativos:
                {filtro && <span className="ml-1 px-2 py-1 bg-orange-100 dark:bg-orange-800 rounded text-xs">{filtro}</span>}
                {filtroUf && <span className="ml-1 px-2 py-1 bg-orange-100 dark:bg-orange-800 rounded text-xs">{filtroUf}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-orange-100 dark:bg-orange-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
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
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum reboque encontrado</h3>
              <p className="text-muted-foreground text-center">Tente ajustar os filtros ou cadastre um novo reboque.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-9 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div className="text-center">Placa</div>
                <div className="text-center">Tara</div>
                <div className="text-center">Tipo Rodado</div>
                <div className="text-center">Tipo Carroceria</div>
                <div className="text-center">UF</div>
                <div className="text-center">RNTRC</div>
                <div className="text-center">Status</div>
                <div className="text-center">Data Cadastro</div>
                <div className="text-center">Ações</div>
              </div>
              {reboquesFiltrados.map((reboque) => (
                <div key={reboque.id} className="grid grid-cols-9 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <strong className="text-foreground">{formatPlaca(reboque.placa)}</strong>
                  </div>
                  <div className="text-center text-foreground">{formatarTara(reboque.tara)}</div>
                  <div className="text-center text-foreground">{getTipoRodadoNome(reboque.tipoRodado)}</div>
                  <div className="text-center text-foreground">{getTipoCarroceriaNome(reboque.tipoCarroceria)}</div>
                  <div className="text-center">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded text-xs font-medium">{reboque.uf}</span>
                  </div>
                  <div className="text-center text-foreground">{reboque.rntrc || '-'}</div>
                  <div className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reboque.ativo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {reboque.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="text-center text-foreground">{formatarData(reboque.dataCriacao)}</div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirModalVisualizacao(reboque)}
                      title="Visualizar"
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirModalEdicao(reboque)}
                      title="Editar"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirModalExclusao(reboque)}
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
                Mostrando {paginacao.startItem} até {paginacao.endItem} de {paginacao.totalItems} registros
              </div>

              {paginacao.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaAtual(paginaAtual - 1)}
                    disabled={!paginacao.hasPreviousPage}
                    className="px-4 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground hover:bg-background dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                  >
                    Anterior
                  </button>

                  <span className="px-4 py-2 text-foreground font-medium text-sm whitespace-nowrap">
                    Página {paginacao.currentPage} de {paginacao.totalPages}
                  </span>

                  <button
                    onClick={() => setPaginaAtual(paginaAtual + 1)}
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
                  className="px-3 py-1 border border-gray-300 dark:border-0 rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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

        {/* Modais CRUD */}
        <ReboqueCRUD
          viewModalOpen={modalVisualizacao}
          formModalOpen={modalFormulario}
          deleteModalOpen={modalExclusao}
          selectedReboque={reboqueAtual}
          isEdit={modoEdicao}
          onViewClose={fecharModais}
          onFormClose={fecharModais}
          onDeleteClose={fecharModais}
          onSave={handleSave}
          onEdit={abrirModalEdicao}
          onDelete={handleDelete}
          saving={salvando}
          deleting={excluindo}
        />
      </div>
    </div>
  );
}
