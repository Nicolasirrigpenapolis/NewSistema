import React, { useState, useEffect } from 'react';
import { Input } from '../input';
import { Label } from '../label';
import { cleanNumericString, formatCNPJ } from '../../../utils/formatters';

interface SmartCNPJInputProps {
  value: string;
  onChange: (value: string, validationData?: any) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onCompanyFound?: (companyData: any) => void;
  onDataFetch?: (data: any) => void;
  autoValidate?: boolean;
  autoFetch?: boolean;
  className?: string;
}

export function SmartCNPJInput({
  value,
  onChange,
  label = "CNPJ",
  placeholder = "00.000.000/0000-00",
  disabled = false,
  required = false,
  onCompanyFound,
  onDataFetch,
  autoValidate = false,
  autoFetch = false,
  className = ""
}: SmartCNPJInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = cleanNumericString(e.target.value);
    const formattedValue = formatCNPJ(rawValue);
    onChange(formattedValue);
  };

  useEffect(() => {
    const cnpjNumbers = cleanNumericString(value);
    if (cnpjNumbers.length === 14 && autoFetch) {
      // Simular busca de dados da empresa
      const mockData = { nome: `Empresa CNPJ ${cnpjNumbers}` };
      setCompanyData(mockData);
      if (onDataFetch) {
        onDataFetch(mockData);
      }
      if (onCompanyFound) {
        onCompanyFound(mockData);
      }
    }
  }, [value, autoFetch, onDataFetch, onCompanyFound]);

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="cnpj-input">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id="cnpj-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled || isLoading}
          maxLength={18} // 14 dígitos + 4 separadores
          className={`${className} ${isLoading ? 'pr-10' : ''}`}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
      {companyData && (
        <div className="text-sm text-green-600">
          Empresa: {companyData.nome}
        </div>
      )}
    </div>
  );
}