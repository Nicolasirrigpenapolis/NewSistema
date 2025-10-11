import React, { memo } from 'react';
import { PaginationData } from '../../types/emitente';
import Icon from '../UI/Icon';

interface EmitentesPaginationProps {
  paginacao: PaginationData;
  onPaginaChange: (pagina: number) => void;
  onTamanhoChange: (tamanho: number) => void;
  carregando: boolean;
}

export const EmitentesPagination = memo(({
  paginacao,
  onPaginaChange,
  onTamanhoChange,
  carregando
}: EmitentesPaginationProps) => {
  const gerarPaginas = () => {
    const paginas = [];
    const paginaAtual = paginacao.currentPage;
    const totalPaginas = paginacao.totalPages;

    // Sempre mostrar primeira página
    if (totalPaginas > 0) {
      paginas.push(1);
    }

    // Calcular intervalo ao redor da página atual
    let inicio = Math.max(2, paginaAtual - 2);
    let fim = Math.min(totalPaginas - 1, paginaAtual + 2);

    // Adicionar ellipsis antes se necessário
    if (inicio > 2) {
      paginas.push('...');
    }

    // Adicionar páginas ao redor da atual
    for (let i = inicio; i <= fim; i++) {
      if (i !== 1 && i !== totalPaginas) {
        paginas.push(i);
      }
    }

    // Adicionar ellipsis depois se necessário
    if (fim < totalPaginas - 1) {
      paginas.push('...');
    }

    // Sempre mostrar última página (se não for a primeira)
    if (totalPaginas > 1) {
      paginas.push(totalPaginas);
    }

    return paginas;
  };

  if (paginacao.totalItems === 0) {
    return null;
  }

  return (
    <div className="bg-card px-4 py-3 border-t border-gray-200 dark:border-0 sm:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Informações da paginação */}
        <div className="flex items-center text-sm text-foreground">
          <span>
            Mostrando <span className="font-medium">{paginacao.startItem}</span> a{' '}
            <span className="font-medium">{paginacao.endItem}</span> de{' '}
            <span className="font-medium">{paginacao.totalItems}</span> resultados
          </span>
        </div>

        {/* Controles de paginação */}
        <div className="flex items-center gap-4">
          {/* Tamanho da página */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-foreground">
              Por página:
            </label>
            <select
              value={paginacao.pageSize}
              onChange={(e) => onTamanhoChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 dark:border-0 rounded
                         bg-card dark:bg-gray-700 text-foreground dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-colors duration-200 text-sm"
              disabled={carregando}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Navegação */}
          <div className="flex items-center gap-1">
            {/* Primeira página */}
            <button
              onClick={() => onPaginaChange(1)}
              disabled={paginacao.currentPage === 1 || carregando}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-accent rounded-md
                         transition-colors duration-200"
              title="Primeira página"
            >
              <Icon name="chevrons-left" className="h-4 w-4" />
            </button>

            {/* Página anterior */}
            <button
              onClick={() => onPaginaChange(paginacao.currentPage - 1)}
              disabled={!paginacao.hasPreviousPage || carregando}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-accent rounded-md
                         transition-colors duration-200"
              title="Página anterior"
            >
              <Icon name="chevron-left" className="h-4 w-4" />
            </button>

            {/* Números das páginas */}
            <div className="flex items-center gap-1">
              {gerarPaginas().map((pagina, index) => {
                if (pagina === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 text-gray-500 dark:text-gray-400"
                    >
                      ...
                    </span>
                  );
                }

                const numeroPagina = pagina as number;
                const isAtual = numeroPagina === paginacao.currentPage;

                return (
                  <button
                    key={numeroPagina}
                    onClick={() => onPaginaChange(numeroPagina)}
                    disabled={carregando}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                      ${isAtual
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-foreground hover:bg-accent'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {numeroPagina}
                  </button>
                );
              })}
            </div>

            {/* Próxima página */}
            <button
              onClick={() => onPaginaChange(paginacao.currentPage + 1)}
              disabled={!paginacao.hasNextPage || carregando}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-accent rounded-md
                         transition-colors duration-200"
              title="Próxima página"
            >
              <Icon name="chevron-right" className="h-4 w-4" />
            </button>

            {/* Última página */}
            <button
              onClick={() => onPaginaChange(paginacao.totalPages)}
              disabled={paginacao.currentPage === paginacao.totalPages || carregando}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-accent rounded-md
                         transition-colors duration-200"
              title="Última página"
            >
              <Icon name="chevrons-right" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});