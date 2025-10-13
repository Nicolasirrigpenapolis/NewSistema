
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Municipio {
  id: number;
  codigo: number;
  nome: string;
  uf: string;
}

export interface OpcaoRota {
  id: string;
  nome: string;
  percurso: string[];
  distancia: number;
  estados: number;
  recomendada?: boolean;
}

class LocalidadeService {
  // Mapeamento de fallback para nomes de estados
  private readonly estadosNomes: { [sigla: string]: string } = {
    'AC': 'Acre',
    'AL': 'Alagoas',
    'AP': 'Amapá',
    'AM': 'Amazonas',
    'BA': 'Bahia',
    'CE': 'Ceará',
    'DF': 'Distrito Federal',
    'ES': 'Espírito Santo',
    'GO': 'Goiás',
    'MA': 'Maranhão',
    'MT': 'Mato Grosso',
    'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais',
    'PA': 'Pará',
    'PB': 'Paraíba',
    'PR': 'Paraná',
    'PE': 'Pernambuco',
    'PI': 'Piauí',
    'RJ': 'Rio de Janeiro',
    'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia',
    'RR': 'Roraima',
    'SC': 'Santa Catarina',
    'SP': 'São Paulo',
    'SE': 'Sergipe',
    'TO': 'Tocantins'
  };
  private async request(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async obterEstados(): Promise<Estado[]> {
    try {
      // USANDO NOVO ENDPOINT UNIFICADO
      const estados = await this.request('/municipios/estados');

      // Corrigir nomes de estados se backend retornou sigla duplicada
      const estadosCorrigidos = (estados || []).map((estado: any) => ({
        id: estado.sigla.charCodeAt(0) + estado.sigla.charCodeAt(1), // ID simples baseado na sigla
        sigla: estado.sigla,
        nome: estado.nome === estado.sigla || !estado.nome
          ? this.estadosNomes[estado.sigla] || estado.sigla
          : estado.nome
      }));

      return estadosCorrigidos;
    } catch (error) {
      return [];
    }
  }

  async obterMunicipiosPorEstado(uf: string): Promise<Municipio[]> {
    try {
      if (!uf || uf.length !== 2) {
        return [];
      }

      // USANDO NOVO ENDPOINT UNIFICADO
      const municipios = await this.request(`/municipios/por-uf/${uf.toUpperCase()}`);

      // Adaptar para formato esperado pelo frontend
      if (municipios && municipios.items) {
        return municipios.items.map((m: any) => ({
          id: m.codigo,
          codigo: m.codigo,
          nome: m.nome,
          uf: m.uf
        }));
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  async obterCodigoMunicipio(municipio: string, uf: string): Promise<number> {
    try {
      // USANDO NOVO ENDPOINT UNIFICADO
      const result = await this.request(`/municipios/codigo-municipio?municipio=${encodeURIComponent(municipio)}&uf=${encodeURIComponent(uf)}`);
      return result?.codigo || 0;
    } catch (error) {
      console.error('Erro ao obter código do município:', error);
      return 0;
    }
  }

  // Busca rotas alternativas no backend
  async calcularRotasAlternativas(ufOrigem: string, ufDestino: string): Promise<OpcaoRota[]> {
    try {
      const response = await this.request(`/rotas/calcular/${ufOrigem}/${ufDestino}`);

      if (response.success && response.data) {
        return response.data.map((rota: any) => ({
          id: rota.id,
          nome: rota.nome,
          percurso: rota.percurso,
          distancia: rota.distanciaKm,
          estados: rota.numeroEstados,
          recomendada: rota.recomendada
        }));
      }

      return [];
    } catch (error) {
      console.error('Erro ao calcular rotas:', error);
      return [];
    }
  }

  // Busca estados do backend
  async obterEstadosBackend(): Promise<Estado[]> {
    try {
      const response = await this.request('/rotas/estados');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Erro ao obter estados:', error);
      return [];
    }
  }

  // Gera opções de rotas formatadas para seleção do usuário
  async gerarOpcoesRotas(ufOrigem: string, ufDestino: string): Promise<OpcaoRota[]> {
    return await this.calcularRotasAlternativas(ufOrigem, ufDestino);
  }
}

export const localidadeService = new LocalidadeService();
