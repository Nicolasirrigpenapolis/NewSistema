import React, { useState, useEffect, useMemo } from 'react';
import { permissoesService, Permissao } from '../../services/permissoesService';
import { PermissionPresets } from './PermissionPresets';
import Icon from '../UI/Icon';

interface ModernPermissionModalProps {
  cargoId: number;
  cargoNome: string;
  isOpen: boolean;
  onClose: () => void;
  onPermissionsChange?: () => void;
}

interface ModuleStats {
  total: number;
  active: number;
  percentage: number;
}

export function ModernPermissionModal({
  cargoId,
  cargoNome,
  isOpen,
  onClose,
  onPermissionsChange
}: ModernPermissionModalProps) {
  const [allPermissions, setAllPermissions] = useState<Permissao[]>([]);
  const [cargoPermissions, setCargoPermissions] = useState<Permissao[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'permissions' | 'templates'>('permissions');

  // Verificar se é cargo Programador (protegido)
  const isProgramadorCargo = cargoNome === 'Programador';

  const loadData = async () => {
    setLoading(true);
    try {
      const [allPerms, cargoPerms, mods] = await Promise.all([
        permissoesService.getAllPermissoes(),
        permissoesService.getPermissoesByCargo(cargoId),
        permissoesService.getModulos()
      ]);

      setAllPermissions(allPerms);
      setCargoPermissions(cargoPerms);
      setModules(mods);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [cargoId, isOpen]);

  const hasPermission = (permissaoId: number): boolean => {
    return cargoPermissions.some(p => p.id === permissaoId);
  };

  const filteredPermissions = useMemo(() => {
    return allPermissions.filter(permission => {
      const matchesSearch = searchTerm === '' ||
        permission.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.codigo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule = selectedModule === '' || permission.modulo === selectedModule;

      return matchesSearch && matchesModule;
    });
  }, [allPermissions, searchTerm, selectedModule]);

  const moduleStats = useMemo(() => {
    const stats: Record<string, ModuleStats> = {};

    modules.forEach(module => {
      const modulePerms = allPermissions.filter(p => p.modulo === module);
      const activePerms = modulePerms.filter(p => hasPermission(p.id));

      stats[module] = {
        total: modulePerms.length,
        active: activePerms.length,
        percentage: modulePerms.length > 0 ? (activePerms.length / modulePerms.length) * 100 : 0
      };
    });

    return stats;
  }, [modules, allPermissions, cargoPermissions, hasPermission]);

  const totalStats = useMemo(() => {
    const total = allPermissions.length;
    const active = cargoPermissions.length;
    return {
      total,
      active,
      percentage: total > 0 ? (active / total) * 100 : 0
    };
  }, [allPermissions, cargoPermissions]);

  const togglePermission = async (permissao: Permissao) => {
    // Bloquear alterações no cargo Programador
    if (isProgramadorCargo) {
      alert('Não é possível modificar permissões do cargo Programador');
      return;
    }

    setSaving(true);
    try {
      const hasThisPermission = hasPermission(permissao.id);

      if (hasThisPermission) {
        const success = await permissoesService.removerPermissaoFromCargo(cargoId, permissao.id);
        if (success) {
          setCargoPermissions(prev => prev.filter(p => p.id !== permissao.id));
        }
      } else {
        const success = await permissoesService.atribuirPermissaoToCargo(cargoId, permissao.id);
        if (success) {
          setCargoPermissions(prev => [...prev, permissao]);
        }
      }

      onPermissionsChange?.();
    } catch (error) {
      console.error('Erro ao alterar permissão:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleAllInModule = async (modulo: string) => {
    // Bloquear alterações no cargo Programador
    if (isProgramadorCargo) {
      alert('Não é possível modificar permissões do cargo Programador');
      return;
    }

    setSaving(true);
    try {
      const modulePermissions = allPermissions.filter(p => p.modulo === modulo);
      const allHasPermission = modulePermissions.every(p => hasPermission(p.id));

      for (const permission of modulePermissions) {
        if (allHasPermission) {
          await permissoesService.removerPermissaoFromCargo(cargoId, permission.id);
        } else {
          if (!hasPermission(permission.id)) {
            await permissoesService.atribuirPermissaoToCargo(cargoId, permission.id);
          }
        }
      }

      const cargoPerms = await permissoesService.getPermissoesByCargo(cargoId);
      setCargoPermissions(cargoPerms);
      onPermissionsChange?.();
    } catch (error) {
      console.error('Erro ao alterar permissões do módulo:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleAllPermissions = async (grant: boolean) => {
    // Bloquear alterações no cargo Programador
    if (isProgramadorCargo) {
      alert('Não é possível modificar permissões do cargo Programador');
      return;
    }

    setSaving(true);
    try {
      for (const permission of allPermissions) {
        if (grant && !hasPermission(permission.id)) {
          await permissoesService.atribuirPermissaoToCargo(cargoId, permission.id);
        } else if (!grant && hasPermission(permission.id)) {
          await permissoesService.removerPermissaoFromCargo(cargoId, permission.id);
        }
      }

      const cargoPerms = await permissoesService.getPermissoesByCargo(cargoId);
      setCargoPermissions(cargoPerms);
      onPermissionsChange?.();
    } catch (error) {
      console.error('Erro ao alterar todas as permissões:', error);
    } finally {
      setSaving(false);
    }
  };

  const applyPermissionTemplate = async (templatePermissions: string[]) => {
    // Bloquear alterações no cargo Programador
    if (isProgramadorCargo) {
      alert('Não é possível modificar permissões do cargo Programador');
      return;
    }

    if (!window.confirm('Aplicar este template substituirá todas as permissões atuais. Confirma?')) {
      return;
    }

    setSaving(true);
    try {
      // Primeiro, remover todas as permissões atuais
      for (const permission of cargoPermissions) {
        await permissoesService.removerPermissaoFromCargo(cargoId, permission.id);
      }

      // Depois, adicionar as permissões do template
      for (const permissionCode of templatePermissions) {
        const permission = allPermissions.find(p => p.codigo === permissionCode);
        if (permission) {
          await permissoesService.atribuirPermissaoToCargo(cargoId, permission.id);
        }
      }

      // Recarregar permissões
      const cargoPerms = await permissoesService.getPermissoesByCargo(cargoId);
      setCargoPermissions(cargoPerms);
      onPermissionsChange?.();

      // Voltar para a aba de permissões para ver o resultado
      setActiveTab('permissions');
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modernizado */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-card/20 rounded-xl flex items-center justify-center">
                <Icon name="shield" size="lg" className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Gerenciar Permissões</h2>
                <p className="text-blue-100">Cargo: {cargoNome}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-card/20 hover:bg-card/30 rounded-xl flex items-center justify-center transition-all duration-200"
            >
              <Icon name="times" size="md" className="text-white" />
            </button>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-100">
                Progresso das Permissões
              </span>
              <span className="text-sm font-bold text-white">
                {totalStats.active} de {totalStats.total} ({Math.round(totalStats.percentage)}%)
              </span>
            </div>
            <div className="w-full bg-card/20 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalStats.percentage}%` }}
              />
            </div>
          </div>

          {/* Abas de Navegação */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'permissions'
                  ? 'bg-card/20 text-white'
                  : 'text-blue-100 hover:bg-card/10 hover:text-white'
              }`}
            >
              <Icon name="shield" size="sm" />
              Permissões
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'templates'
                  ? 'bg-card/20 text-white'
                  : 'text-blue-100 hover:bg-card/10 hover:text-white'
              }`}
            >
              <Icon name="magic" size="sm" />
              Templates
            </button>
          </div>
        </div>

        {/* Toolbar - apenas para aba de permissões */}
        {activeTab === 'permissions' && (
          <div className="p-6 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Icon
                name="search"
                size="sm"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar permissões por nome, descrição ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-0 rounded-xl bg-card dark:bg-gray-700 text-foreground placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-muted-foreground transition-colors"
                >
                  <Icon name="times" size="sm" />
                </button>
              )}
            </div>

            {/* Filtro por Módulo */}
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-0 rounded-xl bg-card dark:bg-gray-700 text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Todos os módulos</option>
              {modules.map(module => (
                <option key={module} value={module}>
                  {module} ({moduleStats[module]?.active}/{moduleStats[module]?.total})
                </option>
              ))}
            </select>

            {/* Toggle de Visualização */}
            <div className="flex bg-card dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-0 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground dark:hover:text-white'
                }`}
              >
                <Icon name="th" size="sm" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground dark:hover:text-white'
                }`}
              >
                <Icon name="list" size="sm" />
              </button>
            </div>

            {/* Ações em Lote */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleAllPermissions(true)}
                disabled={saving || totalStats.percentage === 100}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Icon name="check" size="sm" />
                Todas
              </button>
              <button
                onClick={() => toggleAllPermissions(false)}
                disabled={saving || totalStats.percentage === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Icon name="times" size="sm" />
                Nenhuma
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-medium text-muted-foreground">
                  Carregando permissões...
                </span>
              </div>
            </div>
          ) : activeTab === 'templates' ? (
            <div className="p-6">
              <PermissionPresets
                onApplyPreset={applyPermissionTemplate}
                disabled={saving}
              />
            </div>
          ) : (
            <div className="p-6">
              {selectedModule ? (
                // Visualização de módulo específico
                <ModulePermissions
                  module={selectedModule}
                  permissions={filteredPermissions.filter(p => p.modulo === selectedModule)}
                  hasPermission={hasPermission}
                  togglePermission={togglePermission}
                  toggleAllInModule={toggleAllInModule}
                  moduleStats={moduleStats[selectedModule]}
                  viewMode={viewMode}
                  saving={saving}
                />
              ) : (
                // Visualização por módulos
                <div className="space-y-6">
                  {modules.map(modulo => {
                    const modulePermissions = filteredPermissions.filter(p => p.modulo === modulo);
                    if (modulePermissions.length === 0) return null;

                    return (
                      <ModulePermissions
                        key={modulo}
                        module={modulo}
                        permissions={modulePermissions}
                        hasPermission={hasPermission}
                        togglePermission={togglePermission}
                        toggleAllInModule={toggleAllInModule}
                        moduleStats={moduleStats[modulo]}
                        viewMode={viewMode}
                        saving={saving}
                      />
                    );
                  })}
                </div>
              )}

              {filteredPermissions.length === 0 && (
                <div className="text-center py-16">
                  <Icon name="search" size="xl" className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhuma permissão encontrada
                  </h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros de busca
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-background dark:bg-gray-800 border-t border-gray-200 dark:border-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredPermissions.length > 0 && (
                <>Mostrando {filteredPermissions.length} permissões</>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Icon name="check" size="sm" />
              Concluir
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {saving && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-card rounded-2xl p-8 flex items-center gap-4 shadow-2xl">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg font-medium text-foreground">
                Atualizando permissões...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para módulo de permissões
interface ModulePermissionsProps {
  module: string;
  permissions: Permissao[];
  hasPermission: (id: number) => boolean;
  togglePermission: (permission: Permissao) => void;
  toggleAllInModule: (module: string) => void;
  moduleStats: ModuleStats;
  viewMode: 'grid' | 'list';
  saving: boolean;
}

function ModulePermissions({
  module,
  permissions,
  hasPermission,
  togglePermission,
  toggleAllInModule,
  moduleStats,
  viewMode,
  saving
}: ModulePermissionsProps) {
  const allActive = moduleStats.percentage === 100;

  return (
    <div className="bg-card rounded-2xl border border-gray-200 dark:border-0 overflow-hidden shadow-sm">
      {/* Header do Módulo */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-200 dark:border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Icon name="folder" size="sm" className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{module}</h3>
              <p className="text-sm text-muted-foreground">
                {moduleStats.active} de {moduleStats.total} permissões ativas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress Ring */}
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-300 dark:text-muted-foreground"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    moduleStats.percentage === 100 ? 'text-green-500' :
                    moduleStats.percentage > 50 ? 'text-blue-500' :
                    moduleStats.percentage > 0 ? 'text-yellow-500' :
                    'text-gray-300'
                  }`}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${moduleStats.percentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">
                  {Math.round(moduleStats.percentage)}%
                </span>
              </div>
            </div>

            {/* Toggle All Button */}
            <button
              onClick={() => toggleAllInModule(module)}
              disabled={saving}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                allActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Icon name={allActive ? 'minus' : 'plus'} size="sm" />
              {allActive ? 'Remover Todas' : 'Adicionar Todas'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Permissões */}
      <div className="p-6">
        <div className={`${
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
            : 'space-y-3'
        }`}>
          {permissions.map(permissao => (
            <PermissionCard
              key={permissao.id}
              permission={permissao}
              isActive={hasPermission(permissao.id)}
              onToggle={() => togglePermission(permissao)}
              viewMode={viewMode}
              disabled={saving}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente para card de permissão
interface PermissionCardProps {
  permission: Permissao;
  isActive: boolean;
  onToggle: () => void;
  viewMode: 'grid' | 'list';
  disabled: boolean;
}

function PermissionCard({ permission, isActive, onToggle, viewMode, disabled }: PermissionCardProps) {
  const cardClass = viewMode === 'grid'
    ? `p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group hover:shadow-md ${
        isActive
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
          : 'bg-background border-gray-200 dark:bg-gray-800 dark:border-0 hover:border-blue-300'
      }`
    : `p-4 rounded-lg border transition-all duration-200 cursor-pointer flex items-center gap-4 ${
        isActive
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
          : 'bg-background border-gray-200 dark:bg-gray-800 dark:border-0 hover:border-blue-300'
      }`;

  return (
    <div className={cardClass} onClick={onToggle}>
      <div className="flex items-start gap-3">
        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={onToggle}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-0 peer-checked:bg-blue-600"></div>
        </label>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground text-sm">
              {permission.nome}
            </h4>
            {isActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <Icon name="check" size="sm" className="mr-1" />
                Ativo
              </span>
            )}
          </div>

          {permission.descricao && (
            <p className="text-xs text-muted-foreground mb-2">
              {permission.descricao}
            </p>
          )}

          <code className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded font-mono">
            {permission.codigo}
          </code>
        </div>
      </div>
    </div>
  );
}