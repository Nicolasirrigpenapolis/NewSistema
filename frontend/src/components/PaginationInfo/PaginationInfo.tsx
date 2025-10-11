import React from 'react';

interface PaginationInfoProps {
  startItem: number;
  endItem: number;
  totalItems: number;
  itemName: string; // ex: "emitentes", "veículos", "condutores"
}

const PaginationInfo: React.FC<PaginationInfoProps> = ({
  startItem,
  endItem,
  totalItems,
  itemName
}) => {
  if (totalItems === 0) {
    return (
      <div className="pagination-info">
        <span>Nenhum {itemName} encontrado</span>
      </div>
    );
  }

  // Garantir que os valores são válidos para evitar NaN
  const validStartItem = startItem && !isNaN(startItem) ? startItem : 0;
  const validEndItem = endItem && !isNaN(endItem) ? endItem : 0;
  const validTotalItems = totalItems && !isNaN(totalItems) ? totalItems : 0;

  return (
    <div className="pagination-info">
      <span>
        Mostrando {validStartItem} até {validEndItem} de {validTotalItems} {itemName}
      </span>
    </div>
  );
};

export default PaginationInfo;