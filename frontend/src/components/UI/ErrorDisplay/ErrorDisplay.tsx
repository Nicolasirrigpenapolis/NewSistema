import React from 'react';
import { ErrorMessageHelper } from '../../../utils/errorMessages';
import Icon from '../Icon';

interface ErrorDisplayProps {
  error?: string | any;
  errors?: Record<string, string[]>;
  className?: string;
  type?: 'inline' | 'block' | 'toast';
  onClose?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errors,
  className = '',
  type = 'block',
  onClose
}) => {
  if (!error && (!errors || Object.keys(errors).length === 0)) {
    return null;
  }

  const getErrorMessage = (): string => {
    if (error) {
      if (typeof error === 'string') {
        return error;
      }
      return ErrorMessageHelper.processApiResponse(error);
    }

    if (errors) {
      const validationErrors = ErrorMessageHelper.processValidationErrors(errors);
      return ErrorMessageHelper.formatValidationErrors(validationErrors);
    }

    return 'Ocorreu um erro inesperado.';
  };

  const getValidationErrors = () => {
    if (errors) {
      return ErrorMessageHelper.processValidationErrors(errors);
    }
    return [];
  };

  const errorMessage = getErrorMessage();
  const validationErrors = getValidationErrors();
  const hasMultipleErrors = validationErrors.length > 1;

  const getTypeClasses = () => {
    switch (type) {
      case 'inline':
        return 'text-sm text-red-600 dark:text-red-400 mt-1';
      case 'toast':
        return 'fixed top-4 right-4 z-50 max-w-md';
      default: // block
        return 'w-full';
    }
  };

  return (
    <div
      className={`
        bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
        rounded-lg p-4 flex gap-3 items-start ${getTypeClasses()} ${className}
      `}
      role="alert"
    >
      {onClose && (
        <button
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-lg leading-none"
          onClick={onClose}
          aria-label="Fechar erro"
        >
          ×
        </button>
      )}

      <div className="flex-shrink-0 mt-0.5">
        <Icon name="exclamation-triangle" color="#dc3545" />
      </div>

      <div className="flex-1 min-w-0">
        {hasMultipleErrors ? (
          <div>
            <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              Foram encontrados erros de validação:
            </div>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {validationErrors.map((err, index) => (
                <li key={index} className="flex gap-1">
                  <span className="font-medium">{err.field}:</span>
                  <span>{err.message}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-sm text-red-800 dark:text-red-200">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

interface FieldErrorProps {
  error?: string;
  field?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, field }) => {
  if (!error) return null;

  const friendlyField = field ? ErrorMessageHelper.translateFieldName(field) : '';
  const message = field ? `${friendlyField}: ${error}` : error;

  return (
    <div className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
      <span>{message}</span>
    </div>
  );
};

interface ToastErrorProps {
  error?: string | any;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const ToastError: React.FC<ToastErrorProps> = ({
  error,
  isVisible,
  onClose,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible || !error) {
    return null;
  }

  const message = typeof error === 'string' ? error : ErrorMessageHelper.processApiResponse(error);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in-right">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg flex gap-3 items-start">
        <div className="flex-shrink-0 mt-0.5">
          <Icon name="exclamation-triangle" color="#dc3545" />
        </div>
        <div className="flex-1 min-w-0 text-sm text-red-800 dark:text-red-200">
          {message}
        </div>
        <button
          className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-lg leading-none"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  );
};