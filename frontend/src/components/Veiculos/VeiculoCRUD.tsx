import React, { useState } from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { veiculoConfig } from './VeiculoConfig';

interface Veiculo {
  id?: number;
  placa: string;
  marca?: string;
  tara: number;
  tipoRodado?: string;
  tipoCarroceria?: string;
  uf: string;
  ativo?: boolean;
}

interface VeiculoCRUDProps {
  // Estados dos modais
  showViewModal: boolean;
  showFormModal: boolean;
  showDeleteModal: boolean;

  // Dados
  selectedItem: Veiculo | null;
  isEditing: boolean;

  // Handlers
  onCloseModals: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete: () => Promise<void>;

  // Estados de loading
  saving: boolean;
  deleting: boolean;
}

export function VeiculoCRUD({
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
}: VeiculoCRUDProps) {
  const [formData, setFormData] = useState<any>({
    placa: '',
    marca: '',
    tara: 0,
    tipoRodado: '',
    tipoCarroceria: '',
    uf: '',
    ativo: true
  });

  // Função para popular o formulário
  React.useEffect(() => {
    if (selectedItem && showFormModal) {
      setFormData({
        placa: selectedItem.placa || '',
        marca: selectedItem.marca || '',
        tara: selectedItem.tara || 0,
        tipoRodado: selectedItem.tipoRodado || '',
        tipoCarroceria: selectedItem.tipoCarroceria || '',
        uf: selectedItem.uf || '',
        ativo: selectedItem.ativo ?? true
      });
    } else if (!isEditing && showFormModal) {
      setFormData({
        placa: '',
        marca: '',
        tara: 0,
        tipoRodado: '',
        tipoCarroceria: '',
        uf: '',
        ativo: true
      });
    }
  }, [selectedItem, showFormModal, isEditing]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <>
      {showViewModal && selectedItem && (
        <GenericViewModal
          config={veiculoConfig}
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
          config={veiculoConfig}
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
          itemName={`veículo "${selectedItem.placa}"`}
          onConfirm={onDelete}
          onClose={onCloseModals}
          loading={deleting}
        />
      )}
    </>
  );
}
