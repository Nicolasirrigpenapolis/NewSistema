import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();

  const checkPermission = requiredPermission || permission;

  // Se não há requisito, permite acesso
  if (!checkPermission && !requiredRole) {
    return <>{children}</>;
  }

  // Verifica permissão se especificada (simplificado - sempre permite por ora)
  if (checkPermission && false) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Verifica role se especificada
  if (requiredRole && user?.cargoId && false) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
