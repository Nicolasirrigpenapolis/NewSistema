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

  // Valida CPF usando o algoritmo oficial
  cpfValid: (value: string): boolean => {
    const cpf = value.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) {
      return false;
    }
    
    // Verifica se não é uma sequência de números iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
    
    // Valida primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) {
      return false;
    }
    
    // Valida segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;
    
    return digito2 === parseInt(cpf.charAt(10));
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

  const validateCPF = (value: string): string | null => {
    if (!value) {
      return null; // Campo não preenchido, validação de required é separada
    }
    if (!UI_VALIDATORS.cpfFormat(value)) {
      return 'CPF deve ter 11 dígitos';
    }
    if (!UI_VALIDATORS.cpfValid(value)) {
      return 'CPF inválido. Verifique os dígitos digitados';
    }
    return null;
  };

  return { validateRequired, validateEmail, validateCPF };
};