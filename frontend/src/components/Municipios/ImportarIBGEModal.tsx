import React from 'react';

interface ImportarIBGEModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isImporting: boolean;
}

export function ImportarIBGEModal({ isOpen, onClose, onConfirm, isImporting }: ImportarIBGEModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isImporting) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-card rounded-xl border border-border shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header com gradiente azul para representar dados governamentais */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-card bg-opacity-20 rounded-lg flex items-center justify-center relative">
              <i className="fas fa-download text-white text-lg absolute"></i>
              {/* Fallback se FontAwesome falhar - aparece apenas se o ícone acima não estiver visível */}
              <span className="text-white text-xl" style={{ fontFamily: 'monospace' }}>↓</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Importar Municípios IBGE</h2>
              <p className="text-blue-100 text-sm">Base oficial brasileira</p>
            </div>
          </div>
          {!isImporting && (
            <button
              className="text-white hover:text-blue-200 transition-colors duration-200 text-2xl"
              onClick={handleClose}
            >
              ×
            </button>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Ícone e descrição principal */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-map-marked-alt text-2xl text-blue-600 dark:text-blue-300"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Base Completa de Municípios
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Deseja importar todos os municípios brasileiros da base oficial do IBGE?
                Esta operação irá adicionar mais de <strong>5.570 municípios</strong> ao sistema.
              </p>
            </div>

            {/* Informações importantes */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Importante
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Municípios existentes serão atualizados</li>
                    <li>• Novos municípios serão adicionados</li>
                    <li>• Processo pode levar alguns minutos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Status de importação */}
            {isImporting && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                      Importando municípios...
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Por favor, aguarde. Não feche esta janela.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer com botões */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isImporting}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Importando...</span>
              </>
            ) : (
              <>
                <i className="fas fa-download"></i>
                <span>Importar Agora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}