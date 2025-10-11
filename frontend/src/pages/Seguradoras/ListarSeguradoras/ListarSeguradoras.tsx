import React, { useState, useEffect } from 'react';
import { SeguradoraCRUD } from '../../../components/Seguradoras/SeguradoraCRUD';
import { formatCNPJ, cleanNumericString } from '../../../utils/formatters';
import { entitiesService } from '../../../services/entitiesService';
import Icon from '../../../components/UI/Icon';

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
  const [modalEdicao, setModalEdicao] = useState(false);
  const [seguradoraSelecionada, setSeguradoraSelecionada] = useState<Seguradora | null>(null);
  const [dadosFormulario, setDadosFormulario] = useState<Partial<Seguradora>>({});
  const [salvando, setSalvando] = useState(false);

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

      const response = await fetch(`${API_BASE_URL}/seguradoras?${params}`);

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

  const abrirModalVisualizacao = (seguradora: Seguradora) => {
    setSeguradoraSelecionada(seguradora);
    setModalVisualizacao(true);
  };

  const abrirModalEdicao = (seguradora?: Seguradora) => {
    if (seguradora) {
      setSeguradoraSelecionada(seguradora);
      setDadosFormulario(seguradora);
    } else {
      setSeguradoraSelecionada(null);
      setDadosFormulario({});
    }
    setModalEdicao(true);
  };

  const fecharModais = () => {
    setModalVisualizacao(false);
    setModalEdicao(false);
    setSeguradoraSelecionada(null);
    setDadosFormulario({});
  };

  const salvarSeguradora = async (dados: Partial<Seguradora>) => {
    setSalvando(true);
    try {
      const dadosParaSalvar = {
        cnpj: dados.cnpj || '',
        razaoSocial: dados.razaoSocial?.trim() || '',
        nomeFantasia: dados.nomeFantasia?.trim() || undefined,
        apolice: dados.apolice?.trim() || undefined,
        ativo: dados.ativo !== false
      };

      let resposta;
      if (seguradoraSelecionada?.id) {
        resposta = await entitiesService.atualizarSeguradora(seguradoraSelecionada.id, dadosParaSalvar);
      } else {
        resposta = await entitiesService.criarSeguradora(dadosParaSalvar);
      }

      if (resposta.sucesso) {
        fecharModais();
        carregarSeguradoras();
      } else {
        alert(`Erro ao salvar seguradora: ${resposta.mensagem}`);
      }
    } catch (error) {
      console.error('Erro ao salvar seguradora:', error);
      alert('Erro inesperado ao salvar seguradora. Verifique os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalExclusao = (seguradora: Seguradora) => {
    setSeguradoraExclusao(seguradora);
    setModalExclusao(true);
  };

  const fecharModalExclusao = () => {
    setModalExclusao(false);
    setSeguradoraExclusao(null);
    setExcluindo(false);
  };

  const confirmarExclusao = async () => {
    if (!seguradoraExclusao?.id) return;

    try {
      setExcluindo(true);
      const resposta = await entitiesService.excluirSeguradora(seguradoraExclusao.id);

      if (resposta.sucesso) {
        fecharModalExclusao();
        carregarSeguradoras();
      } else {
        alert(`Erro ao excluir seguradora: ${resposta.mensagem}`);
        setExcluindo(false);
      }
    } catch (error) {
      console.error('Erro ao excluir seguradora:', error);
      alert('Erro inesperado ao excluir seguradora. Tente novamente.');
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

  const atualizarCampo = (campo: string, valor: any) => {
    setDadosFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-shield-alt text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Seguradoras</h1>
              <p className="text-muted-foreground text-lg">Gerencie as seguradoras para proteção da carga</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => abrirModalEdicao()}
          >
            <i className="fas fa-plus text-lg"></i>
            <span>Nova Seguradora</span>
          </button>
        </div>

        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Buscar</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Buscar por razão social ou CNPJ..."
              value={filtroTemp}
              onChange={(e) => setFiltroTemp(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              value={filtroStatusTemp}
              onChange={(e) => setFiltroStatusTemp(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div>
            <button
              onClick={aplicarFiltros}
              className="w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Icon name="search" />
              Filtrar
            </button>
          </div>

          <div>
            <button
              className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={limparFiltros}
              disabled={!filtroTemp && !filtroStatusTemp}
            >
              <Icon name="times" />
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando seguradoras...</span>
            </div>
          </div>
        ) : seguradoras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-shield-alt text-2xl text-muted-foreground"></i>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma seguradora encontrada</h3>
            <p className="text-muted-foreground text-center">Adicione uma nova seguradora para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-5 gap-4 p-4 bg-muted border-b border-border font-semibold text-foreground">
              <div className="text-center">CNPJ</div>
              <div className="text-center">Razão Social</div>
              <div className="text-center">Apólice</div>
              <div className="text-center">Status</div>
              <div className="text-center">Ações</div>
            </div>
            {seguradoras.map((seguradora) => (
              <div key={seguradora.id} className="grid grid-cols-5 gap-4 p-4 border-b border-border hover:bg-card-hover transition-colors duration-200">
                <div className="text-center">
                  <strong className="text-foreground">{formatCNPJ(seguradora.cnpj)}</strong>
                </div>
                <div className="text-center">
                  <strong className="text-foreground">{seguradora.razaoSocial}</strong>
                  {seguradora.nomeFantasia && <div className="text-sm text-muted-foreground">{seguradora.nomeFantasia}</div>}
                </div>
                <div className="text-center">
                  <span className="text-foreground">{seguradora.apolice || 'N/A'}</span>
                </div>
                <div className="text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    seguradora.ativo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {seguradora.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                    onClick={() => abrirModalVisualizacao(seguradora)}
                  >
                    Visualizar
                  </button>
                  <button
                    className="px-3 py-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors duration-200"
                    onClick={() => abrirModalEdicao(seguradora)}
                  >
                    Editar
                  </button>
                  <button
                    className="px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                    onClick={() => abrirModalExclusao(seguradora)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {paginacao && paginacao.totalItems > 0 && (
        <div className="mt-6 bg-card border-t border-border p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {((paginacao.currentPage - 1) * paginacao.pageSize) + 1} até {Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} seguradoras
            </div>

            {paginacao.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaginaAtual(paginacao.currentPage - 1)}
                  disabled={!paginacao.hasPreviousPage}
                  className="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  ← Anterior
                </button>

                <span className="px-4 py-2 text-foreground">
                  Página {paginacao.currentPage} de {paginacao.totalPages}
                </span>

                <button
                  onClick={() => setPaginaAtual(paginacao.currentPage + 1)}
                  disabled={!paginacao.hasNextPage}
                  className="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Próxima →
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
                className="px-3 py-1 border border-border rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <SeguradoraCRUD
        viewModalOpen={modalVisualizacao}
        formModalOpen={modalEdicao}
        deleteModalOpen={modalExclusao}
        selectedSeguradora={seguradoraSelecionada}
        isEdit={!!seguradoraSelecionada}
        onViewClose={fecharModais}
        onFormClose={fecharModais}
        onDeleteClose={fecharModalExclusao}
        onSave={salvarSeguradora}
        onEdit={(seguradora) => abrirModalEdicao(seguradora)}
        onDelete={confirmarExclusao}
        saving={salvando}
        deleting={excludindo}
      />
      </div>
    </div>
  );
}