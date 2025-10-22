// Base configurável: 1) ENV REACT_APP_API_BASE 2) global window.__API_BASE__ (injeta em index.html se necessário) 3) fallback local
// Em Docker (frontend separado): definir REACT_APP_API_BASE=http://api:8080
// Em dev local: REACT_APP_API_BASE=https://localhost:5001
// Se a API já servir o frontend estático: pode apontar para origin (window.location.origin)
// Ajuste para aceitar tanto http quanto https sem quebrar.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runtimeBase: string | undefined =
  (typeof window !== 'undefined' && (window as any).__API_BASE__) || undefined;

const normalizeBase = (value: string) => value.replace(/\/$/, '').replace(/\/api$/, '');

const envBase = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || runtimeBase;
const browserOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
const isDevServerOrigin = browserOrigin ? /localhost:(3000|5173)/.test(browserOrigin) : false;

const resolvedBase = normalizeBase(
  envBase
    ? normalizeBase(envBase)
    : !isDevServerOrigin && browserOrigin
      ? browserOrigin
      : 'https://localhost:5001'
);

export const API_ORIGIN = resolvedBase;
export const API_BASE_URL = `${resolvedBase}/api`;
export const TOKEN_STORAGE_KEY = 'mdfe_token';
export const TENANT_STORAGE_KEY = 'empresaSelecionada';

// Helper para obter headers comuns
export const buildCommonHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window === 'undefined') {
    return headers;
  }

  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const tenantId = window.localStorage.getItem(TENANT_STORAGE_KEY);
  if (tenantId) {
    headers['X-Tenant-Id'] = tenantId;
  }

  return headers;
};

// Cliente HTTP centralizado
export const api = {
  async get<T>(url: string, options?: { responseType?: 'blob' }): Promise<{ data: T }> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: buildCommonHeaders(),
      cache: 'no-store', // Desabilita cache do fetch para sempre buscar nova versão
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = options?.responseType === 'blob' ? await response.blob() : await response.json();
    return { data };
  },

  async post<T>(url: string, body: any): Promise<{ data: T }> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: buildCommonHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // ModelState validation errors
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Erros de validação: ${validationErrors}`;
        }
        console.error('Erro detalhado da API:', errorData);
      } catch {
        // Se não conseguir parsear JSON, manter mensagem genérica
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return { data };
  },

  async put<T>(url: string, body: any): Promise<{ data: T }> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: buildCommonHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle No Content (204) responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { data: {} as T };
    }

    const data = await response.json();
    return { data };
  },

  async delete(url: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: buildCommonHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};
