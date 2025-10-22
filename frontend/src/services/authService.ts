/**
 * SERVIÇO DE AUTENTICAÇÃO
 * Sistema completo de autenticação JWT com gestão de tokens e usuários
 * Teste de modificação - authService.ts
 */

// IMPORTANDO TIPOS CENTRALIZADOS
import {
  LoginRequest,
  RegisterRequest,
  UserInfo,
  LoginResponse,
  ApiResponseAlternativo as ApiResponse
} from '../types/apiResponse';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

// Constantes para localStorage
const TOKEN_KEY = 'mdfe_token';
const USER_KEY = 'mdfe_user';
const REFRESH_KEY = 'mdfe_refresh';

class AuthService {
  /**
   * Fazer login no sistema
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      // Obter tenant do localStorage
      const tenantId = localStorage.getItem('empresaSelecionada');
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tenantId ? { 'X-Tenant-Id': tenantId } : {})
        },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (response.ok) {
        // Salvar dados no localStorage
        this.setToken(result.token);
        this.setUser(result.user);

        return {
          sucesso: true,
          data: result,
          mensagem: 'Login realizado com sucesso'
        };
      } else {
        return {
          sucesso: false,
          mensagem: result.message || 'Erro ao fazer login'
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Registrar novo usuário
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<void>> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      return {
        sucesso: response.ok,
        mensagem: result.message || (response.ok ? 'Usuário criado com sucesso' : 'Erro ao criar usuário')
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Listar usuários
   */
  async getUsers(): Promise<ApiResponse<any[]>> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const users = await response.json();
        return {
          sucesso: true,
          data: users,
          mensagem: 'Usuários carregados com sucesso'
        };
      } else {
        return {
          sucesso: false,
          mensagem: 'Erro ao carregar usuários'
        };
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Atualizar usuário existente
   */
  async updateUser(id: number, userData: Partial<RegisterRequest> & { email?: string; ativo?: boolean }): Promise<ApiResponse<void>> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        return {
          sucesso: true,
          mensagem: 'Usuário atualizado com sucesso'
        };
      } else {
        const result = await response.json();
        return {
          sucesso: false,
          mensagem: result.message || 'Erro ao atualizar usuário'
        };
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Excluir usuário
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok || response.status === 204) {
        return {
          sucesso: true,
          mensagem: 'Usuário excluído com sucesso'
        };
      } else {
        const result = await response.json();
        return {
          sucesso: false,
          mensagem: result.message || 'Erro ao excluir usuário'
        };
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Fazer logout
   */
  logout(): void {
    this.clearAuthData();
  }

  /**
   * Limpar dados de autenticação
   */
  private clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar se token não expirou
    try {
      const payload = this.parseJWT(token);
      const now = Date.now() / 1000;

      if (payload.exp && payload.exp < now) {
        // Token expirado, limpar dados mas não redirecionar
        this.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      // Token inválido, limpar dados mas não redirecionar
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Obter dados do usuário atual
   */
  getCurrentUser(): UserInfo | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error);
      return null;
    }
  }

  /**
   * Obter token de acesso
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Salvar token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Salvar dados do usuário
   */
  setUser(user: UserInfo): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Obter header de autorização para requests
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};

    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Interceptor para requests automáticos
   */
  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const authHeaders = this.getAuthHeader();

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    });

    // Se retornar 401, token expirou
    if (response.status === 401) {
      this.clearAuthData();
      throw new Error('Sessão expirada');
    }

    return response;
  }

  /**
   * Utilitários privados
   */
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Obter tempo restante do token (em minutos)
   */
  getTokenTimeRemaining(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const payload = this.parseJWT(token);
      const now = Date.now() / 1000;
      const timeRemaining = payload.exp - now;

      return Math.max(0, Math.floor(timeRemaining / 60));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Verificar se token expira em breve (15 minutos)
   */
  shouldRefreshToken(): boolean {
    const timeRemaining = this.getTokenTimeRemaining();
    return timeRemaining <= 15 && timeRemaining > 0;
  }



  /**
   * Obter estatísticas da sessão
   */
  getSessionInfo(): {
    isAuthenticated: boolean;
    user: UserInfo | null;
    tokenTimeRemaining: number;
    shouldRefresh: boolean;
  } {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.getCurrentUser(),
      tokenTimeRemaining: this.getTokenTimeRemaining(),
      shouldRefresh: this.shouldRefreshToken()
    };
  }
}

export const authService = new AuthService();
