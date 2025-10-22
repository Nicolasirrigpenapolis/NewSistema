import { api, API_BASE_URL } from './api';

export interface EmitenteDto {
  id?: number;
  cnpj?: string;
  cpf?: string;
  ie?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  codMunicipio: number;
  municipio: string;
  cep: string;
  uf: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  tipoEmitente: string;
  caminhoSalvarXml?: string;
  rntrc?: string;
  caminhoCertificadoDigital?: string | null;
  senhaCertificadoDigital?: string | null;
  serieInicial?: number;
  tipoTransportador?: number;
  modalTransporte?: number;
  caminhoLogotipo?: string | null;
  caminhoImagemFundo?: string | null;
}

class EmitenteService {
  async obterEmitenteAtual(): Promise<EmitenteDto | null> {
    try {
      const { data } = await api.get<{ items: any[] }>('/Emitentes');
      if (!data?.items || data.items.length === 0) {
        return null;
      }
      return data.items[0] ?? null;
    } catch (error) {
      console.error('Erro ao carregar emitente:', error);
      return null;
    }
  }

  async salvarEmitente(dados: EmitenteDto): Promise<void> {
    const payload: EmitenteDto = {
      ...dados,
      ativo: dados.ativo ?? true,
    };

    if (payload.id) {
      await api.put(`/Emitentes/${payload.id}`, payload);
    } else {
      await api.post('/Emitentes', payload);
    }
  }
}

export const emitenteService = new EmitenteService();

