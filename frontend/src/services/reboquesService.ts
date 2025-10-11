/**
 * SERVIÇO DE REBOQUES
 * Integração completa com ReboquesController para gestão de reboques
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

// Interfaces baseadas nos DTOs do backend
export interface ReboqueCreate {
  placa: string;
  tara: number;
  tipoRodado: string;
  tipoCarroceria: string;
  uf: string;
  rntrc?: string;
}

export interface ReboqueUpdate extends ReboqueCreate {
  // Herda todas as propriedades de ReboqueCreate
}

export interface ReboqueList {
  id: number;
  placa: string;
  tara: number;
  tipoRodado: string;
  tipoCarroceria: string;
  uf: string;
  rntrc?: string;
  ativo: boolean;
  dataCriacao: string;
}

export interface ReboqueDetail {
  id: number;
  placa: string;
  tara: number;
  tipoRodado: string;
  tipoCarroceria: string;
  uf: string;
  rntrc?: string;
  ativo: boolean;
  dataCriacao: string;
  dataUltimaAlteracao?: string;
}

export interface ApiResponse<T> {
  sucesso: boolean;
  data?: T;
  mensagem?: string;
}

export interface PaginationResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startItem: number;
  endItem: number;
}

class ReboquesService {
  /**
   * Listar reboques com paginação e filtros
   */
  async listarReboques(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<ApiResponse<PaginationResponse<ReboqueList>>> {
    try {
      const params = new URLSearchParams({
        Page: page.toString(),
        PageSize: pageSize.toString(),
        ...(search && { Search: search }),
        ...(sortBy && { SortBy: sortBy }),
        ...(sortDirection && { SortDirection: sortDirection })
      });

      const token = localStorage.getItem('mdfe_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/reboques?${params}`, { headers });
      const result = await response.json();

      return {
        sucesso: response.ok,
        data: result,
        mensagem: response.ok ? undefined : result.mensagem || 'Erro ao carregar reboques'
      };
    } catch (error) {
      console.error('Erro ao listar reboques:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Buscar reboque por ID
   */
  async buscarReboque(id: number): Promise<ApiResponse<ReboqueDetail>> {
    try {
      const token = localStorage.getItem('mdfe_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/reboques/${id}`, { headers });
      const result = await response.json();

      return {
        sucesso: response.ok,
        data: result,
        mensagem: response.ok ? undefined : result.mensagem || 'Reboque não encontrado'
      };
    } catch (error) {
      console.error('Erro ao buscar reboque:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Criar novo reboque
   */
  async criarReboque(dados: ReboqueCreate): Promise<ApiResponse<ReboqueDetail>> {
    try {
      const token = localStorage.getItem('mdfe_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/reboques`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dados)
      });

      const result = await response.json();

      return {
        sucesso: response.ok,
        data: result,
        mensagem: response.ok ? 'Reboque criado com sucesso' : result.mensagem || 'Erro ao criar reboque'
      };
    } catch (error) {
      console.error('Erro ao criar reboque:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Atualizar reboque
   */
  async atualizarReboque(id: number, dados: ReboqueUpdate): Promise<ApiResponse<ReboqueDetail>> {
    try {
      const token = localStorage.getItem('mdfe_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/reboques/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(dados)
      });

      // 204 No Content não tem body
      const result = response.status === 204 ? null : await response.json();

      return {
        sucesso: response.ok,
        data: result,
        mensagem: response.ok ? 'Reboque atualizado com sucesso' : result?.mensagem || 'Erro ao atualizar reboque'
      };
    } catch (error) {
      console.error('Erro ao atualizar reboque:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Excluir reboque
   */
  async excluirReboque(id: number): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('mdfe_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/reboques/${id}`, {
        method: 'DELETE',
        headers
      });

      const result = response.status !== 204 ? await response.json() : null;

      return {
        sucesso: response.ok,
        mensagem: response.ok ? 'Reboque excluído com sucesso' : result?.mensagem || 'Erro ao excluir reboque'
      };
    } catch (error) {
      console.error('Erro ao excluir reboque:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Listar reboques ativos para seleção (usado no MDFeForm)
   */
  async listarReboquesAtivos(): Promise<ApiResponse<ReboqueList[]>> {
    try {
      const url = `${API_BASE_URL}/reboques?PageSize=100&SortBy=placa`;
      console.log('Chamando API:', url);

      const token = localStorage.getItem('mdfe_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Token adicionado ao header');
      } else {
        console.warn('Nenhum token encontrado no localStorage');
      }

      const response = await fetch(url, { headers });
      console.log('Status da resposta:', response.status, response.statusText);

      const result = await response.json();
      console.log('Dados recebidos:', result);

      if (!response.ok) {
        console.error('Erro da API:', result);
        return {
          sucesso: false,
          mensagem: result.mensagem || result.message || result.title || 'Erro ao carregar reboques'
        };
      }

      if (result.items) {
        console.log(`Total de reboques na resposta: ${result.items.length}`);

        // Filtrar apenas ativos
        const reboquesAtivos = result.items.filter((reboque: ReboqueList) => reboque.ativo);
        console.log(`Reboques ativos filtrados: ${reboquesAtivos.length}`);

        return {
          sucesso: true,
          data: reboquesAtivos,
          mensagem: 'Reboques carregados com sucesso'
        };
      }

      console.warn('Resposta sem items');
      return {
        sucesso: false,
        mensagem: 'Nenhum reboque encontrado'
      };
    } catch (error) {
      console.error('Erro ao listar reboques ativos:', error);
      return {
        sucesso: false,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  /**
   * Utilitários de formatação
   */
  formatarPlaca(placa: string): string {
    // Remove caracteres especiais e converte para maiúsculo
    const placaLimpa = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Formato Mercosul: ABC1A23 ou formato antigo: ABC1234
    if (placaLimpa.length === 7) {
      return placaLimpa.replace(/([A-Z]{3})([0-9])([A-Z])([0-9]{2})/, '$1-$2$3$4');
    } else if (placaLimpa.length === 7) {
      return placaLimpa.replace(/([A-Z]{3})([0-9]{4})/, '$1-$2');
    }

    return placaLimpa;
  }

  formatarTara(tara: number): string {
    return `${tara.toLocaleString('pt-BR')} kg`;
  }

  validarPlaca(placa: string): boolean {
    const placaLimpa = placa.replace(/[^A-Z0-9]/gi, '');

    // Formato Mercosul: 3 letras + 1 número + 1 letra + 2 números
    const formatoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/i;

    // Formato antigo: 3 letras + 4 números
    const formatoAntigo = /^[A-Z]{3}[0-9]{4}$/i;

    return formatoMercosul.test(placaLimpa) || formatoAntigo.test(placaLimpa);
  }

  /**
   * Opções para dropdowns
   */
  getTiposRodado(): Array<{value: string, label: string}> {
    return [
      { value: 'Truck', label: 'Truck' },
      { value: 'Toco', label: 'Toco' },
      { value: 'Cavalo Mecânico', label: 'Cavalo Mecânico' },
      { value: 'VAN', label: 'VAN' },
      { value: 'Utilitário', label: 'Utilitário' },
      { value: 'Outros', label: 'Outros' }
    ];
  }

  getTiposCarroceria(): Array<{value: string, label: string}> {
    return [
      { value: 'Aberta', label: 'Aberta' },
      { value: 'Fechada/Baú', label: 'Fechada/Baú' },
      { value: 'Graneleira', label: 'Graneleira' },
      { value: 'Porta Container', label: 'Porta Container' },
      { value: 'Sider', label: 'Sider' },
      { value: 'Tanque', label: 'Tanque' },
      { value: 'Refrigerada', label: 'Refrigerada' },
      { value: 'Basculante', label: 'Basculante' },
      { value: 'Cegonheira', label: 'Cegonheira' },
      { value: 'Prancha', label: 'Prancha' },
      { value: 'Outros', label: 'Outros' }
    ];
  }

  getEstados(): Array<{value: string, label: string}> {
    return [
      { value: 'AC', label: 'Acre' },
      { value: 'AL', label: 'Alagoas' },
      { value: 'AP', label: 'Amapá' },
      { value: 'AM', label: 'Amazonas' },
      { value: 'BA', label: 'Bahia' },
      { value: 'CE', label: 'Ceará' },
      { value: 'DF', label: 'Distrito Federal' },
      { value: 'ES', label: 'Espírito Santo' },
      { value: 'GO', label: 'Goiás' },
      { value: 'MA', label: 'Maranhão' },
      { value: 'MT', label: 'Mato Grosso' },
      { value: 'MS', label: 'Mato Grosso do Sul' },
      { value: 'MG', label: 'Minas Gerais' },
      { value: 'PA', label: 'Pará' },
      { value: 'PB', label: 'Paraíba' },
      { value: 'PR', label: 'Paraná' },
      { value: 'PE', label: 'Pernambuco' },
      { value: 'PI', label: 'Piauí' },
      { value: 'RJ', label: 'Rio de Janeiro' },
      { value: 'RN', label: 'Rio Grande do Norte' },
      { value: 'RS', label: 'Rio Grande do Sul' },
      { value: 'RO', label: 'Rondônia' },
      { value: 'RR', label: 'Roraima' },
      { value: 'SC', label: 'Santa Catarina' },
      { value: 'SP', label: 'São Paulo' },
      { value: 'SE', label: 'Sergipe' },
      { value: 'TO', label: 'Tocantins' }
    ];
  }
}

export const reboquesService = new ReboquesService();