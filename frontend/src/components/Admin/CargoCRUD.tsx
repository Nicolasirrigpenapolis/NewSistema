import React, { useState } from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { cargoConfig, CargoFormData } from './CargoConfig';

interface Cargo {
  id?: number;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

interface CargoCRUDProps {
  // Estados dos modais
  showViewModal: boolean;
  showFormModal: boolean;
  showDeleteModal: boolean;

  // Dados
  selectedItem: Cargo | null;
  isEditing: boolean;

  // Handlers
  onCloseModals: () => void;
  onSave: (data: CargoFormData) => Promise<void>;
  onDelete: () => Promise<void>;

  // Estados de loading
  saving: boolean;
  deleting: boolean;
}

export function CargoCRUD({
  showViewModal,
  showFormModal,
  showDeleteModal,
  selectedItem,
  isEditing,
  onCloseModals,
  onSave,
  onDelete,
  saving,
  deleting
}: CargoCRUDProps) {
  const [formData, setFormData] = useState<CargoFormData>({
    nome: '',
    descricao: '',
    ativo: true
  });

  // Função para popular o formulário
  React.useEffect(() => {
    if (selectedItem && showFormModal) {
      setFormData({
        nome: selectedItem.nome || '',
        descricao: selectedItem.descricao || '',
        ativo: selectedItem.ativo ?? true
      });
    } else if (!isEditing && showFormModal) {
      setFormData({
        nome: '',
        descricao: '',
        ativo: true
      });
    }
  }, [selectedItem, showFormModal, isEditing]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <>
      {showViewModal && selectedItem && (
        <GenericViewModal
          config={cargoConfig}
          data={selectedItem}
          onClose={onCloseModals}
          onEdit={() => {
            onCloseModals();
            // O componente pai deve reabrir o modal de edição
          }}
        />
      )}

      {showFormModal && (
        <GenericFormModal
          config={cargoConfig}
          data={formData}
          isEditing={isEditing}
          loading={saving}
          onSave={handleSave}
          onCancel={onCloseModals}
          onFieldChange={handleFieldChange}
        />
      )}

      {showDeleteModal && selectedItem && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          itemName={`cargo "${selectedItem.nome}"`}
          onConfirm={onDelete}
          onClose={onCloseModals}
          loading={deleting}
        />
      )}
    </>
  );
}