import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

interface UsePermissionsReturn {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  loading: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { user, token } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      console.log('usePermissions: Loading permissions...', { token: !!token, user: !!user });

      if (!token || !user) {
        console.log('usePermissions: No token or user, skipping permission load');
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';
        const url = `${API_BASE_URL}/permissoes/user`;
        console.log('usePermissions: Fetching permissions from:', url);

        const response = await authService.fetchWithAuth(url);

        if (response.ok) {
          const userPermissions = await response.json();
          console.log('usePermissions: Permissions loaded:', userPermissions);

          // Em desenvolvimento, se não houver permissões (token antigo sem CargoId),
          // dar acesso total para não bloquear o desenvolvedor
          const isDevelopment = process.env.NODE_ENV === 'development';
          if (isDevelopment && (!userPermissions || userPermissions.length === 0)) {
            console.warn('usePermissions: [DEV MODE] No permissions returned. Token may be old. Granting full access. Please logout and login again for proper permissions.');
            // Retornar todas as permissões possíveis em dev
            setPermissions(['*']); // Wildcard para aceitar qualquer permissão
          } else {
            setPermissions(userPermissions || []);
          }
        } else {
          console.error('usePermissions: Error response status:', response.status);
          const errorText = await response.text();
          console.error('usePermissions: Error response body:', errorText);

          // Em desenvolvimento, dar acesso total em caso de erro
          const isDevelopment = process.env.NODE_ENV === 'development';
          if (isDevelopment) {
            console.warn('usePermissions: [DEV MODE] Permission fetch failed. Granting full access.');
            setPermissions(['*']);
          } else {
            setPermissions([]);
          }
        }
      } catch (error) {
        console.error('usePermissions: Exception loading permissions:', error);

        // Em desenvolvimento, dar acesso total em caso de erro
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
          console.warn('usePermissions: [DEV MODE] Permission exception. Granting full access.');
          setPermissions(['*']);
        } else {
          setPermissions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [token, user]);

  const hasPermission = (permission: string): boolean => {
    // Wildcard em desenvolvimento dá acesso total
    if (permissions.includes('*')) {
      return true;
    }
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    // Wildcard em desenvolvimento dá acesso total
    if (permissions.includes('*')) {
      return true;
    }
    return permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    // Wildcard em desenvolvimento dá acesso total
    if (permissions.includes('*')) {
      return true;
    }
    return permissionList.every(permission => permissions.includes(permission));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading
  };
}