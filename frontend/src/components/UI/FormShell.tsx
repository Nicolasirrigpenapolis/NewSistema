import React, { useEffect } from 'react';
import { FormShellProps } from './FormShell.types';
import Icon from './Icon';

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
};

export function FormShell({
  title,
  subtitle,
  actions,
  children,
  isModal = false,
  maxWidth = 'xl',
  className = '',
  loading = false,
  error = null,
  onClose
}: FormShellProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isModal || !onClose) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModal, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isModal]);

  const formContent = (
    <div 
      className={`
        flex flex-col
        bg-white dark:bg-slate-800
        ${isModal ? 'rounded-lg shadow-2xl' : 'rounded-lg shadow-md'}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Fechar"
          >
            <Icon name="times" className="text-xl" />
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <Icon name="exclamation-circle" className="text-red-600 dark:text-red-400 mt-0.5 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Erro</p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer with Actions */}
      {actions && !loading && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-end space-x-3">
            {actions}
          </div>
        </div>
      )}
    </div>
  );

  // If modal mode, wrap in overlay
  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
      >
        <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto`}>
          {formContent}
        </div>
      </div>
    );
  }

  // Standard page layout
  return (
    <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto my-6`}>
      {formContent}
    </div>
  );
}
