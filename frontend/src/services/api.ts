// Base configurável: 1) ENV REACT_APP_API_BASE 2) global window.__API_BASE__ (injeta em index.html se necessário) 3) fallback local
// Em Docker (frontend separado): definir REACT_APP_API_BASE=http://api:8080
// Em dev local: REACT_APP_API_BASE=https://localhost:5001
// Se a API já servir o frontend estático: pode apontar para origin (window.location.origin)
// Ajuste para aceitar tanto http quanto https sem quebrar.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runtimeBase: string | undefined = (typeof window !== 'undefined' && (window as any).__API_BASE__) || undefined;
const resolvedBase = (process.env.REACT_APP_API_BASE || runtimeBase || window.location.origin || 'https://localhost:5001').replace(/\/$/, '');
export const API_ORIGIN = resolvedBase;
export const API_BASE_URL = `${resolvedBase}/api`;
const TOKEN_KEY = 'mdfe_token';

// Cliente HTTP centralizado
export const api = {
  async get<T>(url: string, options?: { responseType?: 'blob' }): Promise<{ data: T }> {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = options?.responseType === 'blob' ? await response.blob() : await response.json();
    return { data };
  },

  async post<T>(url: string, body: any): Promise<{ data: T }> {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  },

  async put<T>(url: string, body: any): Promise<{ data: T }> {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  },

  async delete(url: string): Promise<void> {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },
};
