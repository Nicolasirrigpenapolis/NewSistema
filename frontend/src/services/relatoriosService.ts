import { api } from './api';
import { ApiResponse } from '../types/apiResponse';

// Tipos para os filtros
export interface RelatorioManutencaoFiltro {
  dataInicio?: string;
  dataFim?: string;
  placa?: string;
  peca?: string;
  fornecedorId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface RelatorioDespesasFiltro {
  dataInicio?: string;
  dataFim?: string;
  placa?: string;
  tipoDespesa?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

// Tipos para os dados de resposta
export interface ManutencaoPeca {
  id: number;
  manutencaoId: number;
  descricaoPeca: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  unidade?: string;
}

export interface RelatorioManutencaoItem {
  id: number;
  dataManutencao: string;
  veiculoPlaca: string;
  veiculoMarca: string;
  descricao: string;
  fornecedorNome?: string;
  valorMaoObra: number;
  valorPecas: number;
  valorTotal: number;
  pecas: ManutencaoPeca[];
}

export interface RelatorioManutencaoResumo {
  totalManutencoes: number;
  valorTotalMaoObra: number;
  valorTotalPecas: number;
  valorTotalGeral: number;
  manutencoes: RelatorioManutencaoItem[];
}

export interface DespesaViagem {
  id: number;
  viagemId: number;
  tipoDespesa: string;
  descricao: string;
  valor: number;
  dataDespesa: string;
  local?: string;
  observacoes?: string;
}

export interface RelatorioDespesasItem {
  id: number;
  veiculoPlaca: string;
  veiculoMarca: string;
  dataInicio: string;
  dataFim: string;
  duracaoDias: number;
  origemDestino?: string;
  receitaTotal: number;
  totalDespesas: number;
  saldoLiquido: number;
  despesas: DespesaViagem[];
  despesasPorTipo: Record<string, number>;
}

export interface RelatorioDespesasResumo {
  totalViagens: number;
  receitaTotalGeral: number;
  despesaTotalGeral: number;
  saldoLiquidoGeral: number;
  despesasPorTipo: Record<string, number>;
  viagens: RelatorioDespesasItem[];
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
  Outros: 'Outros'
} as const;

export const TodosTiposDespesa = Object.values(TiposDespesa);

class RelatoriosService {
  // Relatórios de Manutenção
  async getRelatorioManutencao(filtros: RelatorioManutencaoFiltro): Promise<ApiResponse<PagedResult<RelatorioManutencaoItem>>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<PagedResult<RelatorioManutencaoItem>>(`/relatoriomanutencao?${params.toString()}`);

      return {
        success: true,
        data: response.data,
        message: 'Relatório obtido com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao obter relatório de manutenção:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter relatório de manutenção',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getResumoManutencao(filtros: RelatorioManutencaoFiltro): Promise<ApiResponse<RelatorioManutencaoResumo>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<RelatorioManutencaoResumo>(`/relatoriomanutencao/resumo?${params.toString()}`);

      return {
        success: true,
        data: response.data,
        message: 'Resumo obtido com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao obter resumo de manutenção:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter resumo de manutenção',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async exportarManutencaoExcel(filtros: RelatorioManutencaoFiltro): Promise<ApiResponse<Blob>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<Blob>(`/relatoriomanutencao/export/excel?${params.toString()}`, {
        responseType: 'blob'
      });

      return {
        success: true,
        data: response.data,
        message: 'Relatório exportado com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao exportar relatório de manutenção para Excel:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao exportar relatório para Excel',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async exportarManutencaoPdf(filtros: RelatorioManutencaoFiltro): Promise<ApiResponse<Blob>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<Blob>(`/relatoriomanutencao/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });

      return {
        success: true,
        data: response.data,
        message: 'Relatório exportado com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao exportar relatório de manutenção para PDF:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao exportar relatório para PDF',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Relatórios de Despesas/Receitas
  async getRelatorioDespesas(filtros: RelatorioDespesasFiltro): Promise<ApiResponse<PagedResult<RelatorioDespesasItem>>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<PagedResult<RelatorioDespesasItem>>(`/relatoriodespesas?${params.toString()}`);

      return {
        success: true,
        data: response.data,
        message: 'Relatório obtido com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao obter relatório de despesas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter relatório de despesas',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getResumoDespesas(filtros: RelatorioDespesasFiltro): Promise<ApiResponse<RelatorioDespesasResumo>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<RelatorioDespesasResumo>(`/relatoriodespesas/resumo?${params.toString()}`);

      return {
        success: true,
        data: response.data,
        message: 'Resumo obtido com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao obter resumo de despesas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter resumo de despesas',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getEstatisticasDespesas(filtros: RelatorioDespesasFiltro): Promise<ApiResponse<Record<string, any>>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<Record<string, any>>(`/relatoriodespesas/estatisticas?${params.toString()}`);

      return {
        success: true,
        data: response.data,
        message: 'Estatísticas obtidas com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao obter estatísticas de despesas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter estatísticas de despesas',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async exportarDespesasExcel(filtros: RelatorioDespesasFiltro): Promise<ApiResponse<Blob>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<Blob>(`/relatoriodespesas/export/excel?${params.toString()}`, {
        responseType: 'blob'
      });

      return {
        success: true,
        data: response.data,
        message: 'Relatório exportado com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao exportar relatório de despesas para Excel:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao exportar relatório para Excel',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  async exportarDespesasPdf(filtros: RelatorioDespesasFiltro): Promise<ApiResponse<Blob>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<Blob>(`/relatoriodespesas/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });

      return {
        success: true,
        data: response.data,
        message: 'Relatório exportado com sucesso',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro ao exportar relatório de despesas para PDF:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao exportar relatório para PDF',
        data: null,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Utility para download de arquivo blob (OK - é funcionalidade de UI/Browser)
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Formata número para moeda em pt-BR
  formatCurrency(value: number | undefined | null): string {
    const val = typeof value === 'number' ? value : 0;
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

export const relatoriosService = new RelatoriosService();
export default relatoriosService;