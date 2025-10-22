import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

interface UsePermissionsReturn {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const { user, token } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPermissions = useCallback(async () => {
    if (!token || !user) {
      console.log('[PERMISSOES] Token ou usuário não encontrado, pulando carregamento');
      setPermissions([]);
      setLoading(false);
      return;
    }

    console.log('[PERMISSOES] Iniciando carregamento de permissões para:', user.nome || user.username, 'Cargo:', user.cargoNome);
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';
      const url = `${API_BASE_URL}/permissoes/user`;
      console.log('[PERMISSOES] Fazendo requisição para:', url);
      
      const response = await authService.fetchWithAuth(url);

      if (!response.ok) {
        console.error('[PERMISSOES] Resposta não OK:', response.status, response.statusText);
        setPermissions([]);
        return;
      }

      const userPermissions = await response.json();
      console.log('[PERMISSOES] Permissões recebidas:', userPermissions.length, 'permissões');
      console.log('[PERMISSOES] Lista de permissões:', userPermissions);
      
      setPermissions(Array.isArray(userPermissions) ? userPermissions : []);
    } catch (error) {
      console.error('[PERMISSOES] Erro ao carregar permissões:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const hasPermission = (permission: string): boolean => {
    const result = permissions.includes(permission);
    if (!result && permissions.length > 0) {
      console.log('[PERMISSOES] Permissão não encontrada:', permission);
      console.log('[PERMISSOES] Total de permissões:', permissions.length);
      console.log('[PERMISSOES] Primeiras 5 permissões:', permissions.slice(0, 5));
    }
    return result;
  };

  const hasAnyPermission = (permissionList: string[]): boolean =>
    permissionList.some((permission) => permissions.includes(permission));

  const hasAllPermissions = (permissionList: string[]): boolean =>
    permissionList.every((permission) => permissions.includes(permission));

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    refresh: loadPermissions,
  };
}