import React, { useEffect, useState } from 'react';
import Icon2 from '../Icon';

interface FormPageLayoutProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  iconName?: string;
  headerColor?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  showRequiredHint?: boolean;
  children?: React.ReactNode;
}

const isHexColor = (value?: string): value is string => Boolean(value && /^#([0-9A-Fa-f]{3}){1,2}$/.test(value));

const applyColorStyle = (color?: string) => {
  if (!isHexColor(color)) {
    return {
      background: `linear-gradient(135deg, #7c3aed, #2563eb)`
    } as React.CSSProperties;
  }

  return {
    background: color,
    backgroundColor: color,
    boxShadow: `0 10px 25px -12px ${color}80`
  } as React.CSSProperties;
};

const buildTitlePresentation = (color?: string, isDarkMode: boolean = false) => {
  if (!isHexColor(color) || isDarkMode) {
    return {
      className: 'text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:text-white dark:bg-none',
      style: {} as React.CSSProperties
    };
  }

  return {
    className: 'text-3xl font-bold text-slate-900 dark:text-white',
    style: { color }
  };
};

const buildButtonStyle = (color?: string) => {
  if (!isHexColor(color)) {
    return {} as React.CSSProperties;
  }

  return {
    backgroundColor: color,
    borderColor: color,
    boxShadow: `0 10px 25px -12px ${color}80`
  } as React.CSSProperties;
};

export const FormPageLayout: React.FC<FormPageLayoutProps> = ({
  title,
  subtitle,
  onBack,
  iconName,
  headerColor,
  isLoading,
  loadingMessage,
  error,
  showRequiredHint = true,
  children
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document === 'undefined') {
      return false;
    }
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const updateMode = () => setIsDarkMode(root.classList.contains('dark'));

    updateMode();

    if (typeof MutationObserver === 'undefined') {
      return;
    }

    const observer = new MutationObserver(() => updateMode());
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-card rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm text-muted-foreground">{loadingMessage || 'Carregando dados...'}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            <Icon2 name="arrow-left" size="sm" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6 lg:p-10">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={applyColorStyle(headerColor)}
            >
              {iconName && <Icon2 name={iconName} className="text-white text-2xl" />}
            </div>
            <div>
              {(() => {
                const titleProps = buildTitlePresentation(headerColor, isDarkMode);
                return (
                  <h1 className={titleProps.className} style={titleProps.style}>
                    {title}
                  </h1>
                );
              })()}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
              {showRequiredHint && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Campos marcados com ! são obrigatórios.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onBack}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isHexColor(headerColor)
                ? 'hover:opacity-90'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            }`}
            style={buildButtonStyle(headerColor)}
          >
            <Icon2 name="arrow-left" size="sm" />
            Voltar
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-5 py-4 rounded-xl flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon2 name="exclamation-triangle" className="text-red-600 dark:text-red-400" />
            </div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default FormPageLayout;
