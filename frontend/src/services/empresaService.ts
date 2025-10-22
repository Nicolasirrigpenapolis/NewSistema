import { api, API_BASE_URL, API_ORIGIN } from './api';

export interface EmpresaConfiguracao {
  identificador: string;
  nomeExibicao: string;
  bancoDados: string;
  emitenteConfigurado: boolean;
  caminhoBaseArmazenamento: string;
  caminhoLogotipo?: string | null;
  urlLogotipo?: string | null;
  caminhoImagemFundo?: string | null;
  urlImagemFundo?: string | null;
  pastaXml: string;
  pastaCertificados: string;
  pastaLogos: string;
  dataConsulta: string;
}

interface UploadLogotipoResposta {
  mensagem: string;
  arquivo?: string;
}

const TOKEN_KEY = 'mdfe_token';

class EmpresaService {
  async obterConfiguracao(): Promise<EmpresaConfiguracao | null> {
    try {
      const { data } = await api.get<EmpresaConfiguracao>('/configuracoes/empresa');

      if (!data) {
        return null;
      }

      const urlLogotipoCompleta = data.urlLogotipo ? `${API_ORIGIN}${data.urlLogotipo}` : null;
      const urlImagemFundoCompleta = data.urlImagemFundo ? `${API_ORIGIN}${data.urlImagemFundo}` : null;

      return {
        ...data,
        urlLogotipo: urlLogotipoCompleta,
        urlImagemFundo: urlImagemFundoCompleta,
      };
    } catch (error) {
      console.error('Erro ao carregar configurações da empresa:', error);
      return null;
    }
  }

  async enviarLogotipo(arquivo: File): Promise<{ sucesso: boolean; mensagem: string; arquivo?: string }> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const token = localStorage.getItem(TOKEN_KEY);
    const tenantId = localStorage.getItem('empresaSelecionada');

    const response = await fetch(`${API_BASE_URL}/emitentes/logotipo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(tenantId && { 'X-Tenant-Id': tenantId }),
      },
      body: formData,
    });

    if (!response.ok) {
      const texto = await response.text().catch(() => '');
      throw new Error(texto || 'Falha ao enviar logotipo');
    }

    let resultado: UploadLogotipoResposta | null = null;
    try {
      resultado = await response.json();
    } catch {
      resultado = null;
    }

    return {
      sucesso: true,
      mensagem: resultado?.mensagem || 'Logotipo atualizado com sucesso.',
      arquivo: resultado?.arquivo,
    };
  }

  async enviarImagemFundo(arquivo: File): Promise<{ sucesso: boolean; mensagem: string; arquivo?: string }> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const token = localStorage.getItem(TOKEN_KEY);
    const tenantId = localStorage.getItem('empresaSelecionada');

    const response = await fetch(`${API_BASE_URL}/emitentes/imagem-fundo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(tenantId && { 'X-Tenant-Id': tenantId }),
      },
      body: formData,
    });

    if (!response.ok) {
      const texto = await response.text().catch(() => '');
      throw new Error(texto || 'Falha ao enviar imagem de fundo');
    }

    let resultado: UploadLogotipoResposta | null = null;
    try {
      resultado = await response.json();
    } catch {
      resultado = null;
    }

    return {
      sucesso: true,
      mensagem: resultado?.mensagem || 'Imagem de fundo atualizada com sucesso.',
      arquivo: resultado?.arquivo,
    };
  }
}

export const empresaService = new EmpresaService();
