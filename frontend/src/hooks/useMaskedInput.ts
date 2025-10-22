import { useState, useCallback } from 'react';
import { cleanNumericString, applyMask, parseCurrencyToNumber, parseFormattedNumber } from '../utils/formatters';

type MaskType = 'cpf' | 'cnpj' | 'cep' | 'telefone' | 'placa' | 'currency' | 'number' | 'none';

interface UseMaskedInputOptions {
  initialValue?: string;
  maskType: MaskType;
  onValueChange?: (rawValue: string, maskedValue: string) => void;
  maxLength?: number;
}

interface UseMaskedInputReturn {
  maskedValue: string;
  rawValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValue: (value: string) => void;
  setRawValue: (value: string) => void;
  clear: () => void;
}

/**
 * Hook customizado para inputs com máscara
 * Gerencia tanto o valor com máscara (visual) quanto o valor limpo (para backend)
 */
export const useMaskedInput = ({
  initialValue = '',
  maskType,
  onValueChange,
  maxLength
}: UseMaskedInputOptions): UseMaskedInputReturn => {
  const [maskedValue, setMaskedValue] = useState(() => 
    maskType === 'none' ? initialValue : applyMask(initialValue, maskType)
  );
  const [rawValue, setRawValueState] = useState(() => 
    maskType === 'none' ? initialValue : cleanNumericString(initialValue)
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    if (maskType === 'none') {
      if (maxLength && inputValue.length > maxLength) {
        inputValue = inputValue.slice(0, maxLength);
      }
      setMaskedValue(inputValue);
      setRawValueState(inputValue);
      onValueChange?.(inputValue, inputValue);
      return;
    }

    // Para máscaras de moeda e número, tratar de forma especial
    if (maskType === 'currency' || maskType === 'number') {
      const cleaned = cleanNumericString(inputValue);
      const limited = maxLength ? cleaned.slice(0, maxLength) : cleaned;
      const masked = applyMask(limited, maskType);
      
      // Para moeda, o rawValue é o número dividido por 100
      const raw = maskType === 'currency' 
        ? String(parseCurrencyToNumber(masked))
        : String(parseFormattedNumber(masked));
      
      setMaskedValue(masked);
      setRawValueState(raw);
      onValueChange?.(raw, masked);
      return;
    }

    // Remover máscara para pegar apenas os dígitos (outros tipos)
    const cleaned = cleanNumericString(inputValue);

    // Aplicar limite de caracteres
    const limited = maxLength ? cleaned.slice(0, maxLength) : cleaned;

    // Aplicar máscara visual
    const masked = applyMask(limited, maskType);

    setMaskedValue(masked);
    setRawValueState(limited);
    onValueChange?.(limited, masked);
  }, [maskType, maxLength, onValueChange]);

  const setValue = useCallback((value: string) => {
    if (maskType === 'none') {
      setMaskedValue(value);
      setRawValueState(value);
    } else {
      const cleaned = cleanNumericString(value);
      const masked = applyMask(cleaned, maskType);
      setMaskedValue(masked);
      setRawValueState(cleaned);
    }
  }, [maskType]);

  const setRawValue = useCallback((value: string) => {
    if (maskType === 'none') {
      setMaskedValue(value);
      setRawValueState(value);
    } else {
      const masked = applyMask(value, maskType);
      setMaskedValue(masked);
      setRawValueState(value);
    }
  }, [maskType]);

  const clear = useCallback(() => {
    setMaskedValue('');
    setRawValueState('');
    onValueChange?.('', '');
  }, [onValueChange]);

  return {
    maskedValue,
    rawValue,
    handleChange,
    setValue,
    setRawValue,
    clear
  };
};
