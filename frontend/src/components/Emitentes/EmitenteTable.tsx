import React, { memo } from 'react';
import { Emitente } from '../../types/emitente';
import { formatCNPJ, formatCPF } from '../../utils/formatters';
import Icon from '../UI/Icon';

interface EmitenteTableProps {
  emitentes: Emitente[];
  carregando: boolean;
  onEditar: (emitente: Emitente) => void;
  onVisualizar: (emitente: Emitente) => void;
  onExcluir: (emitente: Emitente) => void;
}

export const EmitenteTable = memo(({
  emitentes,
  carregando,
  onEditar,
  onVisualizar,
  onExcluir
}: EmitenteTableProps) => {
  if (carregando) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-gray-200 dark:border-0 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">Carregando emitentes...</p>
        </div>
      </div>
    );
  }

  if (emitentes.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-gray-200 dark:border-0 p-8">
        <div className="text-center">
          <Icon name="building" className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-foreground dark:text-gray-100 mb-2">
            Nenhum emitente encontrado
          </h3>
          <p className="text-muted-foreground">
            Não há emitentes cadastrados ou que correspondam aos filtros aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-gray-200 dark:border-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-background dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Emitente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                UF
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
            {emitentes.map((emitente) => (
              <tr key={emitente.id} className="hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Icon name="building" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-foreground dark:text-gray-100 max-w-xs truncate">
                        {emitente.razaoSocial}
                      </div>
                      {emitente.nomeFantasia && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {emitente.nomeFantasia}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground dark:text-gray-100">
                    {emitente.cnpj ? formatCNPJ(emitente.cnpj) : formatCPF(emitente.cpf || '')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {emitente.cnpj ? 'CNPJ' : 'CPF'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    emitente.tipoEmitente === 'PrestadorServico'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {emitente.tipoEmitente === 'PrestadorServico' ? 'Prestador' : 'Própria'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground dark:text-gray-100">
                  {emitente.uf}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    emitente.ativo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {emitente.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onVisualizar(emitente)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300
                                 transition-colors duration-200 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Visualizar"
                    >
                      <Icon name="eye" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditar(emitente)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300
                                 transition-colors duration-200 p-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      title="Editar"
                    >
                      <Icon name="edit" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onExcluir(emitente)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300
                                 transition-colors duration-200 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Excluir"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});