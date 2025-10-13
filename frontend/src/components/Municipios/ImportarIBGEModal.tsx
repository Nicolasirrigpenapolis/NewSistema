import React, { useState } from 'react';
import { FormShell } from '../UI/FormShell';

interface ImportarIBGEModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (uf: string) => Promise<void>;
  onConfirm?: () => Promise<void>;
  isImporting?: boolean;
}

export function ImportarIBGEModal({
  isOpen,
  onClose,
  onImport,
  onConfirm,
  isImporting: externalImporting
}: ImportarIBGEModalProps) {
  const [uf, setUf] = useState('');
  const [importing, setImporting] = useState(false);
  const isImporting = externalImporting !== undefined ? externalImporting : importing;

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const handleImport = async () => {
    if (!uf && !onConfirm) return;

    setImporting(true);
    try {
      if (onConfirm) {
        await onConfirm();
      } else if (onImport) {
        await onImport(uf);
      }
      onClose();
      setUf('');
    } catch (error) {
      console.error('Erro ao importar:', error);
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FormShell
      title="Importar Municípios do IBGE"
      subtitle="Selecione o estado para importar os municípios"
      isModal
      onClose={onClose}
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Estado (UF)
          </label>
          <select
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={importing}
          >
            <option value="">Selecione um estado</option>
            {ufs.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !uf}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </div>
    </FormShell>
  );
}
