import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/UI/Icon';
import { Icon as ThemedIcon } from '../../../ui';
import { GenericViewModal } from '../../../components/UI/feedback/GenericViewModal';
import { fornecedoresService, FornecedorListDto, FornecedorFiltros, Fornecedor } from '../../../services/fornecedoresService';
import { fornecedorConfig } from '../../../components/Fornecedores/FornecedorConfig';

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

export function ListarFornecedores() {
  const navigate = useNavigate();
  const [fornecedores, setFornecedores] = useState<FornecedorListDto[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Estados temporários dos filtros
  const [filtroNomeTemp, setFiltroNomeTemp] = useState('');
  const [filtroCnpjCpfTemp, setFiltroCnpjCpfTemp] = useState('');
  const [filtroTipoTemp, setFiltroTipoTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');

  // Estados dos filtros aplicados
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCnpjCpf, setFiltroCnpjCpf] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  // Estados dos modais
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [fornecedorAtual, setFornecedorAtual] = useState<Fornecedor | null>(null);

  useEffect(() => {
    carregarFornecedores(paginaAtual, filtroNome, filtroCnpjCpf, filtroTipo, filtroStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtual, tamanhoPagina, filtroNome, filtroCnpjCpf, filtroTipo, filtroStatus]);

  const carregarFornecedores = async (
    pagina: number = paginaAtual,
    nome: string = filtroNome,
    cnpjCpf: string = filtroCnpjCpf,
    tipo: string = filtroTipo,
    status: string = filtroStatus
  ) => {
    try {
      setCarregando(true);

      const filtros: FornecedorFiltros = {
        page: pagina,
        pageSize: tamanhoPagina,
        sortBy: 'nome',
        sortDirection: 'asc'
      };

      if (nome.trim()) {
        filtros.nome = nome.trim();
      }

      if (cnpjCpf.trim()) {
        filtros.cnpjCpf = cnpjCpf.trim();
      }

      if (tipo) {
        filtros.tipoPessoa = tipo;
      }

      if (status) {
        filtros.ativo = status === 'ativo';
      }

      const response = await fornecedoresService.getFornecedores(filtros);

      if (response.success && response.data) {
        setFornecedores(response.data.items);
        setPaginacao({
          totalItems: response.data.totalItems,
          totalPages: response.data.totalPages,
          currentPage: response.data.page,
          pageSize: response.data.pageSize,
          hasNextPage: response.data.hasNextPage,
          hasPreviousPage: response.data.hasPreviousPage,
          startItem: (response.data.page - 1) * response.data.pageSize + 1,
          endItem: Math.min(response.data.page * response.data.pageSize, response.data.totalItems)
        });
      } else {
        setFornecedores([]);
        setPaginacao(null);
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      setFornecedores([]);
      setPaginacao(null);
    } finally {
      setCarregando(false);
    }
  };

  const abrirNovo = () => navigate('/fornecedores/novo');

  const abrirEdicao = (id: number) => {
    navigate(`/fornecedores/${id}/editar`);
  };

  const abrirModalVisualizacao = async (fornecedor: FornecedorListDto) => {
    try {
      const response = await fornecedoresService.getFornecedorById(fornecedor.id);
      if (response.success && response.data) {
        setFornecedorAtual(response.data);
        setModalVisualizacao(true);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do fornecedor:', error);
    }
  };

  const fecharModais = () => {
    setModalVisualizacao(false);
    setFornecedorAtual(null);
  };

  const handleDelete = async (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o fornecedor "${nome}"?`)) {
      try {
        const response = await fornecedoresService.deleteFornecedor(id);

        if (response.success) {
          await carregarFornecedores();
        } else {
          console.error(response.message || 'Erro ao excluir fornecedor');
        }
      } catch (err) {
        console.error('Erro inesperado ao excluir fornecedor:', err);
      }
    }
  };

  const aplicarFiltros = () => {
    setFiltroNome(filtroNomeTemp);
    setFiltroCnpjCpf(filtroCnpjCpfTemp);
    setFiltroTipo(filtroTipoTemp);
    setFiltroStatus(filtroStatusTemp);
    setPaginaAtual(1);
  };

  const limparFiltros = () => {
    setFiltroNomeTemp('');
    setFiltroCnpjCpfTemp('');
    setFiltroTipoTemp('');
    setFiltroStatusTemp('');
    setFiltroNome('');
    setFiltroCnpjCpf('');
    setFiltroTipo('');
    setFiltroStatus('');
    setPaginaAtual(1);
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando fornecedores...</span>
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
            <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-blue-900/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600" aria-hidden="true" />
              <span className="absolute inset-0 opacity-40 blur-lg bg-blue-800" aria-hidden="true" />
              <div className="relative h-full w-full flex items-center justify-center">
                <ThemedIcon name="building" className="text-white text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Fornecedores</h1>
              <p className="text-muted-foreground text-lg">Gerencie os fornecedores para manutenções</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-950 hover:to-blue-900 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={abrirNovo}
          >
            <Icon name="plus" size="lg" />
            <span>Novo Fornecedor</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={filtroNomeTemp}
                onChange={(e) => setFiltroNomeTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">CNPJ/CPF</label>
              <input
                type="text"
                placeholder="Digite CNPJ ou CPF..."
                value={filtroCnpjCpfTemp}
                onChange={(e) => setFiltroCnpjCpfTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
              <select
                value={filtroTipoTemp}
                onChange={(e) => setFiltroTipoTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              >
                <option value="">Todos os tipos</option>
                <option value="F">Pessoa Física</option>
                <option value="J">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filtroStatusTemp}
                onChange={(e) => setFiltroStatusTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <button
                onClick={aplicarFiltros}
                className="w-full px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon name="search" />
                Filtrar
              </button>
            </div>

            <div>
              <button
                onClick={limparFiltros}
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!filtroNomeTemp && !filtroCnpjCpfTemp && !filtroTipoTemp && !filtroStatusTemp}
              >
                <Icon name="times" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(filtroNome || filtroCnpjCpf || filtroTipo || filtroStatus) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-blue-900 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Filtros ativos:
                {filtroNome && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtroNome}</span>}
                {filtroCnpjCpf && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtroCnpjCpf}</span>}
                {filtroTipo && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtroTipo === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {fornecedores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="building" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtroNome || filtroCnpjCpf || filtroTipo || filtroStatus) ? 'Nenhum fornecedor encontrado com os filtros aplicados' : 'Nenhum fornecedor encontrado'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtroNome || filtroCnpjCpf || filtroTipo || filtroStatus) ? 'Tente ajustar os filtros ou limpar para ver todos os fornecedores.' : 'Adicione um novo fornecedor para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div className="text-center">Nome</div>
                <div className="text-center">CNPJ/CPF</div>
                <div className="text-center">Tipo</div>
                <div className="text-center">Telefone</div>
                <div className="text-center">Cidade/UF</div>
                <div className="text-center">Status</div>
                <div className="text-center">Ações</div>
              </div>

              {fornecedores.map((fornecedor) => (
                <div key={fornecedor.id} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{fornecedor.nome}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {fornecedoresService.formatDocument(fornecedor.cnpjCpf, fornecedor.tipoPessoa as 'F' | 'J')}
                    </div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-400">
                      {fornecedor.tipoPessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {fornecedor.telefone ? fornecedoresService.formatTelefone(fornecedor.telefone) : '-'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">
                      {fornecedor.cidade && fornecedor.uf ? `${fornecedor.cidade}/${fornecedor.uf}` : '-'}
                    </div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-sm font-semibold ${
                      fornecedor.ativo
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirModalVisualizacao(fornecedor)}
                      title="Visualizar"
                    >
                      <Icon name="eye" />
                    </button>
                    <button
                      className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => abrirEdicao(fornecedor.id)}
                      title="Editar"
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                      onClick={() => handleDelete(fornecedor.id, fornecedor.nome)}
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
                Mostrando {paginacao.startItem || ((paginacao.currentPage - 1) * paginacao.pageSize) + 1} até {paginacao.endItem || Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} fornecedores
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
                  className="px-3 py-1 border border-gray-300 dark:border-0 rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
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

      {/* Modal de visualização */}
      <GenericViewModal
        isOpen={modalVisualizacao}
        onClose={fecharModais}
        item={fornecedorAtual}
        title={fornecedorConfig.view.title}
        subtitle={fornecedorConfig.view.subtitle}
        headerIcon={fornecedorConfig.view.headerIcon}
        headerColor={fornecedorConfig.view.headerColor}
        sections={fornecedorAtual ? fornecedorConfig.view.getSections(fornecedorAtual) : []}
        actions={
          fornecedorAtual
            ? [
                {
                  label: 'Editar Fornecedor',
                  icon: 'edit',
                  variant: 'warning' as const,
                  onClick: () => {
                    fecharModais();
                    abrirEdicao(fornecedorAtual.id);
                  }
                }
              ]
            : []
        }
        statusConfig={
          fornecedorAtual
            ? {
                value: fornecedorAtual.ativo ? 'Fornecedor Ativo' : 'Fornecedor Inativo',
                color: fornecedorAtual.ativo ? '#10b981' : '#ef4444',
                bgColor: fornecedorAtual.ativo ? '#d1fae5' : '#fee2e2',
                textColor: fornecedorAtual.ativo ? '#065f46' : '#991b1b'
              }
            : undefined
        }
        idField={fornecedorConfig.view.idField}
      />
    </div>
  );
}