import React from 'react';

interface MDFeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mdfe: any;
}

export function MDFeViewModal({ isOpen, onClose, mdfe }: MDFeViewModalProps) {
  if (!isOpen || !mdfe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Detalhes do MDF-e</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Número: {mdfe.numero || 'N/A'} | Série: {mdfe.serie || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Chave de Acesso</label>
              <p className="text-foreground font-mono text-sm mt-1">{mdfe.chaveAcesso || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="text-foreground mt-1">{mdfe.status || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data Emissão</label>
              <p className="text-foreground mt-1">{mdfe.dataEmissao || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Protocolo</label>
              <p className="text-foreground mt-1">{mdfe.protocolo || 'N/A'}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
