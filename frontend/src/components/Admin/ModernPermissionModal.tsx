import React, { useState } from 'react';
import { FormShell } from '../UI/FormShell';

interface Permission {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface ModernPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargoId: number;
  cargoNome: string;
  permissions?: Permission[];
  selectedPermissions?: number[];
  onSave?: (permissionIds: number[]) => Promise<void>;
  onPermissionsChange?: () => void;
}

export function ModernPermissionModal({
  isOpen,
  onClose,
  cargoId,
  cargoNome,
  permissions = [],
  selectedPermissions = [],
  onSave,
  onPermissionsChange
}: ModernPermissionModalProps) {
  const [selected, setSelected] = useState<number[]>(selectedPermissions);
  const [saving, setSaving] = useState(false);

  const handleToggle = (permissionId: number) => {
    setSelected(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selected);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FormShell
      title={`Gerenciar Permissões - ${cargoNome}`}
      subtitle="Selecione as permissões para este cargo"
      isModal
      onClose={onClose}
    >
      <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        {permissions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma permissão disponível
          </p>
        ) : (
          <div className="grid gap-3">
            {permissions.map(permission => (
              <label
                key={permission.id}
                className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(permission.id)}
                  onChange={() => handleToggle(permission.id)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {permission.nome}
                  </div>
                  {permission.descricao && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {permission.descricao}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </FormShell>
  );
}
