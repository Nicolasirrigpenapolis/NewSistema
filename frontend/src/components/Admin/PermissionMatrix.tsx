import React, { useState, useEffect } from 'react';
import { permissoesService, Permissao } from '../../services/permissoesService';

interface PermissionMatrixProps {
  cargoId: number;
  onPermissionsChange?: () => void;
}

export function PermissionMatrix({ cargoId, onPermissionsChange }: PermissionMatrixProps) {
  const [allPermissions, setAllPermissions] = useState<Permissao[]>([]);
  const [cargoPermissions, setCargoPermissions] = useState<Permissao[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [cargoId]);

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

  const hasPermission = (permissaoId: number): boolean => {
    return cargoPermissions.some(p => p.id === permissaoId);
  };

  const togglePermission = async (permissao: Permissao) => {
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
    setSaving(true);
    try {
      const modulePermissions = allPermissions.filter(p => p.modulo === modulo);
      const allHasPermission = modulePermissions.every(p => hasPermission(p.id));

      for (const permission of modulePermissions) {
        if (allHasPermission) {
          // Remover todas as permissões do módulo
          await permissoesService.removerPermissaoFromCargo(cargoId, permission.id);
        } else {
          // Adicionar apenas as que não tem
          if (!hasPermission(permission.id)) {
            await permissoesService.atribuirPermissaoToCargo(cargoId, permission.id);
          }
        }
      }

      // Recarregar permissões do cargo
      const cargoPerms = await permissoesService.getPermissoesByCargo(cargoId);
      setCargoPermissions(cargoPerms);
      onPermissionsChange?.();
    } catch (error) {
      console.error('Erro ao alterar permissões do módulo:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Carregando permissões...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Matriz de Permissões
        </h3>
        <div className="text-sm text-muted-foreground">
          {cargoPermissions.length} de {allPermissions.length} permissões ativas
        </div>
      </div>

      {modules.map(modulo => {
        const modulePermissions = allPermissions.filter(p => p.modulo === modulo);
        const hasAllPermissions = modulePermissions.every(p => hasPermission(p.id));
        const hasSomePermissions = modulePermissions.some(p => hasPermission(p.id));

        return (
          <div key={modulo} className="border border-gray-200 dark:border-0 rounded-lg">
            <div className="bg-background dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">{modulo}</h4>
                <button
                  onClick={() => toggleAllInModule(modulo)}
                  disabled={saving}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    hasAllPermissions
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {hasAllPermissions ? 'Remover Todas' : 'Adicionar Todas'}
                </button>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {modulePermissions.filter(p => hasPermission(p.id)).length} de {modulePermissions.length} permissões
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {modulePermissions.map(permissao => (
                  <div
                    key={permissao.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      hasPermission(permissao.id)
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-background border-gray-200 dark:bg-gray-800 dark:border-0'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={hasPermission(permissao.id)}
                      onChange={() => togglePermission(permissao)}
                      disabled={saving}
                      className="mt-1 w-4 h-4 text-blue-600 bg-card border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">
                        {permissao.nome}
                      </div>
                      {permissao.descricao && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {permissao.descricao}
                        </div>
                      )}
                      <div className="text-xs font-mono text-gray-500 mt-1">
                        {permissao.codigo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-foreground">Atualizando permissões...</span>
          </div>
        </div>
      )}
    </div>
  );
}