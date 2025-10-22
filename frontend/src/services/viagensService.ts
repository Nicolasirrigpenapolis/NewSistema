import { api } from './api';
import { ApiResponse } from '../types/apiResponse';

// Tipos para Despesas
export interface DespesaViagem {
  id?: number;
  viagemId?: number;
  tipoDespesa: string;
  descricao: string;
  valor: number;
  dataDespesa: string;
  local?: string;
  observacoes?: string;
}

// Tipos para Receitas
export interface ReceitaViagem {
  id?: number;
  viagemId?: number;
  descricao: string;
  valor: number;
  dataReceita: string;
  origem?: string;
  observacoes?: string;
}

// Tipo principal de Viagem
export interface Viagem {
  id?: number;
  veiculoId: number;
  veiculoPlaca?: string;
  veiculoMarca?: string;
  condutorId?: number;
  motoristaNome?: string;
  condutorNome?: string;
  dataInicio: string;
  dataFim: string;
  origemDestino?: string;
  kmInicial?: number;
  kmFinal?: number;
  observacoes?: string;
  receitaTotal?: number;
  totalDespesas?: number;
  saldoLiquido?: number;
  despesas: DespesaViagem[];
  receitas: ReceitaViagem[];
}

// Tipos de despesa disponíveis
export const TiposDespesa = {
  Combustivel: 'Combustível',
  Pedagio: 'Pedágio',
  Alimentacao: 'Alimentação',
  Hospedagem: 'Hospedagem',
  ManutencaoRota: 'Manutenção em Rota',
  Multa: 'Multa',
  Seguro: 'Seguro',
  Documentacao: 'Documentação',
  Lavagem: 'Lavagem',
  Estacionamento: 'Estacionamento',
  Outros: 'Outros'
} as const;

export const TodosTiposDespesa = Object.values(TiposDespesa);

// Interface para resposta paginada
export interface ViagensPagedResponse {
  items: Viagem[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

class ViagensService {
  private readonly baseUrl = '/Viagem';

  // Listar todas as viagens
  async listar(): Promise<ApiResponse<ViagensPagedResponse>> {
    try {
      const response = await api.get<ViagensPagedResponse>(this.baseUrl);
      return {
        success: true,
        data: response.data,
        message: 'Viagens obtidas com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao listar viagens:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao listar viagens',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Obter viagem por ID
  async obterPorId(id: number): Promise<ApiResponse<Viagem>> {
    try {
      const response = await api.get<Viagem>(`${this.baseUrl}/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Viagem obtida com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao obter viagem:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter viagem',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Criar nova viagem
  async criar(viagem: Viagem): Promise<ApiResponse<Viagem>> {
    try {
      const response = await api.post<Viagem>(this.baseUrl, viagem);
      return {
        success: true,
        data: response.data,
        message: 'Viagem criada com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao criar viagem:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erro ao criar viagem',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Atualizar viagem
  async atualizar(id: number, viagem: Viagem): Promise<ApiResponse<Viagem>> {
    try {
      const response = await api.put<Viagem>(`${this.baseUrl}/${id}`, viagem);
      return {
        success: true,
        data: response.data,
        message: 'Viagem atualizada com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao atualizar viagem:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erro ao atualizar viagem',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Excluir viagem
  async excluir(id: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return {
        success: true,
        data: undefined,
        message: 'Viagem excluída com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao excluir viagem:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erro ao excluir viagem',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const viagensService = new ViagensService();
export default viagensService;
