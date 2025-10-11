import { api, API_BASE_URL, API_ORIGIN } from './api';

export interface EmpresaConfiguracao {
  identificador: string;
  nomeExibicao: string;
  bancoDados: string;
  emitenteConfigurado: boolean;
  caminhoBaseArmazenamento: string;
  caminhoLogotipo?: string | null;
  urlLogotipo?: string | null;
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

      const urlCompleta = data.urlLogotipo ? `${API_ORIGIN}${data.urlLogotipo}` : null;

      return {
        ...data,
        urlLogotipo: urlCompleta,
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

    const response = await fetch(`${API_BASE_URL}/emitentes/logotipo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
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
}

export const empresaService = new EmpresaService();
