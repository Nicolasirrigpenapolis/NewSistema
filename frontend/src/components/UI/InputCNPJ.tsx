import React, { useEffect, useState } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Icon } from '../../ui';
import { useMaskedInput } from '../../hooks/useMaskedInput';
import { validationService, CNPJData } from '../../services/cnpjService';

interface InputCNPJProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onDataFetched?: (data: CNPJData) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  autoFetch?: boolean; // Se deve buscar automaticamente quando completo
  className?: string;
  id?: string;
}

/**
 * Componente de input para CNPJ com:
 * - Máscara automática (00.000.000/0000-00)
 * - Consulta automática na BrasilAPI quando CNPJ for válido
 * - Feedback visual durante a consulta
 * - Envia apenas números para o backend (sem máscara)
 */
export const InputCNPJ: React.FC<InputCNPJProps> = ({
  label = 'CNPJ',
  value,
  onChange,
  onDataFetched,
  required = false,
  disabled = false,
  error,
  placeholder = '00.000.000/0000-00',
  autoFetch = true,
  className = '',
  id = 'cnpj'
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const lastFetchedCNPJ = React.useRef<string>('');

  const { maskedValue, rawValue, handleChange, setRawValue } = useMaskedInput({
    initialValue: value,
    maskType: 'cnpj',
    maxLength: 14,
    onValueChange: (raw, masked) => {
      onChange(raw); // Envia valor sem máscara para o componente pai
      setFetchError(null);
      setFetchSuccess(false);
      
      // Resetar a referência quando o valor mudar para permitir nova consulta
      if (raw.length !== 14) {
        lastFetchedCNPJ.current = '';
      }
    }
  });

  // Atualizar valor quando prop value mudar externamente
  useEffect(() => {
    if (value !== rawValue) {
      setRawValue(value);
      // Se estiver atualizando externamente, marca como já consultado para evitar loop
      if (value.length === 14) {
        lastFetchedCNPJ.current = value;
      }
    }
  }, [value, rawValue, setRawValue]);

  // Buscar dados automaticamente quando CNPJ estiver completo
  useEffect(() => {
    const fetchCNPJData = async () => {
      if (!autoFetch || !onDataFetched) return;
      if (rawValue.length !== 14) return;
      if (loading) return;
      
      // Evitar consultar o mesmo CNPJ novamente
      if (lastFetchedCNPJ.current === rawValue) return;

      lastFetchedCNPJ.current = rawValue;
      setLoading(true);
      setFetchError(null);
      setFetchSuccess(false);

      try {
        const response = await validationService.consultarCNPJ(rawValue);

        if (response.sucesso && response.data) {
          setFetchSuccess(true);
          onDataFetched(response.data);
        } else {
          setFetchError(response.mensagem || 'Erro ao consultar CNPJ');
        }
      } catch (err) {
        setFetchError('Erro ao consultar CNPJ');
      } finally {
        setLoading(false);
      }
    };

    // Debounce de 500ms antes de fazer a consulta
    const timer = setTimeout(fetchCNPJData, 500);
    return () => clearTimeout(timer);
  }, [rawValue, autoFetch, loading, onDataFetched]); // Adicionadas todas as dependências necessárias

  const showError = error || fetchError;
  const showSuccess = !showError && fetchSuccess && !loading;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={maskedValue}
          onChange={handleChange}
          disabled={disabled || loading}
          placeholder={placeholder}
          className={`
            font-mono pr-10
            ${showError ? 'border-red-500' : ''}
            ${showSuccess ? 'border-green-500' : ''}
            ${loading ? 'bg-gray-50 dark:bg-gray-800' : ''}
          `}
          required={required}
        />
        
        {/* Ícone de status */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          {showSuccess && (
            <Icon 
              name="check-circle" 
              className="text-green-500" 
              size="sm"
            />
          )}
          {showError && (
            <Icon 
              name="exclamation-circle" 
              className="text-red-500" 
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Mensagens de erro/sucesso */}
      {showError && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <Icon name="exclamation-triangle" size="sm" />
          {showError}
        </p>
      )}
      {showSuccess && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
          <Icon name="check" size="sm" />
          Dados preenchidos automaticamente
        </p>
      )}
      
      {/* Hint */}
      {!showError && !showSuccess && !loading && rawValue.length > 0 && rawValue.length < 14 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Digite os 14 dígitos do CNPJ
        </p>
      )}
    </div>
  );
};
