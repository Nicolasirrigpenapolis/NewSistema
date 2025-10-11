import React, { useState, useRef, useEffect } from 'react';

interface ComboboxOption {
  id: string | number;
  label: string;
  sublabel?: string;
  icon?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  selectedValue?: string | number | null;
  onSelect: (value: string | number, option: ComboboxOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Selecione uma opção",
  searchPlaceholder = "Buscar...",
  label,
  required = false,
  disabled = false,
  emptyMessage = "Nenhuma opção encontrada"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Encontrar opção selecionada
  const selectedOption = options.find(option => option.id === selectedValue);

  // Filtrar opções baseado na busca
  const filteredOptions = options.filter(option =>
    (option.label && option.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (option.sublabel && option.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (option: ComboboxOption) => {
    onSelect(option.id, option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  return (
    <div className="relative w-full" ref={comboboxRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <div
          className={`
            flex items-center justify-between px-4 py-3 bg-card
            border-2 border-gray-300 dark:border-0 rounded-lg cursor-pointer
            transition-colors duration-200 min-h-[48px]
            ${isOpen ? 'border-slate-500 ring-2 ring-slate-500/10' : 'hover:border-gray-400 dark:hover:border-gray-500'}
            ${disabled ? 'bg-background text-gray-400 cursor-not-allowed' : ''}
          `}
          onClick={handleToggle}
        >
          <div className="flex-1 min-w-0">
            {selectedOption ? (
              <div className="flex items-center gap-2">
                {selectedOption.icon && <i className={`${selectedOption.icon} text-slate-500 w-4 text-center`}></i>}
                <span className="font-medium text-foreground">{selectedOption.label}</span>
                {selectedOption.sublabel && (
                  <span className="text-xs text-gray-500 ml-1">{selectedOption.sublabel}</span>
                )}
              </div>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <i className={`fas fa-chevron-down text-gray-500 transition-transform duration-200 text-xs ${isOpen ? 'rotate-180' : ''}`}></i>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-card border border-gray-200 dark:border-0 rounded-lg shadow-xl mt-1 max-h-80 overflow-hidden">
            <div className="relative p-3 border-b border-gray-100 dark:border-0">
              <i className="fas fa-search absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-0 rounded-md text-sm bg-card dark:bg-gray-700 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`
                      flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150
                      hover:bg-background dark:hover:bg-gray-700
                      ${selectedValue === option.id ? 'bg-background dark:bg-gray-700 text-slate-600 dark:text-slate-400' : ''}
                    `}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.icon && <i className={`${option.icon} text-slate-500 w-4 text-center`}></i>}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">{option.label}</div>
                      {option.sublabel && (
                        <div className="text-xs text-gray-500 mt-0.5">{option.sublabel}</div>
                      )}
                    </div>
                    {selectedValue === option.id && (
                      <i className="fas fa-check text-slate-600 text-xs"></i>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-gray-400 text-sm">
                  <i className="fas fa-search text-2xl opacity-50"></i>
                  <span>{emptyMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};