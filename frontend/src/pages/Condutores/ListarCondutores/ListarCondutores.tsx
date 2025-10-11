import React, { useState, useEffect } from 'react';
import { CondutorCRUD } from '../../../components/Condutores/CondutorCRUD';
import { formatCPF, cleanNumericString } from '../../../utils/formatters';
import { entitiesService } from '../../../services/entitiesService';
import Icon from '../../../components/UI/Icon';

interface Condutor {
  id?: number;
  nome: string;
  cpf: string;
  telefone?: string;
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

export function ListarCondutores() {
  const [condutores, setCondutores] = useState<Condutor[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [filtroTemp, setFiltroTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');
  const [filtroCPFTemp, setFiltroCPFTemp] = useState('');

  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCPF, setFiltroCPF] = useState('');

  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  // Estados dos modais CRUD
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [condutorAtual, setCondutorAtual] = useState<Condutor | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Estados de loading
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarCondutores();
  }, [paginaAtual, tamanhoPagina, filtro, filtroStatus, filtroCPF]);

  const carregarCondutores = async () => {
    setCarregando(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';
      const params = new URLSearchParams({
        Page: paginaAtual.toString(),
        PageSize: tamanhoPagina.toString()
      });

      if (filtro.trim()) {
        params.append('Search', filtro.trim());
      }

      if (filtroCPF.trim()) {
        params.append('CPF', cleanNumericString(filtroCPF.trim()));
      }

      if (filtroStatus) {
        params.append('Status', filtroStatus === 'ativo' ? 'true' : 'false');
      }

      const response = await fetch(`${API_BASE_URL}/condutores?${params}`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const condutoresMapeados: Condutor[] = (data.items || data.Itens || []).map((condutor: any) => ({
        id: condutor.id || condutor.Id,
        nome: condutor.nome || condutor.Nome,
        cpf: condutor.cpf || condutor.Cpf,
        telefone: condutor.telefone || condutor.Telefone,
        ativo: condutor.ativo !== undefined ? condutor.ativo : (condutor.Ativo !== undefined ? condutor.Ativo : true)
      }));

      setCondutores(condutoresMapeados);
      setPaginacao({
        totalItems: data.totalItems || data.TotalItens || 0,
        totalPages: data.totalPages || data.TotalPaginas || 0,
        currentPage: data.currentPage || data.Pagina || 1,
        pageSize: data.pageSize || data.TamanhoPagina || 10,
        hasNextPage: data.hasNextPage || data.TemProxima || false,
        hasPreviousPage: data.hasPreviousPage || data.TemAnterior || false,
        startItem: data.startItem || data.ItemInicio || 0,
        endItem: data.endItem || data.ItemFim || 0
      });

    } catch (error) {
      console.error('Erro ao carregar condutores:', error);
      setCondutores([]);
      setPaginacao(null);
    } finally {
      setCarregando(false);
    }
  };

  // Handlers dos modais
  const abrirModalNovo = () => {
    setCondutorAtual(null);
    setModoEdicao(false);
    setModalFormulario(true);
  };

  const abrirModalEdicao = (condutor: Condutor) => {
    setCondutorAtual(condutor);
    setModoEdicao(true);
    setModalFormulario(true);
  };

  const abrirModalVisualizacao = (condutor: Condutor) => {
    setCondutorAtual(condutor);
    setModalVisualizacao(true);
  };

  const abrirModalExclusao = (condutor: Condutor) => {
    setCondutorAtual(condutor);
    setModalExclusao(true);
  };

  const fecharModais = () => {
    setModalVisualizacao(false);
    setModalFormulario(false);
    setModalExclusao(false);
    setCondutorAtual(null);
    setModoEdicao(false);
  };

  // Handlers de CRUD
  const handleSave = async (dadosCondutor: Condutor) => {
    try {
      setSalvando(true);

      const dadosLimpos = {
        ...dadosCondutor,
        cpf: cleanNumericString(dadosCondutor.cpf),
        nome: dadosCondutor.nome.trim(),
        telefone: dadosCondutor.telefone || undefined
      };

      let resposta;
      if (modoEdicao && condutorAtual?.id) {
        resposta = await entitiesService.atualizarCondutor(condutorAtual.id, dadosLimpos);
      } else {
        resposta = await entitiesService.criarCondutor(dadosLimpos);
      }

      if (resposta.sucesso) {
        fecharModais();
        carregarCondutores();
      } else {
        throw new Error(resposta.mensagem || 'Erro ao salvar condutor');
      }
    } catch (error) {
      console.error('Erro ao salvar condutor:', error);
      throw error;
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async () => {
    if (!condutorAtual?.id) return;

    try {
      setExcluindo(true);
      const resposta = await entitiesService.excluirCondutor(condutorAtual.id);

      if (resposta.sucesso) {
        fecharModais();
        carregarCondutores();
      } else {
        throw new Error(resposta.mensagem || 'Erro ao excluir condutor');
      }
    } catch (error) {
      console.error('Erro ao excluir condutor:', error);
    } finally {
      setExcluindo(false);
    }
  };

  const aplicarFiltros = () => {
    setFiltro(filtroTemp);
    setFiltroCPF(filtroCPFTemp);
    setFiltroStatus(filtroStatusTemp);
    setPaginaAtual(1);
  };

  const limparFiltros = () => {
    setFiltroTemp('');
    setFiltroCPFTemp('');
    setFiltroStatusTemp('');
    setFiltro('');
    setFiltroCPF('');
    setFiltroStatus('');
    setPaginaAtual(1);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando condutores...</span>
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
            <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="user" className="text-white" size="xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Condutores</h1>
              <p className="text-muted-foreground text-lg">Gerencie os condutores cadastrados</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={abrirModalNovo}
          >
            <Icon name="plus" size="lg" />
            <span>Novo Condutor</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Buscar por Nome</label>
              <input
                type="text"
                placeholder="Nome do condutor..."
                value={filtroTemp}
                onChange={(e) => setFiltroTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Buscar por CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={filtroCPFTemp}
                onChange={(e) => setFiltroCPFTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filtroStatusTemp}
                onChange={(e) => setFiltroStatusTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <button
                onClick={aplicarFiltros}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon name="search" />
                Filtrar
              </button>
            </div>

            <div>
              <button
                onClick={limparFiltros}
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!filtroTemp && !filtroCPFTemp && !filtroStatusTemp}
              >
                <Icon name="times" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(filtro || filtroCPF || filtroStatus) && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Filtros ativos:
                {filtro && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">Nome: {filtro}</span>}
                {filtroCPF && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">CPF: {filtroCPF}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {condutores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="user" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtro || filtroStatus) ? 'Nenhum condutor encontrado com os filtros aplicados' : 'Nenhum condutor encontrado'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtro || filtroStatus) ? 'Tente ajustar os filtros ou limpar para ver todos os condutores.' : 'Adicione um novo condutor para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div className="text-center">Nome</div>
                <div className="text-center">CPF</div>
                <div className="text-center">Status</div>
                <div className="text-center">Ações</div>
              </div>

              {condutores.map((condutor) => (
                <div key={condutor.id} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{condutor.nome}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{formatCPF(condutor.cpf)}</div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-sm font-semibold ${
                      condutor.ativo
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {condutor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirModalVisualizacao(condutor)}
                      title="Visualizar"
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirModalEdicao(condutor)}
                      title="Editar"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirModalExclusao(condutor)}
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
                Mostrando {paginacao.startItem || ((paginacao.currentPage - 1) * paginacao.pageSize) + 1} até {paginacao.endItem || Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} condutores
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

        {/* Modais CRUD */}
        <CondutorCRUD
          viewModalOpen={modalVisualizacao}
          formModalOpen={modalFormulario}
          deleteModalOpen={modalExclusao}
          selectedCondutor={condutorAtual}
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