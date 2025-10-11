// Teste de modificação - GenericFormModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../Icon';
import { GenericFormModalProps, FormField, FormSection } from '../../../types/modal';
import { SmartCNPJInput } from '../Forms/SmartCNPJInput';
import { cleanNumericString, applyMask, cleanPlaca } from '../../../utils/formatters';

export function GenericFormModal<T = any>({
  isOpen = true,
  onClose,
  onSave,
  item,
  data,
  title,
  subtitle,
  headerIcon,
  headerColor,
  sections,
  loading = false,
  isEdit = false,
  isEditing = false,
  config,
  onCancel,
  onFieldChange,
  customStates
}: GenericFormModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Process config if provided
  const modalTitle = config ? (isEditing ? config.editTitle || config.title : config.createTitle || config.title) : title;
  const modalSubtitle = config ? (isEditing ? config.editSubtitle || config.createSubtitle : config.createSubtitle) : subtitle;

  // Theme colors mapping
  const getThemeColors = (theme: string) => {
    const themes: Record<string, { color: string; bgColor: string; headerColor: string; icon: string }> = {
      blue: {
        color: '#3B82F6',
        bgColor: '#EBF8FF',
        headerColor: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        icon: 'user-friends'
      },
      green: {
        color: '#10B981',
        bgColor: '#ECFDF5',
        headerColor: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        icon: 'handshake'
      },
      indigo: {
        color: '#6366F1',
        bgColor: '#EEF2FF',
        headerColor: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
        icon: 'briefcase'
      },
      purple: {
        color: '#8B5CF6',
        bgColor: '#F3E8FF',
        headerColor: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        icon: 'map-marker-alt'
      },
      yellow: {
        color: '#F59E0B',
        bgColor: '#FFFBEB',
        headerColor: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        icon: 'shield-alt'
      }
    };
    return themes[theme] || themes.blue;
  };

  const themeColors = config ? getThemeColors(config.theme) : null;
  const modalHeaderIcon = themeColors?.icon || headerIcon || 'plus';
  const modalHeaderColor = themeColors?.headerColor || headerColor || 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)';

  // Convert config sections to FormSection format
  const modalSections: FormSection[] = useMemo(() => {
    return config ? config.sections.map(section => ({
      title: section.title,
      subtitle: section.subtitle,
      icon: themeColors?.icon || 'edit',
      color: themeColors?.color || '#3B82F6',
      bgColor: themeColors?.bgColor || '#EBF8FF',
      fields: section.fields.filter(field => !field.conditional || (data && (data as any)[field.conditional.field] === field.conditional.value)).map(field => ({
        key: field.name,
        label: field.label,
        type: field.type as any,
        required: field.required,
        placeholder: field.placeholder,
        validation: field.validation,
        options: field.options,
        colSpan: (field as any).colSpan,
        show: true
      })),
      columns: 2
    })) : sections || [];
  }, [config, themeColors, data, sections]);

  // Calcular tamanho do modal baseado no número de campos
  const totalFields = modalSections.reduce((total, section) =>
    total + section.fields.filter(field => field.show !== false).length, 0
  );
  const isCompact = totalFields <= 4;
  const modalSizeClass = isCompact ? 'max-w-2xl' : 'max-w-4xl';

  useEffect(() => {
    if (isOpen) {
      const currentData = data || item;
      if (currentData && (isEdit || isEditing)) {
        setFormData({ ...currentData });
      } else {
        setFormData({});
      }
      setErrors({});

      // Set default collapsed state for sections
      const defaultCollapsed: Record<string, boolean> = {};
      modalSections.forEach(section => {
        if (section.collapsible) {
          defaultCollapsed[section.title] = section.defaultCollapsed || false;
        }
      });
      setCollapsedSections(defaultCollapsed);
    }
  }, [isOpen, isEdit, isEditing]);

  // Update internal formData when external data changes
  useEffect(() => {
    if (data && isOpen) {
      setFormData(prev => ({
        ...prev,
        ...data
      }));
    }
  }, [data, isOpen]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    // Always update internal state
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));

    // Also call external field change handler if provided
    if (onFieldChange) {
      onFieldChange(fieldKey, value);
    }

    // Clear error when user starts typing
    if (errors[fieldKey]) {
      setErrors(prev => ({
        ...prev,
        [fieldKey]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const currentData = formData;

    modalSections.forEach(section => {
      section.fields.forEach(field => {
        if (field.show === false) return;

        const value = currentData[field.key];

        // Required field validation
        if (field.required && (!value || value === '')) {
          newErrors[field.key] = `${field.label} é obrigatório`;
        }

        // Custom validation (only if it's a function)
        if (field.validation && typeof field.validation === 'function' && value) {
          const error = field.validation(value);
          if (error) {
            newErrors[field.key] = error;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const dataToSave = formData;
      if (onSave) {
        await onSave(dataToSave as T);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(`Erro ao salvar: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const renderField = (field: FormField, sectionColor: string) => {
    if (field.show === false) return null;

    const currentData = formData;

    // Check conditional visibility
    if (field.conditionalShow) {
      const conditionValue = currentData[field.conditionalShow.field];
      if (conditionValue !== field.conditionalShow.value) {
        return null;
      }
    }

    const value = currentData[field.key] || '';
    const hasError = !!errors[field.key];
    const colSpanClass = field.colSpan === 2 ? 'col-span-2' : field.colSpan === 3 ? 'col-span-3' : '';

    const baseInputClass = `w-full px-4 py-3 border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${
      hasError
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 dark:border-0 focus:ring-blue-500 focus:border-blue-500'
    }`;

    return (
      <div key={field.key} className={`space-y-2 ${colSpanClass}`}>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {field.icon && <Icon name={field.icon} className={sectionColor} size="sm" />}
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>

        {field.type === 'cnpj' ? (
          <SmartCNPJInput
            value={value}
            onChange={(cnpj, isValid) => handleFieldChange(field.key, cnpj)}
            onDataFetch={(data) => {
              // Chamar o callback original se existir
              if (field.onDataFetch) {
                field.onDataFetch(data);
              }

              // Atualizar os campos do formulário automaticamente
              if (data) {
                const updates: Record<string, any> = {
                  razaoSocial: data.razaoSocial || data.nome,
                  nomeFantasia: data.nomeFantasia || data.fantasia,
                  cep: data.cep,
                  endereco: data.logradouro || data.endereco,
                  numero: data.numero,
                  complemento: data.complemento,
                  bairro: data.bairro,
                  municipio: data.municipio,
                  uf: data.uf,
                  codMunicipio: data.codMunicipio || 0
                };

                // Atualizar apenas campos que têm valores e não estão preenchidos
                Object.entries(updates).forEach(([key, val]) => {
                  if (val !== undefined && val !== null && (!formData[key] || formData[key] === '' || formData[key] === 0)) {
                    handleFieldChange(key, val);
                  }
                });
              }
            }}
            autoValidate={true}
            autoFetch={field.autoFetch !== false}
            className={baseInputClass}
            placeholder={field.placeholder}
            disabled={field.disabled}
          />
        ) : field.type === 'select' ? (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={baseInputClass}
            disabled={field.disabled}
            required={field.required}
          >
            <option value="">Selecione</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`${baseInputClass} min-h-[100px] resize-y`}
            placeholder={field.placeholder}
            disabled={field.disabled}
            required={field.required}
          />
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              disabled={field.disabled}
            />
            <span className="text-sm text-foreground">
              {field.placeholder || field.label}
            </span>
          </div>
        ) : field.type === 'toggle' ? (
          <div className="flex items-center justify-between p-4 bg-background dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                value ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <Icon name={value ? 'check-circle' : 'times-circle'}
                      className={value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                      size="lg" />
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {value ? 'Ativo' : 'Inativo'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {value ? 'Usuário pode acessar o sistema' : 'Usuário sem acesso ao sistema'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFieldChange(field.key, !value)}
              disabled={field.disabled}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                value
                  ? 'bg-green-600 focus:ring-green-500'
                  : 'bg-gray-300 dark:bg-gray-600 focus:ring-gray-500'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-card transition-transform duration-200 ${
                  value ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ) : field.type === 'cpf' ? (
          <input
            type="text"
            value={value ? applyMask(value, 'cpf') : ''}
            onChange={(e) => handleFieldChange(field.key, cleanNumericString(e.target.value))}
            className={baseInputClass}
            placeholder={field.placeholder || '000.000.000-00'}
            maxLength={14}
            disabled={field.disabled}
            required={field.required}
          />
        ) : field.type === 'cep' ? (
          <input
            type="text"
            value={value ? applyMask(value, 'cep') : ''}
            onChange={(e) => handleFieldChange(field.key, cleanNumericString(e.target.value))}
            className={baseInputClass}
            placeholder={field.placeholder || '00000-000'}
            maxLength={9}
            disabled={field.disabled}
            required={field.required}
          />
        ) : field.type === 'telefone' ? (
          <input
            type="text"
            value={value ? applyMask(value, 'telefone') : ''}
            onChange={(e) => {
              const cleaned = cleanNumericString(e.target.value);
              if (cleaned.length <= 11) {
                handleFieldChange(field.key, cleaned);
              }
            }}
            className={baseInputClass}
            placeholder={field.placeholder || '(00) 00000-0000'}
            disabled={field.disabled}
            required={field.required}
          />
        ) : field.mask === 'AAA-9*99' ? (
          <input
            type="text"
            value={value ? applyMask(value, 'placa') : ''}
            onChange={(e) => {
              const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              if (cleaned.length <= 7) {
                handleFieldChange(field.key, cleaned);
              }
            }}
            className={baseInputClass}
            placeholder={field.placeholder}
            disabled={field.disabled}
            required={field.required}
          />
        ) : field.type === 'file' || field.type === 'folder' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className={baseInputClass}
              placeholder={field.placeholder}
              disabled={field.disabled}
              required={field.required}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';

                if (field.type === 'file') {
                  // Seletor de arquivo
                  if (field.accept) {
                    input.accept = field.accept;
                  }
                  input.onchange = (e: any) => {
                    const file = e.target?.files?.[0];
                    if (file) {
                      // Tenta pegar o caminho completo (funciona em Electron)
                      const path = (file as any).path || file.name;
                      handleFieldChange(field.key, path);
                    }
                  };
                } else {
                  // Seletor de pasta
                  (input as any).webkitdirectory = true;
                  (input as any).directory = true;

                  input.onchange = (e: any) => {
                    const files = e.target?.files;
                    if (files && files.length > 0) {
                      const firstFile = files[0];

                      // Tenta extrair o caminho da pasta
                      let folderPath = '';

                      // Método 1: Usar file.path do Electron
                      if ((firstFile as any).path) {
                        const fullPath = (firstFile as any).path;
                        // Remove o nome do arquivo para ficar só com a pasta
                        folderPath = fullPath.substring(0, fullPath.lastIndexOf('\\') || fullPath.lastIndexOf('/'));
                      }
                      // Método 2: Usar webkitRelativePath
                      else if (firstFile.webkitRelativePath) {
                        const parts = firstFile.webkitRelativePath.split('/');
                        // O primeiro elemento é o nome da pasta selecionada
                        folderPath = parts[0];
                      }

                      if (folderPath) {
                        handleFieldChange(field.key, folderPath);
                      }
                    }
                  };
                }

                input.click();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
              title={field.type === 'folder' ? 'Selecionar pasta' : 'Selecionar arquivo'}
            >
              <Icon name={field.type === 'file' ? 'file-alt' : 'folder'} size="sm" />
              {(field as any).buttonLabel || 'Buscar'}
            </button>
          </div>
        ) : (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={baseInputClass}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            disabled={field.disabled}
            readOnly={field.readonly}
            required={field.required}
          />
        )}

        {hasError && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <Icon name="exclamation-circle" size="sm" />
            {errors[field.key]}
          </p>
        )}
      </div>
    );
  };

  const renderSection = (section: FormSection) => {
    const visibleFields = section.fields.filter(field => field.show !== false);
    if (visibleFields.length === 0) return null;

    const columns = section.columns || 2;
    const gridClass = columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2';
    const isCollapsed = section.collapsible && collapsedSections[section.title];

    return (
      <div key={section.title} className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(to bottom right, ${section.color}, ${section.bgColor})` }}
          >
            <Icon name={section.icon} className="text-white" size="sm" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground">{section.title}</h3>
            {section.subtitle && (
              <p className="text-muted-foreground text-sm">{section.subtitle}</p>
            )}
          </div>
          {section.collapsible && (
            <button
              type="button"
              onClick={() => toggleSection(section.title)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <Icon name={isCollapsed ? "chevron-down" : "chevron-up"} size="sm" />
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div
            className="rounded-xl p-6 border"
            style={{
              background: `linear-gradient(to bottom right, ${section.bgColor}15, ${section.bgColor}25)`,
              borderColor: `${section.color}30`
            }}
          >
            <div className={`grid ${gridClass} gap-6`}>
              {visibleFields.map(field => renderField(field, section.color))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-card dark:bg-gray-900 rounded-xl shadow-2xl w-full ${modalSizeClass} max-h-[90vh] flex flex-col`}>

        {/* Header */}
        <div
          className="px-6 py-4"
          style={{ background: modalHeaderColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-card/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Icon name={modalHeaderIcon} className="text-white" size="lg" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-white mb-1 truncate">
                  {modalTitle}
                </h2>
                {modalSubtitle && (
                  <p className="text-white/80 text-sm">
                    {modalSubtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              className="w-10 h-10 bg-card/10 hover:bg-card/20 rounded-xl flex items-center justify-center transition-all duration-200 group backdrop-blur-sm flex-shrink-0"
              onClick={onCancel || onClose}
            >
              <Icon name="times" className="text-white group-hover:scale-110 transition-transform" size="lg" />
            </button>
          </div>
        </div>

        {/* Form wrapper for content and footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {modalSections.map(renderSection)}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-background dark:bg-gray-800 border-t border-gray-200 dark:border-0 px-8 py-6">
            <div className="flex flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                * Campos obrigatórios
              </p>
              <div className="flex flex-row items-center gap-3 w-auto">
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="w-auto order-2 px-8 py-3 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                  style={{ background: modalHeaderColor }}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Icon name={isEdit || isEditing ? 'save' : 'plus'} size="sm" />
                      <span>{isEdit || isEditing ? 'Atualizar' : 'Cadastrar'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onCancel || onClose}
                  disabled={saving}
                  className="w-auto order-1 px-6 py-3 border border-gray-300 dark:border-0 rounded-xl bg-card dark:bg-gray-700 text-foreground font-medium hover:bg-background dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
