import { api } from './api';
import { ApiResponse, EntityOption } from '../types/apiResponse';

// Interfaces para Fornecedores
export interface Fornecedor {
  id: number;
  nome: string;
  cnpjCpf: string;
  tipoPessoa: 'F' | 'J'; // F = Física, J = Jurídica
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: string;
  dataUltimaAlteracao?: string;
}

export interface FornecedorCreateDto {
  nome: string;
  cnpjCpf: string;
  tipoPessoa: 'F' | 'J';
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface FornecedorUpdateDto extends FornecedorCreateDto {
  id: number;
}

export interface FornecedorListDto {
  id: number;
  nome: string;
  cnpjCpf: string;
  tipoPessoa: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  ativo: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FornecedorFiltros {
  nome?: string;
  cnpjCpf?: string;
  tipoPessoa?: string;
  ativo?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

class FornecedoresService {
  // Listar fornecedores com paginação
  async getFornecedores(filtros: FornecedorFiltros = {}): Promise<ApiResponse<PagedResult<FornecedorListDto>>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<PagedResult<FornecedorListDto>>(`/fornecedores?${params.toString()}`);

      return {
        success: true,
        data: response.data,
        message: 'Fornecedores listados com sucesso',
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
          hasPreviousPage: false
        },
        message: 'Nenhum fornecedor encontrado',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Obter fornecedor por ID
  async getFornecedorById(id: number): Promise<ApiResponse<Fornecedor>> {
    try {
      const response = await api.get<Fornecedor>(`/fornecedores/${id}`);

      return {
        success: true,
        data: response.data,
        message: 'Fornecedor encontrado com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao buscar fornecedor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar fornecedor',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Criar fornecedor
  async createFornecedor(fornecedor: FornecedorCreateDto): Promise<ApiResponse<Fornecedor>> {
    try {
      const response = await api.post<Fornecedor>('/fornecedores', fornecedor);

      return {
        success: true,
        data: response.data,
        message: 'Fornecedor criado com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao criar fornecedor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar fornecedor',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Atualizar fornecedor
  async updateFornecedor(fornecedor: FornecedorUpdateDto): Promise<ApiResponse<Fornecedor>> {
    try {
      const response = await api.put<Fornecedor>(`/fornecedores/${fornecedor.id}`, fornecedor);

      return {
        success: true,
        data: response.data,
        message: 'Fornecedor atualizado com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao atualizar fornecedor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar fornecedor',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Deletar fornecedor
  async deleteFornecedor(id: number): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/fornecedores/${id}`);

      return {
        success: true,
        data: null,
        message: 'Fornecedor excluído com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao excluir fornecedor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir fornecedor',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Buscar fornecedores por nome (para autocomplete)
  async searchFornecedores(termo: string): Promise<ApiResponse<FornecedorListDto[]>> {
    try {
      const response = await api.get<FornecedorListDto[]>(`/fornecedores/search?q=${encodeURIComponent(termo)}`);

      return {
        success: true,
        data: response.data,
        message: 'Busca realizada com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao buscar fornecedores:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar fornecedores',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Obter fornecedores como EntityOption[] (para selects)
  async obterFornecedoresOptions(): Promise<EntityOption[]> {
    try {
      const response = await this.getFornecedores({ ativo: true, pageSize: 1000 });

      if (response.success && response.data) {
        return response.data.items.map(f => ({
          id: f.id,
          label: f.nome
        }));
      }

      return [];
    } catch (error) {
      console.error('Erro ao obter fornecedores:', error);
      return [];
    }
  }

  // Formata CNPJ ou CPF conforme tipo ('F' para físico, 'J' para jurídico)
  formatDocument(value: string | undefined, tipoPessoa: 'F' | 'J' | string | undefined): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (tipoPessoa === 'F' || tipoPessoa === 'f') {
      // CPF: 11 dígitos -> 000.000.000-00
      const v = digits.slice(0, 11);
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, (_, a, b, c, d) => `${a}.${b}.${c}-${d}`) || v;
    } else {
      // CNPJ: 14 dígitos -> 00.000.000/0000-00
      const v = digits.slice(0, 14);
      return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, (_, a, b, c, d, e) => `${a}.${b}.${c}/${d}-${e}`) || v;
    }
  }

  // Formata CEP (XXXXX-XXX)
  formatCep(value: string | undefined): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/(\d{5})(\d{3})/, (_, a, b) => `${a}-${b}`) || digits;
  }

  // Formata telefone brasileiro (padrões 10 ou 11 dígitos)
  formatTelefone(value: string | undefined): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      // (00) 0000-0000
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, a, b, c) => c ? `(${a}) ${b}-${c}` : `(${a}) ${b}`) || digits;
    }
    // (00) 00000-0000
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, (_, a, b, c) => `(${a}) ${b}-${c}`) || digits;
  }

  // Validação simples por contagem de dígitos (não substitui validação real de CPF/CNPJ)
  validateDocument(value: string | undefined, tipoPessoa: 'F' | 'J' | string | undefined): boolean {
    if (!value) return false;
    const digits = value.replace(/\D/g, '');
    if (tipoPessoa === 'F' || tipoPessoa === 'f') {
      return digits.length === 11;
    }
    return digits.length === 14;
  }
}

export const fornecedoresService = new FornecedoresService();
export default fornecedoresService;