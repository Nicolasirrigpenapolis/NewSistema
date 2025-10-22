import React from 'react';
import { Icon } from '../../../ui';

interface ConfirmDeleteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemDetails?: Array<{ label: string; value: string }>;
  loading?: boolean;
}

/**
 * Modal de confirmação para exclusão de itens (receitas, despesas, peças)
 * Exibe detalhes do item antes de confirmar a exclusão
 */
export const ConfirmDeleteItemModal: React.FC<ConfirmDeleteItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemDetails = [],
  loading = false
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Icon name="trash" className="text-white text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  {title}
                </h3>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <Icon name="exclamation-triangle" className="text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Tem certeza de que deseja excluir este item?
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                    {itemName}
                  </p>
                </div>
              </div>

              {/* Detalhes do item */}
              {itemDetails.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-gray-200 dark:border-slate-700 pt-4">
                  {itemDetails.map((detail, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{detail.label}:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{detail.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Icon name="info-circle" className="flex-shrink-0" />
                <span>Esta ação não pode ser desfeita.</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-slate-800 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Icon name="trash" size="sm" />
                  Excluir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
