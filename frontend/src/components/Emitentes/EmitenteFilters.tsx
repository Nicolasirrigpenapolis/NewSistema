import React, { memo } from 'react';
import { EmitenteFilters } from '../../types/emitente';
import Icon from '../UI/Icon';

interface EmitenteFiltersProps {
  filtros: EmitenteFilters;
  onFiltrosChange: (filtros: Partial<EmitenteFilters>) => void;
  onLimparFiltros: () => void;
  carregando: boolean;
}

export const EmitenteFiltersComponent = memo(({
  filtros,
  onFiltrosChange,
  onLimparFiltros,
  carregando
}: EmitenteFiltersProps) => {
  const temFiltrosAtivos = filtros.search || filtros.tipo || filtros.status || filtros.uf;

  return (
    <div className="bg-card rounded-lg shadow-sm border border-gray-200 dark:border-0 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Busca geral */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por razão social, CNPJ, CPF..."
              value={filtros.search}
              onChange={(e) => onFiltrosChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-0 rounded-lg
                         bg-card dark:bg-gray-700 text-foreground dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-colors duration-200"
              disabled={carregando}
            />
          </div>
        </div>

        {/* Filtros específicos */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Tipo */}
          <select
            value={filtros.tipo}
            onChange={(e) => onFiltrosChange({ tipo: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-0 rounded-lg
                       bg-card dark:bg-gray-700 text-foreground dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors duration-200"
            disabled={carregando}
          >
            <option value="">Todos os tipos</option>
            <option value="PrestadorServico">Prestador Serviço</option>
            <option value="EntregaPropria">Entrega Própria</option>
          </select>

          {/* Status */}
          <select
            value={filtros.status}
            onChange={(e) => onFiltrosChange({ status: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-0 rounded-lg
                       bg-card dark:bg-gray-700 text-foreground dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors duration-200"
            disabled={carregando}
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>

          {/* UF */}
          <select
            value={filtros.uf}
            onChange={(e) => onFiltrosChange({ uf: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-0 rounded-lg
                       bg-card dark:bg-gray-700 text-foreground dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors duration-200"
            disabled={carregando}
          >
            <option value="">Todas as UFs</option>
            <option value="AC">AC</option>
            <option value="AL">AL</option>
            <option value="AP">AP</option>
            <option value="AM">AM</option>
            <option value="BA">BA</option>
            <option value="CE">CE</option>
            <option value="DF">DF</option>
            <option value="ES">ES</option>
            <option value="GO">GO</option>
            <option value="MA">MA</option>
            <option value="MT">MT</option>
            <option value="MS">MS</option>
            <option value="MG">MG</option>
            <option value="PA">PA</option>
            <option value="PB">PB</option>
            <option value="PR">PR</option>
            <option value="PE">PE</option>
            <option value="PI">PI</option>
            <option value="RJ">RJ</option>
            <option value="RN">RN</option>
            <option value="RS">RS</option>
            <option value="RO">RO</option>
            <option value="RR">RR</option>
            <option value="SC">SC</option>
            <option value="SP">SP</option>
            <option value="SE">SE</option>
            <option value="TO">TO</option>
          </select>

          {/* Limpar filtros */}
          {temFiltrosAtivos && (
            <button
              onClick={onLimparFiltros}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-background0
                         text-foreground rounded-lg border border-gray-300 dark:border-0
                         transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
              disabled={carregando}
            >
              <Icon name="x" className="h-4 w-4" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Filtros ativos */}
      {temFiltrosAtivos && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filtros.search && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
              <Icon name="search" className="h-3 w-3 mr-1" />
              {filtros.search}
            </span>
          )}
          {filtros.tipo && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs text-green-800 dark:text-green-200">
              <Icon name="tag" className="h-3 w-3 mr-1" />
              {filtros.tipo === 'PrestadorServico' ? 'Prestador Serviço' : 'Entrega Própria'}
            </span>
          )}
          {filtros.status && (
            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
              <Icon name="info" className="h-3 w-3 mr-1" />
              {filtros.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </span>
          )}
          {filtros.uf && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded text-xs text-purple-800 dark:text-purple-200">
              <Icon name="map-pin" className="h-3 w-3 mr-1" />
              {filtros.uf}
            </span>
          )}
        </div>
      )}
    </div>
  );
});