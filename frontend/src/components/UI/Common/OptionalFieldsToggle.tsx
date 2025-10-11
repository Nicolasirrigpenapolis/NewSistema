import React from 'react';

interface OptionalFieldsToggleProps {
  label: string;
  description?: string;
  isExpanded: boolean;
  onToggle: () => void;
  icon?: string;
  className?: string;
}

export const OptionalFieldsToggle: React.FC<OptionalFieldsToggleProps> = ({
  label,
  description,
  isExpanded,
  onToggle,
  icon = 'fas fa-plus-circle',
  className = ''
}) => {

  return (
    <div
      className={`optional-fields-toggle ${className} flex items-center p-4 rounded-xl cursor-pointer mb-4 transition-all duration-300 transform hover:scale-105 ${
        isExpanded
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-0 shadow-lg'
          : 'bg-background dark:bg-gray-700 border-2 border-gray-200 dark:border-0 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-md hover:shadow-lg'
      }`}
      onClick={onToggle}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-200 ${
        isExpanded
          ? 'bg-blue-500 dark:bg-blue-600 text-white'
          : 'bg-gray-200 dark:bg-gray-600 text-muted-foreground dark:text-gray-300'
      }`}>
        <i className={`${isExpanded ? 'fas fa-minus' : icon.replace('fas fa-plus-circle', 'fas fa-plus')} text-lg`} />
      </div>

      <div className="flex-1">
        <div className={`font-semibold text-lg transition-colors duration-200 ${
          isExpanded
            ? 'text-blue-900 dark:text-blue-100'
            : 'text-foreground dark:text-gray-100'
        }`}>
          {label}
        </div>
        {description && (
          <div className={`text-sm mt-1 transition-colors duration-200 ${
            isExpanded
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-muted-foreground'
          }`}>
            {description}
          </div>
        )}
      </div>

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
        isExpanded
          ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
          : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
      }`}>
        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-sm`} />
      </div>
    </div>
  );
};

interface OptionalSectionProps {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}

export const OptionalSection: React.FC<OptionalSectionProps> = ({
  children,
  isVisible,
  className = ''
}) => {

  if (!isVisible) return null;

  return (
    <div
      className={`optional-section ${className} bg-card border-2 border-gray-200 dark:border-0 rounded-xl p-6 mb-4 transition-all duration-300 shadow-sm hover:shadow-md`}
    >
      {children}
    </div>
  );
};