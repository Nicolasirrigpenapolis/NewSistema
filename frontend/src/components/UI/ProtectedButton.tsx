import React, { ButtonHTMLAttributes } from 'react';
import { usePermissionContext } from '../../contexts/PermissionContext';

interface ProtectedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  children: React.ReactNode;
}

export function ProtectedButton({
  permission,
  permissions = [],
  requireAll = false,
  children,
  disabled,
  ...props
}: ProtectedButtonProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissionContext();

  // Se ainda está carregando, desabilitar o botão
  if (loading) {
    return (
      <button {...props} disabled={true}>
        {children}
      </button>
    );
  }

  let hasAccess = true;

  // Verificar permissão única
  if (permission) {
    hasAccess = hasPermission(permission);
  }

  // Verificar múltiplas permissões
  if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Se não tem acesso, não renderizar o botão
  if (!hasAccess) {
    return null;
  }

  return (
    <button {...props} disabled={disabled}>
      {children}
    </button>
  );
}