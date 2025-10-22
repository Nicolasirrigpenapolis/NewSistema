import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCNPJ, formatCPF } from '../../../utils/formatters';
import { entitiesService } from '../../../services/entitiesService';
import { buildCommonHeaders } from '../../../services/api';
import Icon from '../../../components/UI/Icon';
import { GenericViewModal } from '../../../components/UI/feedback/GenericViewModal';
import { ConfirmDeleteModal } from '../../../components/UI/feedback/ConfirmDeleteModal';
import { emitenteConfig } from '../../../components/Emitentes/EmitenteConfig';

interface Emitente {
  id?: number;
  cnpj?: string;
  cpf?: string;
  ie?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  codMunicipio: number;
  municipio: string;
  cep: string;
  uf: string;
  ativo?: boolean;
  tipoEmitente: string;
  caminhoSalvarXml?: string;
  rntrc?: string;
  caminhoCertificadoDigital?: string;
  senhaCertificadoDigital?: string;
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

export function ListarEmitentes() {
  const [emitentes, setEmitentes] = useState<Emitente[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Estados temporÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡rios dos filtros (antes de aplicar)
  const [filtroTemp, setFiltroTemp] = useState('');
  const [filtroTipoTemp, setFiltroTipoTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');
  const [filtroUfTemp, setFiltroUfTemp] = useState('');

  // Estados dos filtros aplicados
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroUf, setFiltroUf] = useState('');

  // Estados para paginaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  // Estados dos modais CRUD
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [emitenteAtual, setEmitenteAtual] = useState<Emitente | null>(null);
  const navigate = useNavigate();

  // Estados de loading
  const [excluindo, setExcluindo] = useState(false);
  useEffect(() => {
    carregarEmitentes(paginaAtual, filtro, filtroTipo, filtroStatus, filtroUf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtual, tamanhoPagina, filtro, filtroTipo, filtroStatus, filtroUf]);

  const carregarEmitentes = async (
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
        params.append('TipoEmitente', tipo);
      }

      if (status) {
        params.append('Status', status === 'ativo' ? 'true' : 'false');
      }

      if (uf) {
        params.append('Uf', uf);
      }

      const response = await fetch(`${API_BASE_URL}/emitentes?${params}`, {
        headers: buildCommonHeaders()
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar emitentes');
      }

      const data: PaginationData & { items: Emitente[] } = await response.json();

      setEmitentes(data.items || []);
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
      console.error('Erro ao carregar emitentes:', error);
      setEmitentes([]);
      setPaginacao(null);
    } finally {
      setCarregando(false);
    }
  };

  // AÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes auxiliares
  const abrirNovo = () => {
    navigate('/emitentes/novo');
  };

  const abrirEdicao = (emitente: Emitente) => {
    if (emitente.id) {
      navigate(`/emitentes/${emitente.id}/editar`, { state: { emitente } });
    } else {
      navigate('/emitentes/novo');
    }
  };

  const abrirVisualizacao = async (emitente: Emitente) => {
    try {
      const resposta = await entitiesService.buscarEmitentePorId(emitente.id!);
      if (resposta.sucesso && resposta.dados) {
        setEmitenteAtual(resposta.dados);
      } else {
        setEmitenteAtual(emitente);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do emitente:', error);
      setEmitenteAtual(emitente);
    }
    setModalVisualizacao(true);
  };

  const abrirExclusao = (emitente: Emitente) => {
    setEmitenteAtual(emitente);
    setModalExclusao(true);
  };

  const fecharModais = () => {
    setModalVisualizacao(false);
    setModalExclusao(false);
    setEmitenteAtual(null);
  };
  const handleDelete = async () => {
    if (!emitenteAtual?.id) return;

    try {
      setExcluindo(true);
      const resposta = await entitiesService.excluirEmitente(emitenteAtual.id);

      if (resposta.sucesso) {
        fecharModais();
        carregarEmitentes();
      } else {
        throw new Error(resposta.mensagem || 'Erro ao excluir emitente');
      }
    } catch (error) {
      console.error('Erro ao excluir emitente:', error);
      // Aqui vocÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª poderia mostrar um toast de erro
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
        <div className="w-full py-4">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando emitentes...</span>
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
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="building" className="text-white" size="xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Emitentes</h1>
              <p className="text-muted-foreground text-lg">Gerencie as empresas emissoras de MDF-e</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={abrirNovo}
          >
            <Icon name="plus" size="lg" />
            <span>Novo Emitente</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
              <input
                type="text"
                placeholder="RazÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o social ou CNPJ..."
                value={filtroTemp}
                onChange={(e) => setFiltroTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
              <select
                value={filtroTipoTemp}
                onChange={(e) => setFiltroTipoTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Todos os tipos</option>
                <option value="PrestadorServico">Prestador de ServiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§o</option>
                <option value="EntregaPropria">Entrega PrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³pria</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filtroStatusTemp}
                onChange={(e) => setFiltroStatusTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Filtros ativos:
                {filtro && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtro}</span>}
                {filtroTipo && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtroTipo === 'PrestadorServico' ? 'Prestador' : 'Entrega PrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³pria'}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
                {filtroUf && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtroUf}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {emitentes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="building" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtro || filtroTipo || filtroStatus || filtroUf) ? 'Nenhum emitente encontrado com os filtros aplicados' : 'Nenhum emitente encontrado'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtro || filtroTipo || filtroStatus || filtroUf) ? 'Tente ajustar os filtros ou limpar para ver todos os emitentes.' : 'Adicione um novo emitente para comeÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-6 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div className="text-center">Documento</div>
                <div className="text-center">Empresa</div>
                <div className="text-center">Tipo</div>
                <div className="text-center">LocalizaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o</div>
                <div className="text-center">Status</div>
                <div className="text-center">AÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes</div>
              </div>

              {emitentes.map((emitente) => (
                <div key={emitente.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {emitente.cnpj ? formatCNPJ(emitente.cnpj) :
                       emitente.cpf ? formatCPF(emitente.cpf) :
                       'NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o informado'}
                    </div>
                    {emitente.ie && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">IE: {emitente.ie}</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{emitente.razaoSocial}</div>
                    {emitente.nomeFantasia && (
                      <div className="text-sm text-muted-foreground">{emitente.nomeFantasia}</div>
                    )}
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-sm font-semibold ${
                      emitente.tipoEmitente === 'PrestadorServico'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {emitente.tipoEmitente === 'PrestadorServico' ? 'Prestador' : 'Entrega PrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³pria'}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground text-sm">
                      {emitente.endereco ? `${emitente.endereco}${emitente.numero ? ', ' + emitente.numero : ''}` : 'NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o informado'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {emitente.bairro ? `${emitente.bairro}, ` : ''}{emitente.municipio || 'NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o informado'}/{emitente.uf}
                    </div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-sm font-semibold ${
                      emitente.ativo
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {emitente.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirVisualizacao(emitente)}
                      title="Visualizar"
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirEdicao(emitente)}
                      title="Editar"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      onClick={() => abrirExclusao(emitente)}
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

        {/* PaginaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o */}
        {paginacao && paginacao.totalItems > 0 && (
          <div className="mt-6 bg-card border-t border-gray-200 dark:border-0 p-4 rounded-b-lg">
            <div className="flex flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground text-left">
                Mostrando {paginacao.startItem || ((paginacao.currentPage - 1) * paginacao.pageSize) + 1} atÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© {paginacao.endItem || Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} emitentes
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
                    PrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³xima
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="text-sm text-foreground">Itens por pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡gina:</label>
                <select
                  value={tamanhoPagina}
                  onChange={(e) => {
                    setTamanhoPagina(Number(e.target.value));
                    setPaginaAtual(1);
                  }}
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

        {/* Modal de visualizaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o */}
        <GenericViewModal
          isOpen={modalVisualizacao}
          onClose={fecharModais}
          item={emitenteAtual}
          title={emitenteConfig.view.title}
          subtitle={emitenteConfig.view.subtitle}
          headerIcon={emitenteConfig.view.headerIcon}
          headerColor={emitenteConfig.view.headerColor}
          sections={emitenteAtual ? emitenteConfig.view.getSections(emitenteAtual) : []}
          actions={
            emitenteAtual
              ? [
                  {
                    label: 'Editar Emitente',
                    icon: 'edit',
                    variant: 'warning' as const,
                    onClick: () => {
                      fecharModais();
                      abrirEdicao(emitenteAtual);
                    }
                  }
                ]
              : []
          }
          statusConfig={emitenteAtual ? emitenteConfig.view.getStatusConfig?.(emitenteAtual) : undefined}
          idField={emitenteConfig.view.idField}
        />

        {/* Modal de exclusÃƒÆ’Ã‚Â£o */}
        <ConfirmDeleteModal
          isOpen={modalExclusao}
          title="Excluir Emitente"
          message="Tem certeza de que deseja excluir este emitente?"
          itemName={emitenteAtual ? `${emitenteAtual.razaoSocial}${emitenteAtual.cnpj ? ` (${formatCNPJ(emitenteAtual.cnpj)})` : emitenteAtual.cpf ? ` (${formatCPF(emitenteAtual.cpf)})` : ''}` : ''}
          onConfirm={handleDelete}
          onClose={() => {
            setModalExclusao(false);
            setEmitenteAtual(null);
            setExcluindo(false);
          }}
          loading={excluindo}
        />
      </div>
    </div>
  );
}










