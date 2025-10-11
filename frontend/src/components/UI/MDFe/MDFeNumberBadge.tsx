import React from 'react';

interface MDFeNumberBadgeProps {
  numero: string | number;
  serie: string | number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'minimal';
  className?: string;
}

export function MDFeNumberBadge({
  numero,
  serie,
  size = 'medium',
  variant = 'primary',
  className = ''
}: MDFeNumberBadgeProps) {
  const sizeClasses = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4 md:p-3'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-2 border-blue-200 dark:border-blue-600/50 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-500 before:to-blue-700 hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20',
    secondary: 'bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-600/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-600',
    minimal: 'bg-transparent border-none'
  };

  const numberSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg md:text-base'
  };

  const serieSizeClasses = {
    small: 'text-xs px-1.5 py-0.5',
    medium: 'text-xs px-2 py-1',
    large: 'text-sm px-2.5 py-1.5 md:text-xs md:px-2 md:py-1'
  };

  return (
    <div className={`
      flex items-center gap-3 relative overflow-hidden rounded-2xl transition-all duration-300 animate-fade-in-up
      ${sizeClasses[size]} ${variantClasses[variant]} ${className}
    `}>
      <div className="flex flex-col gap-1">
        <div className={`
          font-extrabold text-slate-800 dark:text-slate-100 leading-none tracking-tight
          ${variant === 'minimal' ? 'bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent' : ''}
          ${numberSizeClasses[size]}
        `}>
          MDFe Nº {numero}
        </div>
        <div className={`
          font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide
          bg-card/80 dark:bg-slate-700/80 border border-blue-300/50 dark:border-blue-500/50 rounded-lg w-fit leading-none
          ${variant === 'minimal' ? 'bg-blue-50/50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-600 rounded-xl' : ''}
          ${serieSizeClasses[size]}
        `}>
          Série {serie}
        </div>
      </div>
    </div>
  );
}