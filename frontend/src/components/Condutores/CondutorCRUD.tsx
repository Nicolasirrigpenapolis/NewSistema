import React from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { condutorConfig } from './CondutorConfig';
import { formatCPF } from '../../utils/formatters';

interface Condutor {
  id?: number;
  nome: string;
  cpf: string;
  telefone?: string;
  ativo?: boolean;
}

interface CondutorCRUDProps {
  // Modais
  viewModalOpen: boolean;
  formModalOpen: boolean;
  deleteModalOpen: boolean;

  // Dados
  selectedCondutor: Condutor | null;
  isEdit: boolean;

  // Callbacks
  onViewClose: () => void;
  onFormClose: () => void;
  onDeleteClose: () => void;
  onSave: (data: Condutor) => Promise<void>;
  onEdit: (condutor: Condutor) => void;
  onDelete: () => Promise<void>;

  // Estados
  saving?: boolean;
  deleting?: boolean;
}

export function CondutorCRUD({
  viewModalOpen,
  formModalOpen,
  deleteModalOpen,
  selectedCondutor,
  isEdit,
  onViewClose,
  onFormClose,
  onDeleteClose,
  onSave,
  onEdit,
  onDelete,
  saving = false,
  deleting = false
}: CondutorCRUDProps) {

  // Configurar ações do modal de visualização
  const viewActions = selectedCondutor ? [
    {
      label: 'Editar Condutor',
      icon: 'edit',
      variant: 'warning' as const,
      onClick: () => {
        onViewClose();
        onEdit(selectedCondutor);
      }
    }
  ] : [];

  return (
    <>
      {/* Modal de Visualização */}
      <GenericViewModal
        isOpen={viewModalOpen}
        onClose={onViewClose}
        item={selectedCondutor}
        title={condutorConfig.view.title}
        subtitle={condutorConfig.view.subtitle}
        headerIcon={condutorConfig.view.headerIcon}
        headerColor={condutorConfig.view.headerColor}
        sections={selectedCondutor ? condutorConfig.view.getSections(selectedCondutor) : []}
        actions={viewActions}
        statusConfig={selectedCondutor ? condutorConfig.view.getStatusConfig?.(selectedCondutor) : undefined}
        idField={condutorConfig.view.idField}
      />

      {/* Modal de Criação/Edição */}
      <GenericFormModal
        isOpen={formModalOpen}
        onClose={onFormClose}
        onSave={onSave}
        item={selectedCondutor}
        isEditing={isEdit}
        title={isEdit ? (condutorConfig.form.editTitle || condutorConfig.form.title) : condutorConfig.form.title}
        subtitle={isEdit ? (condutorConfig.form.editSubtitle || condutorConfig.form.subtitle) : condutorConfig.form.subtitle}
        headerIcon={condutorConfig.form.headerIcon}
        headerColor={condutorConfig.form.headerColor}
        sections={condutorConfig.form.getSections(selectedCondutor)}
        loading={saving}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Excluir Condutor"
        message="Tem certeza de que deseja excluir este condutor?"
        itemName={selectedCondutor ?
          `${selectedCondutor.nome} (${formatCPF(selectedCondutor.cpf)})`
          : ''
        }
        onConfirm={onDelete}
        onCancel={onDeleteClose}
        loading={deleting}
      />
    </>
  );
}