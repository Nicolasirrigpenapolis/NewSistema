import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService';
import { UserInfo, LoginRequest, RegisterRequest } from '../types/apiResponse';

interface AuthContextType {
  // Estado de autenticação
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  token: string | null;

  // Ações de autenticação
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  // Informações da sessão
  tokenTimeRemaining: number;
  shouldRefreshToken: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokenTimeRemaining, setTokenTimeRemaining] = useState<number>(0);
  const [token, setToken] = useState<string | null>(null);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = authService.isAuthenticated();
        const currentUser = authService.getCurrentUser();
        const currentToken = authService.getToken();

        setIsAuthenticated(authenticated);
        setUser(currentUser);
        setToken(currentToken);

        if (authenticated) {
          updateTokenInfo();
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Timer para atualizar informações do token
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        updateTokenInfo();
      }, 60000); // Atualizar a cada minuto

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);


  /**
   * Atualizar informações do token
   */
  const updateTokenInfo = () => {
    const timeRemaining = authService.getTokenTimeRemaining();
    setTokenTimeRemaining(timeRemaining);

    // Se token expirou, fazer logout automático (apenas em produção)
    if (timeRemaining <= 0 && isAuthenticated) {
      handleLogout();
    }
  };

  /**
   * Fazer login
   */
  const handleLogin = async (credentials: LoginRequest): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);

      const response = await authService.login(credentials);

      if (response.sucesso && response.data) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        setToken(response.data.token);
        updateTokenInfo();

        return {
          success: true,
          message: 'Login realizado com sucesso'
        };
      } else {
        return {
          success: false,
          message: response.mensagem || 'Erro ao fazer login'
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrar usuário
   */
  const handleRegister = async (userData: RegisterRequest): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);

      const response = await authService.register(userData);

      return {
        success: response.sucesso,
        message: response.mensagem || (response.sucesso ? 'Usuário criado com sucesso' : 'Erro ao criar usuário')
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fazer logout
   */
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setTokenTimeRemaining(0);
    authService.logout();

    // Redirecionar para login apenas se não estivermos já lá
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  const contextValue: AuthContextType = {
    // Estado
    isAuthenticated,
    user,
    loading,
    token,

    // Ações
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,

    // Informações da sessão
    tokenTimeRemaining,
    shouldRefreshToken: authService.shouldRefreshToken()
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}

/**
 * Hook para verificar se usuário está autenticado
 */
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      window.location.href = '/login';
    }
  }, [auth.loading, auth.isAuthenticated]);

  return auth;
}

/**
 * Hook para obter informações do usuário atual
 */
export function useCurrentUser(): UserInfo | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook para monitorar expiração do token
 */
export function useTokenMonitor() {
  const { tokenTimeRemaining, shouldRefreshToken, logout } = useAuth();

  useEffect(() => {
    // Avisar quando token está próximo do vencimento
    if (shouldRefreshToken && tokenTimeRemaining <= 5) {
      const userConfirmed = window.confirm(
        `Sua sessão expirará em ${tokenTimeRemaining} minutos. Deseja continuar?`
      );

      if (!userConfirmed) {
        logout();
      }
    }
  }, [shouldRefreshToken, tokenTimeRemaining, logout]);

  return {
    tokenTimeRemaining,
    shouldRefreshToken
  };
}