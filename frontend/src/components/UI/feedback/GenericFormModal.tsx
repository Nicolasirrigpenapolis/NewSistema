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

  const renderField = (field: any, sectionColor: string) => {
    const value = (formData as any)?.[field.key] ?? field.value ?? '';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled || saving}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            disabled={field.disabled || saving}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione...</option>
            {field.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled || saving}
            required={field.required}
            rows={field.rows || 3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              disabled={field.disabled || saving}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
          </label>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            disabled={field.disabled || saving}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
        );
    }
  };

  if (!isOpen) return null;

  const actions = (
    <>
      {!hideCancelButton && (
        <button
          type="button"
          onClick={handleClose}
          disabled={saving}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Salvando...</span>
          </>
        ) : (
          <span>{submitLabel}</span>
        )}
      </button>
    </>
  );

  return (
    <FormShell
      title={finalTitle}
      subtitle={finalSubtitle}
      actions={actions}
      error={error}
      loading={loading}
      isModal={true}
      maxWidth="4xl"
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {finalSections.map((section: FormSection, sectionIndex: number) => (
          <div key={sectionIndex} className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            {/* Section Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: section.color }}
              >
                <Icon name={section.icon} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h3>
                {section.subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {section.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Section Fields */}
            <div className={`grid gap-4 ${section.columns === 1 ? 'grid-cols-1' : section.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {section.fields.map((field: any, fieldIndex: number) => (
                <div 
                  key={fieldIndex}
                  className={field.colSpan === 2 ? 'col-span-2' : field.colSpan === 3 ? 'col-span-3' : ''}
                >
                  {field.type !== 'checkbox' && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  )}
                  {renderField(field, section.color)}
                  {field.hint && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {field.hint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </form>
    </FormShell>
  );
}
