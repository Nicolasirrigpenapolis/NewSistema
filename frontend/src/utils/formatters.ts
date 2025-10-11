// FRONTEND: APENAS MÁSCARAS VISUAIS PARA UI
// Validações de negócio foram movidas para o backend

// Limpar strings para enviar ao backend
export const cleanNumericString = (value: string): string => {
  return value.replace(/\D/g, '');
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

  return cleanValue.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
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

export const formatWeight = (value: number, decimals: number = 3): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Função para aplicar máscara enquanto o usuário digita
export const applyMask = (value: string, type: 'cpf' | 'cnpj' | 'cep' | 'telefone' | 'placa'): string => {
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
    default:
      return value;
  }
};