import React, { useEffect, useState } from 'react';
import { Input } from './input';
import { Label } from './label';
import { useMaskedInput } from '../../hooks/useMaskedInput';
import { UI_VALIDATORS } from '../../utils/validations';

type MaskType = 'cpf' | 'cnpj' | 'cep' | 'telefone' | 'placa' | 'currency' | 'number' | 'none';

interface InputMaskedProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  maskType: MaskType;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  maxLength?: number;
}

const placeholders: Record<MaskType, string> = {
  cpf: '000.000.000-00',
  cnpj: '00.000.000/0000-00',
  cep: '00000-000',
  telefone: '(00) 00000-0000',
  placa: 'AAA-0000',
  currency: 'R$ 0,00',
  number: '0',
  none: ''
};

/**
 * Componente de input com máscara genérico
 * Suporta CPF, CNPJ, CEP, Telefone, Placa, Currency (Moeda) e Number (Número com separador de milhar)
 * Envia apenas o valor limpo (sem máscara) para o backend
 */
export const InputMasked: React.FC<InputMaskedProps> = ({
  label,
  value,
  onChange,
  maskType,
  required = false,
  disabled = false,
  error,
  placeholder,
  className = '',
  id,
  maxLength
}) => {
  const [validationError, setValidationError] = useState<string>('');
  
  const { maskedValue, rawValue, handleChange, setRawValue } = useMaskedInput({
    initialValue: value,
    maskType,
    maxLength,
    onValueChange: (raw) => {
      onChange(raw); // Envia valor sem máscara para o componente pai
      // Limpar erro de validação quando o usuário digita
      if (validationError) {
        setValidationError('');
      }
    }
  });

  // Atualizar valor quando prop value mudar externamente
  useEffect(() => {
    if (value !== rawValue) {
      setRawValue(value);
    }
  }, [value]);

  const handleBlur = () => {
    // Validar CPF quando campo perde o foco
    if (maskType === 'cpf' && rawValue) {
      if (!UI_VALIDATORS.cpfFormat(rawValue)) {
        setValidationError('CPF deve ter 11 dígitos');
      } else if (!UI_VALIDATORS.cpfValid(rawValue)) {
        setValidationError('CPF inválido. Verifique os dígitos digitados');
      } else {
        setValidationError('');
      }
    }
  };

  const inputId = id || `input-${maskType}`;
  const inputPlaceholder = placeholder || placeholders[maskType];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={inputId}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <Input
        id={inputId}
        type="text"
        value={maskedValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={inputPlaceholder}
        className={`
          ${maskType !== 'none' ? 'font-mono' : ''}
          ${error || validationError ? 'border-red-500' : ''}
        `}
        required={required}
      />

      {(error || validationError) && (
        <p className="text-sm text-red-500">{error || validationError}</p>
      )}
    </div>
  );
};
