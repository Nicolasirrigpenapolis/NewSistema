// FRONTEND: APENAS VALIDAÇÕES DE UI/UX
// Validações de negócio foram movidas para o backend

// Mensagens de erro padronizadas para UI
export const UI_MESSAGES = {
  required: (field: string) => `${field} é obrigatório`,
  invalidFormat: (field: string) => `Formato de ${field} inválido`
};

// Apenas validações básicas de formato para UI (não validações de negócio)
export const UI_VALIDATORS = {
  // Verifica se campo não está vazio
  required: (value: string): boolean => {
    return value?.trim().length > 0;
  },

  // Verifica apenas formato básico de email (para UI)
  emailFormat: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  // Verifica apenas se tem números suficientes (formato básico)
  cnpjFormat: (value: string): boolean => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length === 14;
  },

  cpfFormat: (value: string): boolean => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length === 11;
  },

  cepFormat: (value: string): boolean => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length === 8;
  }
};

// Hook simples para validação de UI apenas
export const useUIValidation = () => {
  const validateRequired = (value: string, fieldName: string): string | null => {
    if (!UI_VALIDATORS.required(value)) {
      return UI_MESSAGES.required(fieldName);
    }
    return null;
  };

  const validateEmail = (value: string): string | null => {
    if (value && !UI_VALIDATORS.emailFormat(value)) {
      return UI_MESSAGES.invalidFormat('email');
    }
    return null;
  };

  return { validateRequired, validateEmail };
};