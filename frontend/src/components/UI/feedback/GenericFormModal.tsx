import React, { useState, FormEvent, useEffect } from 'react';
import { FormShell } from '../FormShell';
import { FormSection, GenericFormModalProps, CRUDConfig } from '../../../types/modal';
import Icon from '../Icon';

/**
 * GenericFormModal - A modal form component that renders dynamic sections with fields
 * Now uses FormShell in modal mode as the base container
 * Supports both direct props and CRUDConfig
 */
export function GenericFormModal<T = any>({
  isOpen = false,
  onClose,
  data,
  item,
  sections = [],
  isEditing = false,
  isEdit = false,
  title = '',
  subtitle,
  headerIcon,
  headerColor,
  onSave,
  onCancel,
  onFieldChange,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  hideCancelButton = false,
  loading = false,
  config
}: GenericFormModalProps<T>) {
  const actualData = data || item;
  const actualIsEditing = isEditing || isEdit;
  
  // Extract values from config if provided (supports both ModalConfig and CRUDConfig)
  let finalTitle = title;
  let finalSubtitle = subtitle;
  let finalSections = sections;
  let finalHeaderIcon = headerIcon;
  let finalHeaderColor = headerColor;
  
  if (config) {
    // Check if it's a CRUDConfig
    if ('view' in config && 'form' in config && 'entity' in config) {
      const crudConfig = config as CRUDConfig<T>;
      finalTitle = title || (actualIsEditing ? crudConfig.form.editTitle : crudConfig.form.title) || crudConfig.form.title;
      finalSubtitle = subtitle || (actualIsEditing ? crudConfig.form.editSubtitle : crudConfig.form.subtitle) || crudConfig.form.subtitle;
      finalSections = sections.length > 0 ? sections : crudConfig.form.getSections(actualData);
      finalHeaderIcon = headerIcon || crudConfig.form.headerIcon;
      finalHeaderColor = headerColor || crudConfig.form.headerColor;
    } else {
      // Legacy ModalConfig
      const legacyConfig = config as any;
      finalTitle = title || (actualIsEditing ? legacyConfig.editTitle : legacyConfig.createTitle) || legacyConfig.title;
      finalSubtitle = subtitle;
      finalHeaderIcon = headerIcon || legacyConfig.headerIcon;
      finalHeaderColor = headerColor || legacyConfig.theme;
      if (legacyConfig.sections) {
        finalSections = sections.length > 0 ? sections : legacyConfig.sections;
      }
    }
  }
  
  const [formData, setFormData] = useState<T>(actualData || {} as T);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when data prop changes
  useEffect(() => {
    if (actualData) {
      setFormData(actualData);
    }
  }, [actualData]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    const newData = { ...formData, [fieldKey]: value };
    setFormData(newData);
    
    if (onFieldChange) {
      onFieldChange(fieldKey, value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!onSave) return;

    try {
      setSaving(true);
      setError(null);
      await onSave(formData);
      // Don't close automatically - let parent handle it
    } catch (err: any) {
      console.error('Error saving form:', err);
      setError(err?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  // Função para formatar placa (máscara visual)
  const formatPlaca = (value: string) => {
    // Remove caracteres não alfanuméricos
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Aplica máscara conforme o tamanho
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length === 4) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  };

  const handlePlacaChange = (fieldKey: string, displayValue: string) => {
    // Remove a máscara e salva apenas os caracteres
    const cleanValue = displayValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
    handleFieldChange(fieldKey, cleanValue);
  };

  const renderField = (field: any, sectionColor: string) => {
    const value = (formData as any)?.[field.key] ?? field.value ?? '';
    const baseFieldClasses = 'w-full px-4 py-3.5 border-2 border-gray-200 dark:border-slate-700 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md font-medium';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        // Verifica se é campo de placa para aplicar máscara
        const isPlacaField = field.key === 'placa';
        const displayValue = isPlacaField ? formatPlaca(value) : value;
        
        return (
          <div className="relative group">
            <input
              type={field.type}
              value={displayValue}
              onChange={(e) => {
                if (isPlacaField) {
                  handlePlacaChange(field.key, e.target.value);
                } else {
                  handleFieldChange(field.key, e.target.value);
                }
              }}
              placeholder={field.placeholder}
              disabled={field.disabled || saving}
              required={field.required}
              maxLength={field.maxLength ? (isPlacaField ? field.maxLength + 1 : field.maxLength) : undefined}
              className={`${baseFieldClasses} ${field.type === 'number' ? 'appearance-none' : ''}`}
              style={{
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            />
            {/* Focus indicator */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"
              style={{ backgroundColor: sectionColor }}
            />
          </div>
        );
      
      case 'select':
        return (
          <div className="relative group">
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              disabled={field.disabled || saving}
              required={field.required}
              className={`${baseFieldClasses} pr-10 cursor-pointer appearance-none`}
              style={{
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">Selecione...</option>
              {field.options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Focus indicator */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"
              style={{ backgroundColor: sectionColor }}
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div className="relative group">
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || saving}
              required={field.required}
              rows={field.rows || 3}
              className={`${baseFieldClasses} resize-none`}
              style={{
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}
            />
            {/* Focus indicator */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"
              style={{ backgroundColor: sectionColor }}
            />
          </div>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              disabled={field.disabled || saving}
              className="w-5 h-5 text-blue-600 dark:text-blue-500 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {field.label}
            </span>
          </label>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            disabled={field.disabled || saving}
            className={`${baseFieldClasses}`}
          />
        );
    }
  };

  if (!isOpen) return null;

  const formId = `generic-form-${Date.now()}`;

  const actions = (
    <div className="flex items-center space-x-3">
      {!hideCancelButton && (
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="group relative px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <span className="relative z-10">{cancelLabel}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </button>
      )}
      <button
        type="submit"
        form={formId}
        disabled={saving}
        className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 overflow-hidden"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span className="relative z-10">Salvando...</span>
          </>
        ) : (
          <>
            <span className="relative z-10">{submitLabel}</span>
            <svg className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </>
        )}
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </button>
    </div>
  );

  return (
    <FormShell
      title={finalTitle}
      subtitle={finalSubtitle}
      headerIcon={finalHeaderIcon}
      headerColor={finalHeaderColor}
      actions={actions}
      error={error}
      loading={loading}
      isModal={true}
      maxWidth="4xl"
      onClose={handleClose}
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        {finalSections.map((section: FormSection, sectionIndex: number) => (
          <div
            key={sectionIndex}
            className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 rounded-2xl p-6 border-2 border-gray-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full"
              style={{ backgroundColor: section.color }}
            />
            <div className="relative">
              {(section.subtitle || finalSections.length > 1) && (
                <div className="mb-4 pb-3 border-b border-gray-200 dark:border-slate-700">
                  {finalSections.length > 1 && (
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      {section.title}
                    </h3>
                  )}
                  {section.subtitle && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {section.subtitle}
                    </p>
                  )}
                </div>
              )}

              <div className={`grid gap-4 ${section.columns === 1 ? 'grid-cols-1' : section.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {section.fields.map((field: any, fieldIndex: number) => (
                  <div
                    key={fieldIndex}
                    className={`relative ${field.colSpan === 2 ? 'col-span-2' : field.colSpan === 3 ? 'col-span-3' : ''}`}
                  >
                    {field.type !== 'checkbox' && (
                      <label className="flex items-center space-x-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: section.color }}
                        />
                        <span>{field.label}</span>
                        {field.required && (
                          <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white rounded-full bg-red-500 dark:bg-red-400 ml-1">
                            !
                          </span>
                        )}
                      </label>
                    )}
                    {renderField(field, section.color)}
                    {field.hint && (
                      <div className="mt-2 flex items-start space-x-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                        <svg
                          className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          {field.hint}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </form>
    </FormShell>
  );
}
