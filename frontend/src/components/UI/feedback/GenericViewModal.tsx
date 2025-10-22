import React from 'react';
import { FormShell } from '../FormShell';
import { GenericViewModalProps, ModalSection, CRUDConfig } from '../../../types/modal';
import Icon from '../Icon';

/**
 * GenericViewModal - A modal for viewing entity details (read-only)
 * Now uses FormShell in modal mode
 * Supports both direct props and CRUDConfig
 */
export function GenericViewModal<T = any>({
  isOpen = false,
  onClose,
  item,
  data,
  title = '',
  subtitle,
  headerIcon,
  headerColor,
  sections = [],
  actions,
  statusConfig,
  idField = 'id',
  config,
  onEdit
}: GenericViewModalProps<T>) {
  const actualItem = item || data;
  
  if (!isOpen || !actualItem) return null;

  // Extract values from config if provided (supports both ModalConfig and CRUDConfig)
  let finalTitle = title;
  let finalSubtitle = subtitle;
  let finalSections = sections;
  
  if (config) {
    // Check if it's a CRUDConfig
    if ('view' in config && 'form' in config && 'entity' in config) {
      const crudConfig = config as CRUDConfig<T>;
      finalTitle = title || crudConfig.view.title;
      finalSubtitle = subtitle || crudConfig.view.subtitle;
      finalSections = sections.length > 0 ? sections : crudConfig.view.getSections(actualItem);
    } else {
      // Legacy ModalConfig
      const legacyConfig = config as any;
      finalTitle = title || legacyConfig.title;
      finalSubtitle = subtitle;
      if (legacyConfig.sections) {
        finalSections = sections.length > 0 ? sections : legacyConfig.sections;
      }
    }
  }

  return (
    <FormShell
      title={finalTitle}
      subtitle={finalSubtitle}
      actions={
        actions && actions.length > 0 && (
          <div className="flex items-center space-x-3">
            {actions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={action.onClick}
                disabled={action.loading || action.disabled}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  action.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white shadow-sm hover:shadow-md'
                    : action.variant === 'secondary'
                    ? 'border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm hover:shadow-md'
                }`}
              >
                {action.icon && <Icon name={action.icon} />}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )
      }
      isModal={true}
      maxWidth="4xl"
      onClose={onClose}
    >
      <div className="space-y-5">
        {/* Status Badge (if provided) */}
        {statusConfig && (
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <span
              className="px-4 py-1.5 rounded-full text-sm font-medium shadow-sm"
              style={{ 
                backgroundColor: statusConfig.bgColor, 
                color: statusConfig.textColor 
              }}
            >
              {statusConfig.icon && <Icon name={statusConfig.icon} className="mr-1" />}
              {statusConfig.value}
            </span>
          </div>
        )}

        {/* Sections */}
        {finalSections.map((section: ModalSection, sectionIndex: number) => {
          const hasIcon = Boolean(section.icon);
          const headerSpacingClass = hasIcon ? 'mb-5 pb-4' : 'mb-4 pb-3';

          return (
            <div
              key={sectionIndex}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm"
            >
              {/* Section Header */}
              <div
                className={`flex items-start ${hasIcon ? 'space-x-3' : ''} ${headerSpacingClass} border-b border-gray-200 dark:border-slate-700`}
              >
                {hasIcon && (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: section.color }}
                  >
                    <Icon name={section.icon!} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  {section.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {section.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Section Fields */}
              <div
                className={`grid gap-4 ${
                  section.columns === 1 ? 'grid-cols-1' : section.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
                }`}
              >
                {section.fields.map((field: any, fieldIndex: number) => (
                  <div
                    key={fieldIndex}
                    className={field.colSpan === 2 ? 'col-span-2' : field.colSpan === 3 ? 'col-span-3' : ''}
                  >
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {field.label}
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-slate-900 px-3 py-2 rounded-lg">
                        {field.formatter ? field.formatter(field.value) : field.value || 'Não informado'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </FormShell>
  );
}
