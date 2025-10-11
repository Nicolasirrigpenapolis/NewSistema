import React from 'react';
import { MDFeNumberBadge } from '../MDFe/MDFeNumberBadge';
import Icon from '../Icon';

interface MDFe {
  id: number;
  numero: string;
  serie: string;
  dataEmissao: string;
  ufIni: string;
  ufFim: string;
  valorTotal: number;
  status: 'Autorizado' | 'Pendente' | 'Cancelado' | 'Rejeitado' | 'Rascunho';
  chave: string;
  emitenteNome?: string;
  veiculoPlaca?: string;
}

interface MDFeViewModalProps {
  mdfe: MDFe;
  isOpen: boolean;
  onClose: () => void;
}

export function MDFeViewModal({ mdfe, isOpen, onClose }: MDFeViewModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Autorizado':
        return { color: 'success', bgColor: '#dcfce7', textColor: '#166534' };
      case 'Pendente':
        return { color: 'warning', bgColor: '#fef3c7', textColor: '#92400e' };
      case 'Rascunho':
        return { color: 'draft', bgColor: '#f3f4f6', textColor: '#374151' };
      case 'Cancelado':
        return { color: 'secondary', bgColor: '#f1f5f9', textColor: '#64748b' };
      case 'Rejeitado':
        return { color: 'danger', bgColor: '#fee2e2', textColor: '#dc2626' };
      default:
        return { color: 'secondary', bgColor: '#f3f4f6', textColor: '#6b7280' };
    }
  };

  const statusConfig = getStatusConfig(mdfe.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-0 shadow-xl max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header com gradiente */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-card/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Icon name="file-invoice" className="text-white" size="lg" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-white mb-1">
                  MDF-e Nº {mdfe.numero} - Série {mdfe.serie}
                </h2>
                <p className="text-white/80 text-sm">
                  Manifesto de Documentos Fiscais
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mr-4"
              style={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.textColor
              }}
            >
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <span>{mdfe.status}</span>
            </div>

            <button
              className="w-10 h-10 bg-card/10 hover:bg-card/20 rounded-xl flex items-center justify-center transition-all duration-200 group backdrop-blur-sm flex-shrink-0"
              onClick={onClose}
            >
              <Icon name="times" className="text-white group-hover:scale-110 transition-transform" size="lg" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/80">
              <Icon name="calendar-alt" size="sm" />
              <span className="text-sm">{formatDate(mdfe.dataEmissao)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Icon name="route" size="sm" />
              <span className="text-sm">{mdfe.ufIni} → {mdfe.ufFim}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Seção Emitente */}
            <div className="rounded-xl p-4 border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Icon name="building" className="text-white" size="sm" />
                </div>
                <h3 className="font-semibold text-foreground">Emitente</h3>
              </div>
              <p className="text-foreground font-medium">{mdfe.emitenteNome || 'N/A'}</p>
            </div>

            {/* Seção Veículo */}
            <div className="rounded-xl p-4 border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <Icon name="truck" className="text-white" size="sm" />
                </div>
                <h3 className="font-semibold text-foreground">Veículo</h3>
              </div>
              <p className="text-foreground font-medium">{mdfe.veiculoPlaca || 'N/A'}</p>
            </div>

            {/* Seção Percurso */}
            <div className="rounded-xl p-4 border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Icon name="route" className="text-white" size="sm" />
                </div>
                <h3 className="font-semibold text-foreground">Percurso</h3>
              </div>
              <p className="text-foreground font-medium">{mdfe.ufIni} → {mdfe.ufFim}</p>
            </div>

            {/* Seção Valor */}
            <div className="rounded-xl p-4 border bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Icon name="dollar-sign" className="text-white" size="sm" />
                </div>
                <h3 className="font-semibold text-foreground">Valor da Carga</h3>
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(mdfe.valorTotal)}</p>
            </div>
          </div>

          {/* Seção Chave de Acesso */}
          {mdfe.chave && (
            <div className="rounded-xl p-4 border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700/50">
              <h4 className="flex items-center gap-3 font-semibold text-foreground mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Icon name="key" className="text-white" size="sm" />
                </div>
                Chave de Acesso
              </h4>
              <div className="flex items-center gap-2 p-3 bg-card rounded-xl border border-gray-200 dark:border-0">
                <code className="flex-1 text-sm font-mono text-foreground break-all">{mdfe.chave}</code>
                <button
                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-200"
                  onClick={() => navigator.clipboard.writeText(mdfe.chave)}
                  title="Copiar chave"
                >
                  <Icon name="copy" size="sm" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-0 bg-background dark:bg-gray-800">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="info-circle" size="sm" />
            <span>MDFe ID: {mdfe.id}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 text-foreground border border-gray-300 dark:border-0 rounded-lg hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
              onClick={() => {
                // Implementar download XML
                console.log('Download XML for MDFe', mdfe.id);
              }}
            >
              <Icon name="download" size="sm" />
              <span>Download XML</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 text-foreground border border-gray-300 dark:border-0 rounded-lg hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
              onClick={() => {
                // Implementar impressão
                window.print();
              }}
            >
              <Icon name="print" size="sm" />
              <span>Imprimir</span>
            </button>
            {mdfe.status !== 'Cancelado' && mdfe.status === 'Autorizado' && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                onClick={() => {
                  if (window.confirm('Deseja realmente cancelar este MDFe?')) {
                    // Implementar cancelamento
                    console.log('Cancel MDFe', mdfe.id);
                  }
                }}
              >
                <Icon name="times" size="sm" />
                <span>Cancelar</span>
              </button>
            )}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-background0 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
              onClick={onClose}
            >
              <Icon name="times" size="sm" />
              <span>Fechar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}