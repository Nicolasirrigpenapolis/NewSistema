import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

export interface Permissao {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  modulo: string;
  ativo: boolean;
  dataCriacao: string;
}

class PermissoesService {
  private getHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getAllPermissoes(): Promise<Permissao[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/permissoes`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar permissões');
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      return [];
    }
  }

  async getModulos(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/permissoes/modulos`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar módulos');
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      return [];
    }
  }

  async getPermissoesByModulo(modulo: string): Promise<Permissao[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/permissoes/modulo/${encodeURIComponent(modulo)}`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar permissões do módulo');
    } catch (error) {
      console.error('Erro ao buscar permissões do módulo:', error);
      return [];
    }
  }

  async getPermissoesByCargo(cargoId: number): Promise<Permissao[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/permissoes/cargo/${cargoId}`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar permissões do cargo');
    } catch (error) {
      console.error('Erro ao buscar permissões do cargo:', error);
      return [];
    }
  }

  async atribuirPermissaoToCargo(cargoId: number, permissaoId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/permissoes/cargo/${cargoId}/permissao/${permissaoId}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao atribuir permissão:', error);
      return false;
    }
  }

  async removerPermissaoFromCargo(cargoId: number, permissaoId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/permissoes/cargo/${cargoId}/permissao/${permissaoId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao remover permissão:', error);
      return false;
    }
  }

  async atualizarPermissoesCargo(cargoId: number, permissaoIds: number[]): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/cargos/${cargoId}/permissoes/bulk`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(permissaoIds),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao atualizar permissões do cargo:', error);
      return false;
    }
  }

  async getUserPermissions(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/permissoes/user`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar permissões do usuário');
    } catch (error) {
      console.error('Erro ao buscar permissões do usuário:', error);
      return [];
    }
  }

  async userHasPermission(permissionCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/permissoes/user/has/${encodeURIComponent(permissionCode)}`, {
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }
}

export const permissoesService = new PermissoesService();