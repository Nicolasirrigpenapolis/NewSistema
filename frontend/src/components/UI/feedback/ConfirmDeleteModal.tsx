import React from 'react';
import { FormShell } from '../FormShell';
import Icon from '../Icon';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
}

/**
 * ConfirmDeleteModal - A confirmation modal for delete actions
 * Uses FormShell in modal mode
 */
export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Exclusão',
  message = 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
  itemName,
  loading = false
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const actions = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isDeleting || loading}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isDeleting || loading}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
      >
        {(isDeleting || loading) ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Excluindo...</span>
          </>
        ) : (
          <>
            <Icon name="trash" />
            <span>Excluir</span>
          </>
        )}
      </button>
    </>
  );

  return (
    <FormShell
      title={title}
      actions={actions}
      isModal={true}
      maxWidth="md"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Icon name="exclamation-triangle" className="text-red-600 dark:text-red-400 text-xl" />
          </div>
          <div className="flex-1">
            <p className="text-gray-700 dark:text-gray-300">
              {message}
            </p>
            {itemName && (
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Item: <span className="text-red-600 dark:text-red-400">{itemName}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </FormShell>
  );
}
