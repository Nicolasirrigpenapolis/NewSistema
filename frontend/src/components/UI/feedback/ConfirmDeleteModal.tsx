import React from 'react';
import Icon from '../Icon';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  title = "Confirmar Exclusão",
  message = "Tem certeza que deseja excluir este item?",
  itemName,
  onConfirm,
  onCancel,
  loading = false
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-card dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-0 shadow-xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header com gradiente de perigo */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-card/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="exclamation-triangle" className="text-white" size="lg" />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {itemName && (
            <div className="p-3 rounded-lg bg-background dark:bg-gray-800 border border-gray-200 dark:border-0">
              <strong className="text-foreground">{itemName}</strong>
            </div>
          )}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <Icon name="info-circle" className="text-red-600 dark:text-red-400" size="sm" />
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">Esta ação não pode ser desfeita.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-0 bg-background dark:bg-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-foreground border border-gray-300 dark:border-0 rounded-lg hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
  );
}