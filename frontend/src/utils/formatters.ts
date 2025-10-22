// FRONTEND: APENAS MÁSCARAS VISUAIS PARA UI
// Validações de negócio foram movidas para o backend

// Limpar strings para enviar ao backend
export const cleanNumericString = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) {
    return '';
  }
  const stringValue = String(value);
  return stringValue.replace(/\D/g, '');
};

export const extractDigits = (value?: string | null): string => {
  if (value === undefined || value === null) {
    return '';
  }

  return cleanNumericString(value);
};

export const cleanDecimalString = (value: string): string => {
  return value.replace(/[^\d.,]/g, '').replace(',', '.');
};

export const cleanPlaca = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

// Remover acentos para enviar ao backend (banco de dados)
export const removeAccents = (value: string): string => {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// MÁSCARAS VISUAIS APENAS (para UX)
export const formatCNPJ = (value: string): string => {
  const cleanValue = cleanNumericString(value);

  if (cleanValue.length <= 11) {
    return cleanValue;
  }

  return cleanValue
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

export const formatCPF = (value: string): string => {
  const cleanValue = cleanNumericString(value);

  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatDocument = (value: string, tipoPessoa: 'F' | 'J'): string => {
  if (!value) return '';
  return tipoPessoa === 'F' ? formatCPF(value) : formatCNPJ(value);
};

export const formatCEP = (value: string): string => {
  const cleanValue = cleanNumericString(value);

  return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const formatPlaca = (value: string): string => {
  const cleanValue = cleanPlaca(value);

  if (cleanValue.length <= 3) {
    return cleanValue;
  }

  // Formato antigo: ABC1234
  if (/^[A-Z]{3}\d{4}$/.test(cleanValue)) {
    return cleanValue.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
  }

  // Formato Mercosul: ABC1D23
  if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(cleanValue)) {
    return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
  }

  // Fallback mantém separador após três caracteres
  return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`;
};

export const formatTelefone = (value: string): string => {
  const cleanValue = cleanNumericString(value);

  // Aplica máscara progressivamente conforme o usuário digita
  if (cleanValue.length === 0) return '';
  if (cleanValue.length <= 2) return `(${cleanValue}`;
  if (cleanValue.length <= 6) return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
  if (cleanValue.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 6)}-${cleanValue.slice(6)}`;
  }
  // Celular: (XX) XXXXX-XXXX
  return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`;
};

export const formatChaveAcesso = (value: string): string => {
  const cleanValue = cleanNumericString(value);

  // Formato: XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX
  return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

/**
 * Formata valor monetário enquanto usuário digita
 * Ex: "150050" -> "R$ 1.500,50"
 */
export const formatCurrencyInput = (value: string | number | undefined | null): string => {
  const cleanValue = cleanNumericString(value);
  
  if (!cleanValue) return '';
  
  const numValue = Number(cleanValue) / 100;
  
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Converte string de moeda formatada para número
 * Ex: "R$ 1.500,50" -> 1500.50
 */
export const parseCurrencyToNumber = (value: string): number => {
  const cleanValue = cleanNumericString(value);
  
  if (!cleanValue) return 0;
  
  return Number(cleanValue) / 100;
};

/**
 * Formata número com separador de milhar
 * Ex: "150000" -> "150.000"
 */
export const formatNumberInput = (value: string): string => {
  const cleanValue = cleanNumericString(value);
  
  if (!cleanValue) return '';
  
  const numValue = Number(cleanValue);
  
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

/**
 * Converte string formatada para número
 * Ex: "150.000" -> 150000
 */
export const parseFormattedNumber = (value: string): number => {
  const cleanValue = cleanNumericString(value);
  
  if (!cleanValue) return 0;
  
  return Number(cleanValue);
};

export const formatWeight = (value: number, decimals: number = 3): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Função para aplicar máscara enquanto o usuário digita
export const applyMask = (value: string, type: 'cpf' | 'cnpj' | 'cep' | 'telefone' | 'placa' | 'currency' | 'number'): string => {
  switch (type) {
    case 'cpf':
      return formatCPF(value);
    case 'cnpj':
      return formatCNPJ(value);
    case 'cep':
      return formatCEP(value);
    case 'telefone':
      return formatTelefone(value);
    case 'placa':
      return formatPlaca(value);
    case 'currency':
      return formatCurrencyInput(value);
    case 'number':
      return formatNumberInput(value);
    default:
      return value;
  }
};