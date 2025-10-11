import React from 'react';
import Icon from '../UI/Icon';

interface PermissionPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  permissions: string[];
}

interface PermissionPresetsProps {
  onApplyPreset: (permissions: string[]) => void;
  disabled?: boolean;
}

export function PermissionPresets({ onApplyPreset, disabled = false }: PermissionPresetsProps) {
  const presets: PermissionPreset[] = [
    {
      id: 'viewer',
      name: 'Visualizador',
      description: 'Apenas visualizar dados, sem editar',
      icon: 'eye',
      color: 'blue',
      permissions: [
        'dashboard.view',
        'mdfe.read',
        'emitentes.read',
        'veiculos.read',
        'reboques.read',
        'condutores.read',
        'contratantes.read',
        'seguradoras.read',
        'municipios.read'
      ]
    },
    {
      id: 'operator',
      name: 'Operador',
      description: 'Criar e editar MDFes e cadastros básicos',
      icon: 'user',
      color: 'green',
      permissions: [
        'dashboard.view',
        'mdfe.create',
        'mdfe.read',
        'mdfe.update',
        'mdfe.transmit',
        'emitentes.read',
        'emitentes.update',
        'veiculos.create',
        'veiculos.read',
        'veiculos.update',
        'reboques.create',
        'reboques.read',
        'reboques.update',
        'condutores.create',
        'condutores.read',
        'condutores.update',
        'contratantes.create',
        'contratantes.read',
        'contratantes.update',
        'seguradoras.read',
        'municipios.read'
      ]
    },
    {
      id: 'manager',
      name: 'Gerente',
      description: 'Acesso completo exceto administração',
      icon: 'briefcase',
      color: 'purple',
      permissions: [
        'dashboard.view',
        'dashboard.stats',
        'mdfe.create',
        'mdfe.read',
        'mdfe.update',
        'mdfe.delete',
        'mdfe.transmit',
        'mdfe.cancel',
        'emitentes.create',
        'emitentes.read',
        'emitentes.update',
        'emitentes.delete',
        'veiculos.create',
        'veiculos.read',
        'veiculos.update',
        'veiculos.delete',
        'reboques.create',
        'reboques.read',
        'reboques.update',
        'reboques.delete',
        'condutores.create',
        'condutores.read',
        'condutores.update',
        'condutores.delete',
        'contratantes.create',
        'contratantes.read',
        'contratantes.update',
        'contratantes.delete',
        'seguradoras.create',
        'seguradoras.read',
        'seguradoras.update',
        'seguradoras.delete',
        'municipios.read',
        'municipios.import'
      ]
    },
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acesso total ao sistema',
      icon: 'crown',
      color: 'red',
      permissions: [
        'dashboard.view',
        'dashboard.stats',
        'mdfe.create',
        'mdfe.read',
        'mdfe.update',
        'mdfe.delete',
        'mdfe.transmit',
        'mdfe.cancel',
        'emitentes.create',
        'emitentes.read',
        'emitentes.update',
        'emitentes.delete',
        'veiculos.create',
        'veiculos.read',
        'veiculos.update',
        'veiculos.delete',
        'reboques.create',
        'reboques.read',
        'reboques.update',
        'reboques.delete',
        'condutores.create',
        'condutores.read',
        'condutores.update',
        'condutores.delete',
        'contratantes.create',
        'contratantes.read',
        'contratantes.update',
        'contratantes.delete',
        'seguradoras.create',
        'seguradoras.read',
        'seguradoras.update',
        'seguradoras.delete',
        'municipios.read',
        'municipios.import',
        'admin.users.create',
        'admin.users.read',
        'admin.users.update',
        'admin.users.delete',
        'admin.roles.create',
        'admin.roles.read',
        'admin.roles.update',
        'admin.roles.delete',
        'admin.permissions.read',
        'admin.permissions.assign'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-900 dark:text-blue-100',
        icon: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700 text-white'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-900 dark:text-green-100',
        icon: 'text-green-600 dark:text-green-400',
        button: 'bg-green-600 hover:bg-green-700 text-white'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-900 dark:text-purple-100',
        icon: 'text-purple-600 dark:text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700 text-white'
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-900 dark:text-red-100',
        icon: 'text-red-600 dark:text-red-400',
        button: 'bg-red-600 hover:bg-red-700 text-white'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Icon name="magic" size="sm" className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Templates de Permissões
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure rapidamente com perfis pré-definidos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {presets.map(preset => {
          const colors = getColorClasses(preset.color);

          return (
            <div
              key={preset.id}
              className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md`}
            >
              <div className="text-center mb-4">
                <div className={`w-12 h-12 ${colors.button} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon name={preset.icon} size="md" className="text-white" />
                </div>
                <h4 className={`font-bold text-lg ${colors.text} mb-1`}>
                  {preset.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {preset.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Permissões:</span>
                  <span className={`font-bold ${colors.text}`}>
                    {preset.permissions.length}
                  </span>
                </div>

                <button
                  onClick={() => onApplyPreset(preset.permissions)}
                  disabled={disabled}
                  className={`w-full px-4 py-2 ${colors.button} rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  <Icon name="download" size="sm" />
                  Aplicar Template
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Icon name="info-circle" size="sm" className="text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
              Importante
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Aplicar um template substituirá todas as permissões atuais do cargo.
              Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}