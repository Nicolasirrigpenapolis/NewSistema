import React from 'react';
import { ListShellProps } from './FormShell.types';
import Icon from './Icon';

export function ListShell({
  title,
  subtitle,
  headerActions,
  filters,
  children,
  className = '',
  loading = false,
  error = null
}: ListShellProps) {
  return (
    <div className={`w-full max-w-7xl mx-auto my-6 ${className}`}>
      <div className="flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="ml-4 flex items-center space-x-3">
                {headerActions}
              </div>
            )}
          </div>
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

        {/* Filters */}
        {filters && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
            {filters}
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
