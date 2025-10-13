import React, { useState } from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { condutorConfig } from './CondutorConfig';

interface Condutor {
  id?: number;
  nome: string;
  cpf: string;
  telefone?: string;
  ativo?: boolean;
}

interface CondutorCRUDProps {
  // Estados dos modais
  showViewModal: boolean;
  showFormModal: boolean;
  showDeleteModal: boolean;

  // Dados
  selectedItem: Condutor | null;
  isEditing: boolean;

  // Handlers
  onCloseModals: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete: () => Promise<void>;

  // Estados de loading
  saving: boolean;
  deleting: boolean;
}

export function CondutorCRUD({
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
}: CondutorCRUDProps) {
  const [formData, setFormData] = useState<any>({
    nome: '',
    cpf: '',
    telefone: '',
    ativo: true
  });

  // Função para popular o formulário
  React.useEffect(() => {
    if (selectedItem && showFormModal) {
      setFormData({
        nome: selectedItem.nome || '',
        cpf: selectedItem.cpf || '',
        telefone: selectedItem.telefone || '',
        ativo: selectedItem.ativo ?? true
      });
    } else if (!isEditing && showFormModal) {
      setFormData({
        nome: '',
        cpf: '',
        telefone: '',
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
          config={condutorConfig}
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
          config={condutorConfig}
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
          itemName={`condutor "${selectedItem.nome}"`}
          onConfirm={onDelete}
          onClose={onCloseModals}
          loading={deleting}
        />
      )}
    </>
  );
}
