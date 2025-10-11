import { useState, useCallback } from 'react';
import { validationService, CNPJData, ValidacaoResponse } from '../services/cnpjService';

interface UseCNPJLookupReturn {
  consultarCNPJ: (cnpj: string) => Promise<CNPJData | null>;
  lookupCNPJ: (cnpj: string) => Promise<CNPJData | null>; // alias for backward compatibility
  validarCNPJ: (cnpj: string) => Promise<boolean>;
  validarCPF: (cpf: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useCNPJLookup = (): UseCNPJLookupReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const consultarCNPJ = useCallback(async (cnpj: string): Promise<CNPJData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await validationService.consultarCNPJ(cnpj);

      if (response.sucesso && response.data) {
        return response.data;
      } else {
        setError(response.mensagem || 'Erro ao consultar CNPJ');
        return null;
      }
    } catch (err) {
      setError('Erro de rede ao consultar CNPJ');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const validarCNPJ = useCallback(async (cnpj: string): Promise<boolean> => {
    try {
      const response = await validationService.validarCNPJ(cnpj);
      return response.data || false;
    } catch (err) {
      return false;
    }
  }, []);

  const validarCPF = useCallback(async (cpf: string): Promise<boolean> => {
    try {
      const response = await validationService.validarCPF(cpf);
      return response.data || false;
    } catch (err) {
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    consultarCNPJ,
    lookupCNPJ: consultarCNPJ, // alias for backward compatibility
    validarCNPJ,
    validarCPF,
    loading,
    error,
    clearError
  };
};