import { useEffect } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { usePermissionContext } from '../../contexts/PermissionContext';
import { useToast } from '../../contexts/ToastContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  permission?: string;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  requiredPermission,
  requiredRole,
  permission,
  fallback 
}: PermissionGuardProps) {
  const { loading, hasPermission, permissions } = usePermissionContext();
  const { showToast } = useToast();
  const navigate: NavigateFunction = useNavigate();

  const checkPermission = requiredPermission || permission;

  const shouldSkipPermissionCheck = !checkPermission && !requiredRole;
  
  // CORREÇÃO: Só negar acesso se as permissões foram carregadas E o usuário realmente não tem a permissão
  // Se permissions.length === 0, significa que ainda não foram carregadas, então não podemos negar acesso
  const permissionsLoaded = !loading && permissions.length > 0;
  const isDenied = !shouldSkipPermissionCheck && Boolean(checkPermission) && permissionsLoaded && !hasPermission(checkPermission!);

  useEffect(() => {
    if (isDenied) {
      console.log('[PermissionGuard] Acesso negado. Permissão necessária:', checkPermission);
      console.log('[PermissionGuard] Permissões do usuário:', permissions.length);
      showToast('Acesso negado', { title: 'Permissões', variant: 'error' });
      navigate('/dashboard', { replace: true });
    }
  }, [isDenied, navigate, showToast, checkPermission, permissions]);

  if (shouldSkipPermissionCheck) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Verificando permissões...
        </div>
      </div>
    );
  }

  if (isDenied) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
}
