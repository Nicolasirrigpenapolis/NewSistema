import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCNPJ, formatCPF } from '../../../utils/formatters';
import { entitiesService } from '../../../services/entitiesService';
import { buildCommonHeaders } from '../../../services/api';
import Icon from '../../../components/UI/Icon';
import { Icon as ThemedIcon } from '../../../ui';
import { GenericViewModal } from '../../../components/UI/feedback/GenericViewModal';
import { ConfirmDeleteModal } from '../../../components/UI/feedback/ConfirmDeleteModal';
import { contratanteConfig } from '../../../components/Contratantes/ContratanteConfig';

interface Contratante {
  id?: number;
  cnpj?: string;
  cpf?: string;
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

export function ListarContratantes() {
  const navigate = useNavigate();
  const [contratantes, setContratantes] = useState<Contratante[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [filtroTemp, setFiltroTemp] = useState('');
  const [filtroTipoTemp, setFiltroTipoTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');
  const [filtroUfTemp, setFiltroUfTemp] = useState('');

  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroUf, setFiltroUf] = useState('');

  // Estados para pagina+�+�o
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  // Estados para visualiza��o e exclus�o
  const [contratanteVisualizacao, setContratanteVisualizacao] = useState<Contratante | null>(null);
  const [contratanteExclusao, setContratanteExclusao] = useState<Contratante | null>(null);
  const [excluindo, setExcluindo] = useState(false);



  useEffect(() => {
    carregarContratantes();
  }, [paginaAtual, tamanhoPagina, filtro, filtroTipo, filtroStatus, filtroUf]);

  const carregarContratantes = async () => {
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

      const response = await fetch(`${API_BASE_URL}/contratantes?${params}`, {
        headers: buildCommonHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const contratantesMapeados: Contratante[] = (data.itens || data.items || data.Itens || []).map((contratante: any) => ({
        id: contratante.id || contratante.Id,
        cnpj: contratante.cnpj || contratante.Cnpj,
        cpf: contratante.cpf || contratante.Cpf,
        razaoSocial: contratante.razaoSocial || contratante.RazaoSocial,
        nomeFantasia: contratante.nomeFantasia || contratante.NomeFantasia,
        endereco: contratante.endereco || contratante.Endereco,
        numero: contratante.numero || contratante.Numero,
        complemento: contratante.complemento || contratante.Complemento,
        bairro: contratante.bairro || contratante.Bairro,
        codMunicipio: contratante.codMunicipio || contratante.CodMunicipio,
        municipio: contratante.municipio || contratante.Municipio,
        cep: contratante.cep || contratante.Cep,
        uf: contratante.uf || contratante.Uf,
        ativo: contratante.ativo !== undefined ? contratante.ativo : (contratante.Ativo !== undefined ? contratante.Ativo : true)
      }));

      setContratantes(contratantesMapeados);
      setPaginacao({
        totalItems: data.totalItens || data.totalItems || data.TotalItens || contratantesMapeados.length,
        totalPages: data.totalPaginas || data.totalPages || data.TotalPaginas || 1,
        currentPage: data.pagina || data.currentPage || data.Pagina || 1,
        pageSize: data.tamanhoPagina || data.pageSize || data.TamanhoPagina || 10,
        hasNextPage: data.temProximaPagina || data.hasNextPage || data.TemProxima || false,
        hasPreviousPage: data.temPaginaAnterior || data.hasPreviousPage || data.TemAnterior || false,
        startItem: data.startItem || 1,
        endItem: data.endItem || contratantesMapeados.length
      });
    } catch (error) {
      console.error('Erro ao carregar contratantes:', error);
      setContratantes([]);
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

    const abrirVisualizacao = (contratante: Contratante) => {
    setContratanteVisualizacao(contratante);
  };

  const navegarParaNovo = () => {
    navigate('/contratantes/novo');
  };

  const navegarParaEdicao = (contratante: Contratante) => {
    if (!contratante.id) {
      navigate('/contratantes/novo');
      return;
    }

    navigate(`/contratantes/${contratante.id}/editar`, { state: { contratante } });
  };

  const abrirModalExclusao = (contratante: Contratante) => {
    setContratanteExclusao(contratante);
  };

  const fecharModais = () => {
    setContratanteVisualizacao(null);
    setContratanteExclusao(null);
  };

  const handleDelete = async () => {
    if (!contratanteExclusao?.id) return;

    try {
      setExcluindo(true);

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/contratantes/${contratanteExclusao.id}`, {
        method: 'DELETE',
        headers: buildCommonHeaders()
      });

      if (!response.ok) {
        throw new Error('Erro ao desativar contratante');
      }

      fecharModais();
      carregarContratantes();
    } catch (error) {
      console.error('Erro ao desativar contratante:', error);
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

  const tipoContratante = (contratante: Contratante) => {
    return contratante.cnpj ? 'PJ' : 'PF';
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando contratantes...</span>
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
            <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-red-600/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-red-500 dark:from-red-600 dark:via-red-500 dark:to-red-400" aria-hidden="true" />
              <span className="absolute inset-0 opacity-40 blur-lg bg-red-600" aria-hidden="true" />
              <div className="relative h-full w-full flex items-center justify-center">
                <ThemedIcon name="handshake" className="!text-white text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Contratantes</h1>
              <p className="text-muted-foreground text-lg">Gerencie os contratantes cadastrados no sistema</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={navegarParaNovo}
          >
            <Icon name="plus" size="lg" />
            <span>Novo Contratante</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-6 gap-4 items-end">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Razão social, CNPJ ou CPF..."
                value={filtroTemp}
                onChange={(e) => setFiltroTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
              <select
                value={filtroTipoTemp}
                onChange={(e) => setFiltroTipoTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              >
                <option value="">Todos os tipos</option>
                <option value="PJ">Pessoa Jurídica</option>
                <option value="PF">Pessoa Física</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">UF</label>
              <select
                value={filtroUfTemp}
                onChange={(e) => setFiltroUfTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={aplicarFiltros}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon name="search" />
                Filtrar
              </button>
              <button
                onClick={limparFiltros}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!filtroTemp && !filtroTipoTemp && !filtroStatusTemp && !filtroUfTemp}
                title="Limpar filtros"
              >
                <Icon name="times" />
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(filtro || filtroTipo || filtroStatus || filtroUf) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-red-700 dark:text-red-400" />
              <span className="text-sm font-medium text-red-800 dark:text-red-300">
                Filtros ativos:
                {filtro && <span className="ml-1 px-2 py-1 bg-red-100 dark:bg-red-800 rounded text-xs">{filtro}</span>}
                {filtroTipo && <span className="ml-1 px-2 py-1 bg-red-100 dark:bg-red-800 rounded text-xs">{filtroTipo}</span>}
                {filtroUf && <span className="ml-1 px-2 py-1 bg-red-100 dark:bg-red-800 rounded text-xs">{filtroUf}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-red-100 dark:bg-red-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {contratantes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="handshake" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtro || filtroTipo || filtroStatus || filtroUf) ? 'Nenhum contratante encontrado com os filtros aplicados' : 'Nenhum contratante encontrado'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtro || filtroTipo || filtroStatus || filtroUf) ? 'Tente ajustar os filtros ou limpar para ver todos os contratantes.' : 'Adicione um novo contratante para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-6 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div className="text-center">CNPJ/CPF</div>
                <div className="text-center">Razão Social</div>
                <div className="text-center">Tipo</div>
                <div className="text-center">Localização</div>
                <div className="text-center">Status</div>
                <div className="text-center">Ações</div>
              </div>

              {contratantes.map((contratante) => (
                <div key={contratante.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {contratante.cnpj ? formatCNPJ(contratante.cnpj) : formatCPF(contratante.cpf || '')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{contratante.razaoSocial}</div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className="text-sm font-semibold text-foreground">
                      {tipoContratante(contratante)}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{contratante.municipio}/{contratante.uf}</div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-sm font-semibold ${
                      contratante.ativo
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {contratante.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirVisualizacao(contratante)}
                      title="Visualizar"
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => navegarParaEdicao(contratante)}
                      title="Editar"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirModalExclusao(contratante)}
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
                Mostrando {paginacao.startItem || ((paginacao.currentPage - 1) * paginacao.pageSize) + 1} até {paginacao.endItem || Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} contratantes
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
                  className="px-3 py-1 border border-gray-300 dark:border-0 rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
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
          isOpen={!!contratanteVisualizacao}
          onClose={fecharModais}
          item={contratanteVisualizacao}
          title={contratanteConfig.view.title}
          subtitle={contratanteConfig.view.subtitle}
          headerIcon={contratanteConfig.view.headerIcon}
          headerColor={contratanteConfig.view.headerColor}
          sections={contratanteVisualizacao ? contratanteConfig.view.getSections(contratanteVisualizacao) : []}
          actions={
            contratanteVisualizacao
              ? [
                  {
                    label: 'Editar Contratante',
                    icon: 'edit',
                    variant: 'warning' as const,
                    onClick: () => {
                      fecharModais();
                      navegarParaEdicao(contratanteVisualizacao);
                    }
                  }
                ]
              : []
          }
          statusConfig={contratanteVisualizacao ? contratanteConfig.view.getStatusConfig?.(contratanteVisualizacao) : undefined}
          idField={contratanteConfig.view.idField}
        />

        {/* Modal de exclusão */}
        <ConfirmDeleteModal
          isOpen={!!contratanteExclusao}
          title="Desativar Contratante"
          message="Tem certeza de que deseja desativar este contratante? Ele não será mais exibido nas listagens."
          itemName={contratanteExclusao ? `${contratanteExclusao.razaoSocial}${contratanteExclusao.cnpj ? ` (${formatCNPJ(contratanteExclusao.cnpj)})` : contratanteExclusao.cpf ? ` (${formatCPF(contratanteExclusao.cpf)})` : ''}` : ''}
          onConfirm={handleDelete}
          onClose={fecharModais}
          loading={excluindo}
        />
      </div>
    </div>
  );
}

