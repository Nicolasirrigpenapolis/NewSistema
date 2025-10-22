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
  headerIcon,
  headerColor = '#3b82f6',
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
        bg-white dark:bg-slate-950
        border border-gray-200 dark:border-slate-800
        ${isModal ? 'rounded-2xl shadow-2xl max-h-[90vh]' : 'rounded-xl shadow-lg'}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="flex items-center gap-3 flex-1">
          {headerIcon && (
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
              style={{ 
                background: `linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%)` 
              }}
            >
              <Icon name={headerIcon} className="text-base" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
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
  <div className="flex-1 px-6 py-4 overflow-y-auto bg-white dark:bg-slate-950">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent"></div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carregando...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer with Actions */}
      {actions && !loading && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
      >
        <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto animate-modal-enter`}>
          {formContent}
        </div>
      </div>
    );
  }

  // Standard page layout
  return (
  <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto my-4`}>
      {formContent}
    </div>
  );
}
