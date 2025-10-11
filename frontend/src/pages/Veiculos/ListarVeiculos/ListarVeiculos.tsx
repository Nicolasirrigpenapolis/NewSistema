import React, { useState, useEffect } from 'react';
import { VeiculoCRUD } from '../../../components/Veiculos/VeiculoCRUD';
import { entitiesService } from '../../../services/entitiesService';
import Icon from '../../../components/UI/Icon';

import { formatPlaca } from '../../../utils/formatters';
interface Veiculo {
  id?: number;
  placa: string;
  marca?: string;
  tara: number;
  tipoRodado: string;
  tipoCarroceria: string;
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

export function ListarVeiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Estados temporários dos filtros
  const [filtroTemp, setFiltroTemp] = useState('');
  const [filtroTipoTemp, setFiltroTipoTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');
  const [filtroUfTemp, setFiltroUfTemp] = useState('');

  // Estados dos filtros aplicados
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroUf, setFiltroUf] = useState('');

  // Mapeamento de tipo rodado SEFAZ para nome legível
  const getTipoRodadoNome = (codigo: string): string => {
    const tipos: { [key: string]: string } = {
      '01': 'Truck',
      '02': 'Toco',
      '03': 'Cavalo Mecânico',
      '04': 'VAN',
      '05': 'Utilitário',
      '06': 'Outros'
    };
    return tipos[codigo] || `Tipo ${codigo}`;
  };

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  // Estados dos modais CRUD
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [veiculoAtual, setVeiculoAtual] = useState<Veiculo | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Estados de loading
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarVeiculos(paginaAtual, filtro, filtroTipo, filtroStatus, filtroUf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtual, tamanhoPagina, filtro, filtroTipo, filtroStatus, filtroUf]);

  const carregarVeiculos = async (
    pagina: number = paginaAtual,
    busca: string = filtro,
    tipo: string = filtroTipo,
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

      if (tipo) {
        params.append('TipoRodado', tipo);
      }

      if (status) {
        params.append('Status', status === 'ativo' ? 'true' : 'false');
      }

      if (uf) {
        params.append('Uf', uf);
      }

      const response = await fetch(`${API_BASE_URL}/veiculos?${params}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar veículos');
      }

      const data: PaginationData & { items: Veiculo[] } = await response.json();

      setVeiculos(data.items || []);
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
      console.error('Erro ao carregar veículos:', error);
      setVeiculos([]);
      setPaginacao(null);
    } finally {
      setCarregando(false);
    }
  };

  // Handlers dos modais
  const abrirModalNovo = () => {
    setVeiculoAtual(null);
    setModoEdicao(false);
    setModalFormulario(true);
  };

  const abrirModalEdicao = (veiculo: Veiculo) => {
    setVeiculoAtual(veiculo);
    setModoEdicao(true);
    setModalFormulario(true);
  };

  const abrirModalVisualizacao = (veiculo: Veiculo) => {
    setVeiculoAtual(veiculo);
    setModalVisualizacao(true);
  };

  const abrirModalExclusao = (veiculo: Veiculo) => {
    setVeiculoAtual(veiculo);
    setModalExclusao(true);
  };

  const fecharModais = () => {
    setModalVisualizacao(false);
    setModalFormulario(false);
    setModalExclusao(false);
    setVeiculoAtual(null);
    setModoEdicao(false);
  };

  // Handlers de CRUD
  const handleSave = async (dadosVeiculo: Veiculo) => {
    try {
      setSalvando(true);

      const dadosLimpos = {
        ...dadosVeiculo,
        placa: dadosVeiculo.placa.trim().toUpperCase(),
        marca: dadosVeiculo.marca?.trim(),
        uf: dadosVeiculo.uf.toUpperCase()
      };

      let resposta;
      if (modoEdicao && veiculoAtual?.id) {
        resposta = await entitiesService.atualizarVeiculo(veiculoAtual.id, dadosLimpos);
      } else {
        resposta = await entitiesService.criarVeiculo(dadosLimpos);
      }

      if (resposta.sucesso) {
        fecharModais();
        carregarVeiculos();
      } else {
        throw new Error(resposta.mensagem || 'Erro ao salvar veículo');
      }
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      throw error; // Re-throw para que o modal possa mostrar o erro
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async () => {
    if (!veiculoAtual?.id) return;

    try {
      setExcluindo(true);
      const resposta = await entitiesService.excluirVeiculo(veiculoAtual.id);

      if (resposta.sucesso) {
        fecharModais();
        carregarVeiculos();
      } else {
        throw new Error(resposta.mensagem || 'Erro ao excluir veículo');
      }
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      // Aqui você poderia mostrar um toast de erro
    } finally {
      setExcluindo(false);
    }
  };

  const aplicarFiltros = () => {
    setFiltro(filtroTemp);
    setFiltroTipo(filtroTipoTemp);
    setFiltroStatus(filtroStatusTemp);
    setFiltroUf(filtroUfTemp);
    setPaginaAtual(1);
  };

  const limparFiltros = () => {
    setFiltroTemp('');
    setFiltroTipoTemp('');
    setFiltroStatusTemp('');
    setFiltroUfTemp('');
    setFiltro('');
    setFiltroTipo('');
    setFiltroStatus('');
    setFiltroUf('');
    setPaginaAtual(1);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando veículos...</span>
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
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="truck" className="text-white" size="xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Veículos</h1>
              <p className="text-muted-foreground text-lg">Gerencie a frota de veículos para transporte</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={abrirModalNovo}
          >
            <Icon name="plus" size="lg" />
            <span>Novo Veículo</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Placa ou marca..."
                value={filtroTemp}
                onChange={(e) => setFiltroTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
              <select
                value={filtroTipoTemp}
                onChange={(e) => setFiltroTipoTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">Todos os tipos</option>
                <option value="01">Truck</option>
                <option value="02">Toco</option>
                <option value="03">Cavalo Mecânico</option>
                <option value="04">VAN</option>
                <option value="05">Utilitário</option>
                <option value="06">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filtroStatusTemp}
                onChange={(e) => setFiltroStatusTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">UF</label>
              <select
                value={filtroUfTemp}
                onChange={(e) => setFiltroUfTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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
              <button
                onClick={aplicarFiltros}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon name="search" />
                Filtrar
              </button>
            </div>

            <div>
              <button
                onClick={limparFiltros}
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!filtroTemp && !filtroTipoTemp && !filtroStatusTemp && !filtroUfTemp}
              >
                <Icon name="times" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(filtro || filtroTipo || filtroStatus || filtroUf) && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Filtros ativos:
                {filtro && <span className="ml-1 px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded text-xs">{filtro}</span>}
                {filtroTipo && <span className="ml-1 px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded text-xs">Tipo {filtroTipo}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
                {filtroUf && <span className="ml-1 px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded text-xs">{filtroUf}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {veiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="truck" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtro || filtroTipo || filtroStatus || filtroUf) ? 'Nenhum veículo encontrado com os filtros aplicados' : 'Nenhum veículo encontrado'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtro || filtroTipo || filtroStatus || filtroUf) ? 'Tente ajustar os filtros ou limpar para ver todos os veículos.' : 'Adicione um novo veículo para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-6 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div className="text-center">Placa</div>
                <div className="text-center">Veículo</div>
                <div className="text-center">Tipo</div>
                <div className="text-center">Localização</div>
                <div className="text-center">Status</div>
                <div className="text-center">Ações</div>
              </div>

              {veiculos.map((veiculo) => (
                <div key={veiculo.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{formatPlaca(veiculo.placa)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{veiculo.marca || 'Não informado'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tara: {veiculo.tara?.toLocaleString() || '0'}kg</div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      {getTipoRodadoNome(veiculo.tipoRodado)}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{veiculo.uf}</div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-sm font-semibold ${
                      veiculo.ativo
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {veiculo.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirModalVisualizacao(veiculo)}
                      title="Visualizar"
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirModalEdicao(veiculo)}
                      title="Editar"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirModalExclusao(veiculo)}
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
                Mostrando {paginacao.startItem || ((paginacao.currentPage - 1) * paginacao.pageSize) + 1} até {paginacao.endItem || Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} veículos
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

        {/* Modais CRUD */}
        <VeiculoCRUD
          viewModalOpen={modalVisualizacao}
          formModalOpen={modalFormulario}
          deleteModalOpen={modalExclusao}
          selectedVeiculo={veiculoAtual}
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