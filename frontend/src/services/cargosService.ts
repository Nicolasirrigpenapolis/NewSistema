import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

export interface Cargo {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  dataCriacao: string;
  dataUltimaAlteracao?: string;
  quantidadeUsuarios: number;
}

export interface CargoCreateRequest {
  nome: string;
  descricao?: string;
}

export interface CargoUpdateRequest {
  nome: string;
  descricao?: string;
  ativo: boolean;
}

class CargosService {
  private getAuthHeaders() {
    return authService.getAuthHeader();
  }

  async listarCargos(): Promise<Cargo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cargos`, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao listar cargos:', error);
      throw error;
    }
  }

  async obterCargo(id: number): Promise<Cargo> {
    try {
      const response = await fetch(`${API_BASE_URL}/cargos/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter cargo:', error);
      throw error;
    }
  }

  async criarCargo(dados: CargoCreateRequest): Promise<Cargo> {
    try {
      const response = await fetch(`${API_BASE_URL}/cargos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      throw error;
    }
  }

  async atualizarCargo(id: number, dados: CargoUpdateRequest): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/cargos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      throw error;
    }
  }

  async excluirCargo(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/cargos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Erro ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao excluir cargo:', error);
      throw error;
    }
  }
}

export const cargosService = new CargosService();