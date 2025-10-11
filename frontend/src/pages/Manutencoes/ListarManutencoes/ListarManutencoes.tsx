import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/UI/Icon';
import { Button } from '../../../components/UI/button';
import { manutencoesService, ManutencaoListItem } from '../../../services/manutencoesService';

interface Paginacao {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function ListarManutencoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [manutencoes, setManutencoes] = useState<ManutencaoListItem[]>([]);

  const [filtros, setFiltros] = useState({ page: 1, pageSize: 10, sortBy: 'dataManutencao', sortDirection: 'desc' });

  const [paginacao, setPaginacao] = useState<Paginacao>({ totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10, hasNextPage: false, hasPreviousPage: false });

  const carregar = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await manutencoesService.getManutencoes(filtros);

      if (response.success && response.data) {
        setManutencoes(response.data.items);
        setPaginacao({
          totalItems: response.data.totalItems,
          totalPages: response.data.totalPages,
          currentPage: response.data.page,
          pageSize: response.data.pageSize,
          hasNextPage: response.data.hasNextPage,
          hasPreviousPage: response.data.hasPreviousPage
        });
      } else {
        setError(response.message || 'Erro ao carregar manutenções');
      }
    } catch (err) {
      setError('Erro inesperado ao carregar manutenções');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [filtros]);

  const handlePageChange = (newPage: number) => {
    setFiltros(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta manutenção?')) return;
    try {
      const res = await manutencoesService.deleteManutencao(id);
      if (res.success) await carregar();
      else setError(res.message || 'Erro ao excluir');
    } catch (err) {
      setError('Erro inesperado ao excluir');
      console.error(err);
    }
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
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Icon name="wrench" className="text-white" size="xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ordens de Serviço</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie as ordens de serviço de manutenção.</p>
          </div>
        </div>
        <Button onClick={() => navigate('/manutencoes/novo')} className="flex items-center gap-2">
          <Icon name="plus" size="sm" />
          Nova Ordem
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Veículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-gray-200 dark:divide-gray-700">
              {manutencoes.map(m => (
                <tr key={m.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(m.dataManutencao).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{m.veiculoPlaca} <div className="text-sm text-gray-500">{m.veiculoMarca}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">{m.descricao}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{m.fornecedorNome || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">{manutencoesService ? manutencoesService.formatCurrency(m.valorTotal) : m.valorTotal.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/manutencoes/editar/${m.id}`)}>
                        <Icon name="edit" size="sm" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        <Icon name="trash" size="sm" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {manutencoes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <Icon name="inbox" size="lg" className="mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Nenhuma manutenção encontrada</p>
                      <p className="text-sm">Tente ajustar os filtros ou adicione uma nova ordem de serviço.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {paginacao.totalPages > 1 && (
          <div className="bg-card px-4 py-3 border-t border-border mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">Mostrando {(paginacao.currentPage - 1) * paginacao.pageSize + 1} até {Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} registros</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(paginacao.currentPage - 1)} disabled={!paginacao.hasPreviousPage}>
                  <Icon name="chevron-left" size="sm" />
                  Anterior
                </Button>

                <span className="text-sm text-gray-700 dark:text-gray-300">Página {paginacao.currentPage} de {paginacao.totalPages}</span>

                <Button variant="outline" size="sm" onClick={() => handlePageChange(paginacao.currentPage + 1)} disabled={!paginacao.hasNextPage}>
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

export default ListarManutencoes;
