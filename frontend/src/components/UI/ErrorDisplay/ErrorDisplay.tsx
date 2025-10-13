import React from 'react';
import Icon from '../Icon';

interface ErrorDisplayProps {
  errors: string[];
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors, onDismiss }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon name="exclamation-circle" className="text-red-600" size="lg" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {errors.length === 1 ? 'Erro encontrado' : `${errors.length} erros encontrados`}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-3 text-red-500 hover:text-red-700"
          >
            <Icon name="times" />
          </button>
        )}
      </div>
    </div>
  );
};
