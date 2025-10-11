import React from 'react';
import Icon from '../Icon';
import { GenericViewModalProps, ModalField, ModalSection } from '../../../types/modal';

export function GenericViewModal<T = any>({
  isOpen,
  onClose,
  item,
  title,
  subtitle,
  headerIcon,
  headerColor,
  sections,
  actions = [],
  statusConfig,
  idField = 'id',
  copyableFields = []
}: GenericViewModalProps<T>) {
  if (!isOpen || !item) return null;

  // Calcular tamanho do modal baseado no número de campos
  const totalFields = sections.reduce((total, section) =>
    total + section.fields.filter(field => field.show !== false).length, 0
  );
  const isCompact = totalFields <= 4;
  const modalSizeClass = isCompact ? 'max-w-2xl' : 'max-w-4xl';

  const formatValue = (field: ModalField): string => {
    if (field.value === null || field.value === undefined || field.value === '') {
      return 'N/A';
    }

    if (field.formatter) {
      return field.formatter(field.value);
    }

    switch (field.type) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(Number(field.value));

      case 'date':
        return new Date(String(field.value)).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

      case 'boolean':
        return field.value ? 'Sim' : 'Não';

      case 'status':
      case 'badge':
        return String(field.value);

      default:
        return String(field.value);
    }
  };

  const renderField = (field: ModalField, sectionColor: string) => {
    if (field.show === false) return null;

    const formattedValue = formatValue(field);
    const colSpanClass = field.colSpan === 2 ? 'col-span-2' : field.colSpan === 3 ? 'col-span-3' : '';

    return (
      <div key={field.label} className={`space-y-2 ${colSpanClass}`}>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {field.icon && <Icon name={field.icon} className={sectionColor} size="sm" />}
          {field.label}
        </label>
        <div className="px-4 py-3 bg-card rounded-xl border border-gray-200 dark:border-0">
          {field.type === 'status' && statusConfig ? (
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit"
              style={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.textColor
              }}
            >
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <span>{formattedValue}</span>
            </div>
          ) : field.type === 'code' ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-foreground break-all">
                {formattedValue}
              </code>
              {copyableFields.some(cf => cf.fieldKey === field.label) && (
                <button
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  onClick={() => navigator.clipboard.writeText(String(field.value))}
                  title="Copiar"
                >
                  <Icon name="copy" size="sm" />
                </button>
              )}
            </div>
          ) : field.type === 'currency' ? (
            <span className="text-xl font-bold text-green-600 dark:text-green-400">{formattedValue}</span>
          ) : (
            <span className="font-medium text-foreground">{formattedValue}</span>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (section: ModalSection) => {
    const visibleFields = section.fields.filter(field => field.show !== false);
    if (visibleFields.length === 0) return null;

    const columns = section.columns || 2;
    const gridClass = columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2';

    return (
      <div key={section.title} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(to bottom right, ${section.color}, ${section.bgColor})` }}
          >
            <Icon name={section.icon} className="text-white" size="sm" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{section.title}</h3>
            {section.subtitle && (
              <p className="text-muted-foreground text-sm">{section.subtitle}</p>
            )}
          </div>
        </div>

        <div
          className="rounded-xl p-4 border"
          style={{
            background: `linear-gradient(to bottom right, ${section.bgColor}15, ${section.bgColor}25)`,
            borderColor: `${section.color}30`
          }}
        >
          <div className={`grid ${gridClass} gap-4`}>
            {visibleFields.map(field => renderField(field, section.color))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-card dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-0 shadow-xl ${modalSizeClass} w-full mx-4 max-h-[85vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div
          className="px-6 py-4"
          style={{ background: headerColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-card/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Icon name={headerIcon} className="text-white" size="lg" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-white mb-1 truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-white/80 text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {statusConfig && (
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mr-4"
                style={{
                  backgroundColor: statusConfig.bgColor,
                  color: statusConfig.textColor
                }}
              >
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <span>{statusConfig.value}</span>
              </div>
            )}

            <button
              className="w-10 h-10 bg-card/10 hover:bg-card/20 rounded-xl flex items-center justify-center transition-all duration-200 group backdrop-blur-sm flex-shrink-0"
              onClick={onClose}
            >
              <Icon name="times" className="text-white group-hover:scale-110 transition-transform" size="lg" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {sections.map(renderSection)}
        </div>

        {/* Footer */}
        {(actions.length > 0 || idField) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 dark:border-0 bg-background dark:bg-gray-800">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="info-circle" size="sm" />
              <span>ID: {(item as any)[idField] || 'N/A'}</span>
            </div>

            {actions.length > 0 && (
              <div className="flex items-center gap-3">
                {actions.map((action, index) => {
                  const isDefaultVariant = !action.variant;
                  return (
                    <button
                      key={index}
                      className={`order-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        action.variant === 'danger'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : action.variant === 'primary'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : action.variant === 'warning'
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : action.variant === 'success'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'text-white hover:brightness-110'
                      }`}
                      style={isDefaultVariant ? { background: headerColor } : undefined}
                      onClick={action.onClick}
                      disabled={action.disabled || action.loading}
                    >
                      {action.loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Icon name={action.icon} size="sm" />
                      )}
                      <span>{action.label}</span>
                    </button>
                  );
                })}

                <button
                  className="order-1 px-6 py-3 border border-gray-300 dark:border-0 rounded-xl bg-card dark:bg-gray-700 text-foreground font-medium hover:bg-background dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={onClose}
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
