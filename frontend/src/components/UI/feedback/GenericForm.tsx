import React, { useState, FormEvent } from 'react';
import { FormShell } from '../FormShell';
import { FormSection, GenericFormModalProps } from '../../../types/modal';
import Icon from '../Icon';
import { InputCNPJ } from '../InputCNPJ';
import { InputMasked } from '../InputMasked';
import { CNPJData } from '../../../types/apiResponse';

/**
 * GenericForm - A form component that renders dynamic sections with fields
 * Now uses FormShell as the base container
 */
export function GenericForm<T = any>({
  data,
  sections = [],
  isEditing = false,
  title = '',
  subtitle,
  headerIcon,
  headerColor,
  onSave,
  onCancel,
  onFieldChange,
  onCNPJDataFetch,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  hideCancelButton = false,
  pageClassName = 'max-w-5xl',
  loading = false,
  readonly = false,
  // New optional prop to control container max width explicitly
  maxWidth,
  config
}: GenericFormModalProps<T> & { 
  pageClassName?: string; 
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  onCNPJDataFetch?: (data: CNPJData) => void;
  readonly?: boolean;
}) {
  const [formData, setFormData] = useState<T>(data || {} as T);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Atualizar formData quando data mudar
  React.useEffect(() => {
    setFormData(data || {} as T);
  }, [data]);

  const cleanPlacaValue = (input: string) => input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

  const formatPlacaDisplay = (value: any) => {
    const cleaned = cleanPlacaValue((value ?? '').toString());
    if (cleaned.length <= 3) {
      return cleaned;
    }
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  };

  const handlePlacaInputChange = (rawValue: string, fieldKey: string) => {
    const cleaned = cleanPlacaValue(rawValue);
    handleFieldChange(fieldKey, cleaned);
  };

  const formatTaraDisplay = (value: any) => {
    const digits = typeof value === 'number'
      ? value.toString()
      : (value ?? '').toString().replace(/\D/g, '');

    if (!digits) {
      return '';
    }

    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleTaraInputChange = (rawValue: string, fieldKey: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 9);
    if (digitsOnly === '') {
      handleFieldChange(fieldKey, '');
      return;
    }
    handleFieldChange(fieldKey, Number(digitsOnly));
  };

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
    } catch (err: any) {
      console.error('Error saving form:', err);
      setError(err?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: any, sectionColor: string) => {
    const value = (formData as any)?.[field.key] ?? field.value ?? '';

    if (typeof field.render === 'function') {
      return field.render({
        value,
        onChange: (newValue: any) => handleFieldChange(field.key, newValue),
        data: formData,
        setFieldValue: handleFieldChange,
        saving,
        isEditing,
        sectionColor
      });
    }
    
    // Campo CNPJ especial com busca automática
    if (field.key === 'cnpj' && onCNPJDataFetch) {
      return (
        <InputCNPJ
          value={value}
          onChange={(rawValue) => handleFieldChange(field.key, rawValue)}
          onDataFetched={onCNPJDataFetch}
          required={field.required}
          disabled={field.disabled || saving || readonly}
          placeholder={field.placeholder}
          autoFetch={true}
        />
      );
    }

    // Campos com máscara (exceto CNPJ que tem componente especial)
    if (field.mask && field.key !== 'cnpj') {
      return (
        <InputMasked
          value={value}
          onChange={(rawValue) => handleFieldChange(field.key, rawValue)}
          maskType={field.mask}
          required={field.required}
          disabled={field.disabled || saving || readonly}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
        />
      );
    }
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        if (field.key === 'tara') {
          const taraDisplay = formatTaraDisplay(value);
          return (
            <div className="relative group">
              <input
                type={field.type === 'date' ? 'date' : 'text'}
                inputMode="numeric"
                value={taraDisplay}
                onChange={(e) => handleTaraInputChange(e.target.value, field.key)}
                placeholder={field.placeholder}
                disabled={field.disabled || saving || readonly}
                required={field.required}
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md font-medium"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: sectionColor }}
              />
            </div>
          );
        }

        if (field.key === 'placa') {
          const placaDisplay = formatPlacaDisplay(value);
          return (
            <div className="relative group">
              <input
                type={field.type}
                value={placaDisplay}
                onChange={(e) => handlePlacaInputChange(e.target.value, field.key)}
                placeholder={field.placeholder}
                disabled={field.disabled || saving || readonly}
                required={field.required}
                maxLength={8}
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md font-medium uppercase"
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: sectionColor }}
              />
            </div>
          );
        }

        return (
          <div className="relative group">
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || saving || readonly}
              required={field.required}
              maxLength={field.maxLength}
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md font-medium"
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
              disabled={field.disabled || saving || readonly}
              required={field.required}
              className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md cursor-pointer appearance-none font-medium"
              style={{
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
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
              disabled={field.disabled || saving || readonly}
              required={field.required}
              rows={field.rows || 3}
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md resize-none font-medium"
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
              className="w-5 h-5 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white font-medium"
          />
        );
    }
  };

  // Determine shell max width: prioritize explicit maxWidth prop, then infer from pageClassName for backward compatibility
  const inferredMaxWidth = maxWidth
    ? maxWidth
    : pageClassName.includes('full') || pageClassName.includes('max-w-full')
      ? 'full'
      : pageClassName.includes('7xl')
        ? '7xl'
        : pageClassName.includes('6xl')
          ? '6xl'
          : pageClassName.includes('5xl')
            ? '5xl'
            : pageClassName.includes('4xl')
              ? '4xl'
              : pageClassName.includes('3xl')
                ? '3xl'
                : 'xl';

  return (
    <FormShell
      title=""
      subtitle=""
      error={error}
      loading={loading}
      maxWidth={inferredMaxWidth}
    >
      <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
        {sections.map((section: FormSection, sectionIndex: number) => {
          const hasIcon = Boolean(section.icon);
          const headerSpacingClass = hasIcon ? 'mb-6 pb-5' : 'mb-4 pb-3';

          return (
            <div
              key={sectionIndex}
              className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-850 rounded-2xl p-6 border-2 border-gray-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Decorative corner accent */}
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full"
                style={{ backgroundColor: section.color }}
              />

              <div className="relative">
                {/* Section Header */}
                <div
                  className={`flex items-start ${hasIcon ? 'space-x-4' : ''} ${headerSpacingClass} border-b-2 border-dashed border-gray-200 dark:border-slate-700`}
                >
                  {hasIcon && (
                    <div
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${section.color} 0%, ${section.color}cc 100%)`
                      }}
                    >
                      <Icon name={section.icon!} className="text-3xl" />
                      {/* Icon glow effect */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-40 blur-md"
                        style={{ backgroundColor: section.color }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                      {section.title}
                    </h3>
                    {section.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {section.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Section Fields */}
                <div
                  className={`grid gap-6 ${
                    section.columns === 1 ? 'grid-cols-1' : section.columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
                  }`}
                >
                  {section.fields.map((field: any, fieldIndex: number) => (
                    <div
                      key={fieldIndex}
                      className={`relative ${
                        field.colSpan === 2 ? 'col-span-2' : field.colSpan === 3 ? 'col-span-3' : ''
                      }`}
                    >
                      {/* Label não renderizado para campos especiais que já incluem o label (CNPJ com InputCNPJ) */}
                      {field.type !== 'checkbox' && field.key !== 'cnpj' && (
                        <label className="flex items-center space-x-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
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
                        <div className="mt-2 flex items-start space-x-2">
                          <svg
                            className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-60"
                            style={{ color: section.color }}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                            {field.hint}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Botões de Ação DENTRO do Form */}
        <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t-2 border-gray-200 dark:border-slate-700">
          {!hideCancelButton && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="group relative px-6 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="relative z-10">{cancelLabel}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 overflow-hidden"
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
      </form>
    </FormShell>
  );
}
