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
}

const TOKEN_KEY = 'mdfe_token';

class EmitenteService {
  async obterEmitenteAtual(): Promise<EmitenteDto | null> {
    try {
      const { data } = await api.get<{ items: EmitenteDto[] }>('/emitentes?Page=1&PageSize=1');
      return data?.items?.[0] ?? null;
    } catch (error) {
      console.error('Erro ao carregar emitente:', error);
      return null;
    }
  }

  async salvarEmitente(dados: EmitenteDto): Promise<void> {
    const token = localStorage.getItem(TOKEN_KEY);
    const payload = { ...dados };

    // Garantir que campos booleanos tenham valor padrÃ£o
    if (payload.ativo === undefined) {
      payload.ativo = true;
    }

    const url = payload.id
      ? `${API_BASE_URL}/emitentes/${payload.id}`
      : `${API_BASE_URL}/emitentes`;

    const method = payload.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const mensagem = await response.text().catch(() => '');
      throw new Error(mensagem || 'Falha ao salvar emitente');
    }
  }
}

export const emitenteService = new EmitenteService();

