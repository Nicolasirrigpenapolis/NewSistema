import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Label, Icon } from '../../../ui';
// Using native <select> instead of removed components
import { fornecedoresService, FornecedorListDto, FornecedorFiltros } from '../../../services/fornecedoresService';

interface Paginacao {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function ListarFornecedores() {
  const navigate = useNavigate();
  const [fornecedores, setFornecedores] = useState<FornecedorListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FornecedorFiltros>({
    page: 1,
    pageSize: 10,
    sortBy: 'nome',
    sortDirection: 'asc'
  });

  const [paginacao, setPaginacao] = useState<Paginacao>({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const carregarFornecedores = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fornecedoresService.getFornecedores(filtros);

      if (response.success && response.data) {
        setFornecedores(response.data.items);
        setPaginacao({
          totalItems: response.data.totalItems,
          totalPages: response.data.totalPages,
          currentPage: response.data.page,
          pageSize: response.data.pageSize,
          hasNextPage: response.data.hasNextPage,
          hasPreviousPage: response.data.hasPreviousPage
        });
      } else {
        setError(response.message || 'Erro ao carregar fornecedores');
      }
    } catch (err) {
      setError('Erro inesperado ao carregar fornecedores');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, [filtros]);

  const handleFiltroChange = (campo: keyof FornecedorFiltros, valor: any) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      page: 1 // Reset page when filtering
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFiltros(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleEdit = (id: number) => {
    navigate(`/fornecedores/${id}/editar`);
  };

  const handleDelete = async (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o fornecedor "${nome}"?`)) {
      try {
        const response = await fornecedoresService.deleteFornecedor(id);

        if (response.success) {
          await carregarFornecedores();
        } else {
          setError(response.message || 'Erro ao excluir fornecedor');
        }
      } catch (err) {
        setError('Erro inesperado ao excluir fornecedor');
        console.error('Erro:', err);
      }
    }
  };

  const limparFiltros = () => {
    setFiltros({
      page: 1,
      pageSize: 10,
      sortBy: 'nome',
      sortDirection: 'asc',
      nome: undefined,
      cnpjCpf: undefined,
      tipoPessoa: undefined,
      ativo: undefined
    });
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Icon name="briefcase" className="text-white" size="xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Fornecedores
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie os fornecedores para manutenções
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/fornecedores/novo')}
          className="flex items-center gap-2"
        >
          <Icon name="plus" size="sm" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-card dark:bg-card rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="filtro-nome">Nome</Label>
            <Input
              id="filtro-nome"
              value={filtros.nome || ''}
              onChange={(e) => handleFiltroChange('nome', e.target.value)}
              placeholder="Buscar por nome..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filtro-cnpj">CNPJ/CPF</Label>
            <Input
              id="filtro-cnpj"
              value={filtros.cnpjCpf || ''}
              onChange={(e) => handleFiltroChange('cnpjCpf', e.target.value)}
              placeholder="Digite CNPJ ou CPF..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filtro-tipo">Tipo</Label>
            <select
              id="filtro-tipo"
              value={filtros.tipoPessoa || 'todos'}
              onChange={(e) => handleFiltroChange('tipoPessoa', e.target.value === 'todos' ? undefined : e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="F">Pessoa Física</option>
              <option value="J">Pessoa Jurídica</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filtro-status">Status</Label>
            <select
              id="filtro-status"
              value={filtros.ativo?.toString() || 'todos'}
              onChange={(e) => handleFiltroChange('ativo', e.target.value === 'todos' ? undefined : e.target.value === 'true')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {paginacao.totalItems} fornecedor(es) encontrado(s)
          </span>

          <Button
            variant="outline"
            onClick={limparFiltros}
            size="sm"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CNPJ/CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cidade/UF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700">
              {fornecedores.map((fornecedor) => (
                <tr key={fornecedor.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {fornecedor.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {fornecedoresService.formatDocument(fornecedor.cnpjCpf, fornecedor.tipoPessoa as 'F' | 'J')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      fornecedor.tipoPessoa === 'F'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {fornecedor.tipoPessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {fornecedor.telefone ? fornecedoresService.formatTelefone(fornecedor.telefone) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {fornecedor.cidade && fornecedor.uf ? `${fornecedor.cidade}/${fornecedor.uf}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      fornecedor.ativo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(fornecedor.id)}
                      >
                        <Icon name="edit" size="sm" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(fornecedor.id, fornecedor.nome)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Icon name="trash" size="sm" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {fornecedores.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Icon name="inbox" size="lg" className="mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Nenhum fornecedor encontrado</p>
                      <p className="text-sm">Tente ajustar os filtros ou adicione um novo fornecedor.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {paginacao.totalPages > 1 && (
          <div className="bg-card px-4 py-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando {(paginacao.currentPage - 1) * paginacao.pageSize + 1} até{' '}
                  {Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de{' '}
                  {paginacao.totalItems} registros
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginacao.currentPage - 1)}
                  disabled={!paginacao.hasPreviousPage}
                >
                  <Icon name="chevron-left" size="sm" />
                  Anterior
                </Button>

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Página {paginacao.currentPage} de {paginacao.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginacao.currentPage + 1)}
                  disabled={!paginacao.hasNextPage}
                >
                  Próxima
                  <Icon name="chevron-right" size="sm" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}