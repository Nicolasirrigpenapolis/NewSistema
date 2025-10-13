import React, { Dispatch, SetStateAction } from 'react';
import { EntidadesCarregadas } from '../../../types/mdfe';

interface MDFeFormProps {
  dados: any;
  onDadosChange: Dispatch<SetStateAction<any>>;
  onSalvar: () => Promise<void>;
  onSalvarRascunho?: () => Promise<void>;
  onCancelar?: () => void;
  onTransmitir?: () => Promise<void>;
  salvando?: boolean;
  transmitindo?: boolean;
  isEdicao?: boolean;
  carregandoDados?: boolean;
  entidadesCarregadas?: EntidadesCarregadas;
}

export function MDFeForm({ 
  dados, 
  onDadosChange, 
  onSalvar, 
  onSalvarRascunho,
  onCancelar,
  onTransmitir,
  salvando = false,
  transmitindo = false,
  isEdicao = false,
  carregandoDados = false,
  entidadesCarregadas = {}
}: MDFeFormProps) {
  const updateDados = (field: string, value: any) => {
    onDadosChange((prev: any) => ({ ...prev, [field]: value }));
  };

  if (carregandoDados) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Dados do MDF-e</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Série</label>
            <input
              type="text"
              value={dados?.serie || ''}
              onChange={(e) => updateDados('serie', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Número</label>
            <input
              type="text"
              value={dados?.numero || ''}
              onChange={(e) => updateDados('numero', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancelar && (
          <button
            onClick={onCancelar}
            className="px-6 py-2 border border-border rounded-lg hover:bg-accent"
          >
            Cancelar
          </button>
        )}
        
        {onSalvarRascunho && (
          <button
            onClick={onSalvarRascunho}
            disabled={salvando}
            className="px-6 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
        )}
        
        <button
          onClick={onSalvar}
          disabled={salvando}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : isEdicao ? 'Atualizar' : 'Salvar'}
        </button>

        {onTransmitir && (
          <button
            onClick={onTransmitir}
            disabled={transmitindo}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {transmitindo ? 'Transmitindo...' : 'Transmitir'}
          </button>
        )}
      </div>
    </div>
  );
}
