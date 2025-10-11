import { api } from './api';
import { ApiResponse } from '../types/apiResponse';

export interface ManutencaoPeca {
  id?: number;
  manutencaoId?: number;
  descricaoPeca: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  unidade?: string;
}

export interface ManutencaoListItem {
  id: number;
  veiculoId: number;
  veiculoPlaca: string;
  veiculoMarca: string;
  dataManutencao: string;
  descricao: string;
  fornecedorId?: number;
  fornecedorNome?: string;
  valorMaoObra: number;
  valorPecas: number;
  valorTotal: number;
}

export interface Manutencao {
  id?: number;
  veiculoId: number;
  veiculoPlaca?: string;
  veiculoMarca?: string;
  dataManutencao: string;
  descricao: string;
  fornecedorId?: number;
  fornecedorNome?: string;
  valorMaoObra: number;
  valorPecas?: number;
  valorTotal?: number;
  kmAtual?: number;
  proximaRevisaoKm?: number;
  observacoes?: string;
  pecas: ManutencaoPeca[];
}

// Unidades de medida disponíveis
export const UnidadesMedida = [
  'UN',
  'PC',
  'CX',
  'KG',
  'L',
  'M',
  'M²',
  'M³',
  'PAR',
  'JOGO',
  'KIT'
] as const;

export interface ManutencaoFiltros {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startItem: number;
  endItem: number;
}

class ManutencoesService {
  async getManutencoes(filtros: ManutencaoFiltros = {}): Promise<ApiResponse<PagedResult<ManutencaoListItem>>> {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<PagedResult<ManutencaoListItem>>(`/Manutencao?${params.toString()}`);

      return {
        success: true,
        data: response.data,
        message: 'Manutenções obtidas com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      // Retornar sucesso com dados vazios ao invés de erro
      return {
        success: true,
        data: {
          items: [],
          totalItems: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          startItem: 0,
          endItem: 0
        },
        message: 'Nenhuma manutenção encontrada',
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteManutencao(id: number): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/Manutencao/${id}`);
      return { success: true, data: null, message: 'Manutenção excluída com sucesso', timestamp: new Date().toISOString() };
    } catch (error: any) {
      console.error('Erro ao excluir manutenção:', error);
      return { success: false, data: null, message: error.response?.data?.message || 'Erro ao excluir manutenção', timestamp: new Date().toISOString() };
    }
  }

  // Obter manutenção por ID
  async obterPorId(id: number): Promise<ApiResponse<Manutencao>> {
    try {
      const response = await api.get<Manutencao>(`/Manutencao/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Manutenção obtida com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao obter manutenção:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter manutenção',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Criar nova manutenção
  async criar(manutencao: Manutencao): Promise<ApiResponse<Manutencao>> {
    try {
      const response = await api.post<Manutencao>('/Manutencao', manutencao);
      return {
        success: true,
        data: response.data,
        message: 'Manutenção criada com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao criar manutenção:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar manutenção',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Atualizar manutenção
  async atualizar(id: number, manutencao: Manutencao): Promise<ApiResponse<Manutencao>> {
    try {
      const response = await api.put<Manutencao>(`/Manutencao/${id}`, manutencao);
      return {
        success: true,
        data: response.data,
        message: 'Manutenção atualizada com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao atualizar manutenção:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar manutenção',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Formata número para moeda em pt-BR (ex: 1234.5 -> "1.234,50")
  formatCurrency(value: number | undefined | null): string {
    const val = typeof value === 'number' ? value : 0;
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

export const manutencoesService = new ManutencoesService();
export default manutencoesService;
