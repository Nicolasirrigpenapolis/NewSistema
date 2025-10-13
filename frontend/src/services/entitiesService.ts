// FRONTEND: APENAS CHAMADAS SIMPLES PARA BACKEND
// Transforma+º+Áes e mapeamentos movidos para o backend

import { RespostaAPI } from '../types/mdfe';
import { EntityOption } from '../types/apiResponse';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

class EntitiesService {
  // Request simples - sem transforma+º+Áes
  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<RespostaAPI> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      // Tenta obter o corpo da resposta, mesmo em caso de erro
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      if (!response.ok) {
        return {
          sucesso: false,
          mensagem: responseData?.message || `Erro HTTP: ${response.status}`,
          codigoErro: response.status.toString(),
          dados: responseData, // Inclui os dados do erro se houver
        };
      }

      // Para respostas de sucesso (2xx)
      // A estrutura da resposta da API agora +® { success, message, data }
      if (responseData && typeof responseData.success === 'boolean') {
        if (responseData.success) {
          return {
            sucesso: true,
            mensagem: responseData.message || 'Opera+º+úo realizada com sucesso',
            dados: responseData.data, // Retorna apenas o campo 'data'
          };
        } else {
          return {
            sucesso: false,
            mensagem: responseData.message || 'A API indicou uma falha na opera+º+úo',
            dados: responseData.errors, // Pode haver detalhes de erro
          };
        }
      }

      // Fallback para respostas que n+úo seguem o padr+úo { success, message, data }
      // mas que ainda s+úo 2xx. Ex: 204 No Content
      return {
        sucesso: true,
        mensagem: 'Opera+º+úo realizada com sucesso',
        dados: responseData,
      };

    } catch (error) {
      console.error(`Erro na chamada da API para ${endpoint}:`, error);
      return {
        sucesso: false,
        mensagem: 'Erro de conex+úo com o servidor. Verifique o console para mais detalhes.',
        codigoErro: 'NETWORK_ERROR',
      };
    }
  }

  // Obter todas as entidades de uma vez (otimizado)
  async obterTodasEntidades(): Promise<{
    emitentes: EntityOption[];
    condutores: EntityOption[];
    veiculos: EntityOption[];
    contratantes: EntityOption[];
    seguradoras: EntityOption[];
  }> {
    const response = await this.request('/entities/wizard');

    if (!response.sucesso || !response.dados) {
      return {
        emitentes: [],
        condutores: [],
        veiculos: [],
        contratantes: [],
        seguradoras: []
      };
    }

    return response.dados;
  }

  // M+®todos individuais simplificados
  async obterEmitentes(): Promise<EntityOption[]> {
    const response = await this.request('/entities/emitentes');
    return response.sucesso ? response.dados : [];
  }

  async obterCondutores(): Promise<EntityOption[]> {
    const response = await this.request('/entities/condutores');
    return response.sucesso ? response.dados : [];
  }

  async obterVeiculos(): Promise<EntityOption[]> {
    const response = await this.request('/entities/veiculos');
    return response.sucesso ? response.dados : [];
  }

  async obterContratantes(): Promise<EntityOption[]> {
    const response = await this.request('/entities/contratantes');
    return response.sucesso ? response.dados : [];
  }

  async obterSeguradoras(): Promise<EntityOption[]> {
    const response = await this.request('/entities/seguradoras');
    return response.sucesso ? response.dados : [];
  }

  // Obter dados completos do emitente para auto-popular formul+írio
  async obterDadosEmitente(id: number): Promise<RespostaAPI> {
    return await this.request(`/entities/emitentes/${id}`);
  }

  // CRUD SIMPLIFICADO - backend aceita dados diretos

  // Emitentes
  async buscarEmitentePorId(id: number): Promise<RespostaAPI> {
    return await this.request(`/emitentes/${id}`);
  }

  async criarEmitente(dados: any): Promise<RespostaAPI> {
    return await this.request('/emitentes', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  }

  async atualizarEmitente(id: number, dados: any): Promise<RespostaAPI> {
    return await this.request(`/emitentes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  }

  async excluirEmitente(id: number): Promise<RespostaAPI> {
    return await this.request(`/emitentes/${id}`, { method: 'DELETE' });
  }

  // Condutores
  async criarCondutor(dados: any): Promise<RespostaAPI> {
    return await this.request('/condutores', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  }

  async atualizarCondutor(id: number, dados: any): Promise<RespostaAPI> {
    return await this.request(`/condutores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  }

  async excluirCondutor(id: number): Promise<RespostaAPI> {
    return await this.request(`/condutores/${id}`, { method: 'DELETE' });
  }

  // Ve+¡culos
  async criarVeiculo(dados: any): Promise<RespostaAPI> {
    return await this.request('/veiculos', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  }

  async buscarVeiculoPorId(id: number): Promise<RespostaAPI> {
    return await this.request(`/veiculos/${id}`);
  }

  async atualizarVeiculo(id: number, dados: any): Promise<RespostaAPI> {
    return await this.request(`/veiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  }

  async excluirVeiculo(id: number): Promise<RespostaAPI> {
    return await this.request(`/veiculos/${id}`, { method: 'DELETE' });
  }

  // Contratantes
  async buscarContratantePorId(id: number): Promise<RespostaAPI> {
    return await this.request(`/contratantes/${id}`);
  }

  async criarContratante(dados: any): Promise<RespostaAPI> {
    return await this.request('/contratantes', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  }

  async atualizarContratante(id: number, dados: any): Promise<RespostaAPI> {
    return await this.request(`/contratantes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  }

  async excluirContratante(id: number): Promise<RespostaAPI> {
    return await this.request(`/contratantes/${id}`, { method: 'DELETE' });
  }

  // Municipios
  async buscarMunicipioPorId(id: number): Promise<RespostaAPI> {
    return await this.request(`/municipios/${id}`);
  }

  async criarMunicipio(dados: any): Promise<RespostaAPI> {
    return await this.request('/municipios', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  }

  async atualizarMunicipio(id: number, dados: any): Promise<RespostaAPI> {
    return await this.request(`/municipios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  }

  async excluirMunicipio(id: number): Promise<RespostaAPI> {
    return await this.request(`/municipios/${id}`, { method: 'DELETE' });
  }

  // Seguradoras
  async criarSeguradora(dados: any): Promise<RespostaAPI> {
    return await this.request('/seguradoras', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  }

  async buscarSeguradoraPorId(id: number): Promise<RespostaAPI> {
    return await this.request(`/seguradoras/${id}`);
  }

  async atualizarSeguradora(id: number, dados: any): Promise<RespostaAPI> {
    return await this.request(`/seguradoras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  }

  async excluirSeguradora(id: number): Promise<RespostaAPI> {
    return await this.request(`/seguradoras/${id}`, { method: 'DELETE' });
  }

  // Condutores
  async buscarCondutorPorId(id: number): Promise<RespostaAPI> {
    return await this.request(`/condutores/${id}`);
  }

  // Reboques
  async buscarReboquePorId(id: number): Promise<RespostaAPI> {
    return await this.request(`/reboques/${id}`);
  }

  async criarReboque(dados: any): Promise<RespostaAPI> {
    return await this.request('/reboques', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  }

  async atualizarReboque(id: number, dados: any): Promise<RespostaAPI> {
    return await this.request(`/reboques/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  }

  async excluirReboque(id: number): Promise<RespostaAPI> {
    return await this.request(`/reboques/${id}`, { method: 'DELETE' });
  }
}

export const entitiesService = new EntitiesService();

