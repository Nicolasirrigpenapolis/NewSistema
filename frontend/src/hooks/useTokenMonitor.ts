import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 🔔 Hook para monitorar status do token e avisar sobre expiração
 */
export function useTokenMonitor() {
  const { tokenTimeRemaining, shouldRefreshToken, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [warningShown, setWarningShown] = useState(false);

  // Não executar em páginas de autenticação
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/auth');

  useEffect(() => {
    // Não executar em páginas de autenticação ou se não estiver autenticado
    if (isAuthPage || !isAuthenticated) {
      return;
    }

    // Em desenvolvimento, desabilitar monitoramento de token
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      return;
    }

    // Reset warning quando o token é renovado
    if (tokenTimeRemaining > 5) {
      setWarningShown(false);
      setShowWarning(false);
    }

    // Mostrar aviso quando token está próximo do vencimento
    if (shouldRefreshToken && tokenTimeRemaining <= 5 && tokenTimeRemaining > 0 && !warningShown) {
      setShowWarning(true);
      setWarningShown(true);
    }

    // Auto-logout quando token expira
    if (tokenTimeRemaining <= 0) {
      logout();
    }
  }, [isAuthPage, isAuthenticated, tokenTimeRemaining, shouldRefreshToken, logout, warningShown]);

  const handleContinueSession = () => {
    setShowWarning(false);
    // Aqui poderia implementar refresh automático do token se necessário
  };

  const handleLogout = () => {
    setShowWarning(false);
    logout();
  };

  return {
    showWarning,
    tokenTimeRemaining,
    onContinue: handleContinueSession,
    onLogout: handleLogout
  };
}