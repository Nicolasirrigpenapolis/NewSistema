import React from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { reboqueConfig } from './ReboqueConfig';

interface Reboque {
  id?: number;
  placa: string;
  tara: number;
  tipoRodado: string;
  tipoCarroceria: string;
  uf: string;
  rntrc?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataUltimaAlteracao?: string;
}

interface ReboqueCRUDProps {
  // Modais
  viewModalOpen: boolean;
  formModalOpen: boolean;
  deleteModalOpen: boolean;

  // Dados
  selectedReboque: Reboque | null;
  isEdit: boolean;

  // Callbacks
  onViewClose: () => void;
  onFormClose: () => void;
  onDeleteClose: () => void;
  onSave: (data: Reboque) => Promise<void>;
  onEdit: (reboque: Reboque) => void;
  onDelete: () => Promise<void>;

  // Estados
  saving?: boolean;
  deleting?: boolean;
}

export function ReboqueCRUD({
  viewModalOpen,
  formModalOpen,
  deleteModalOpen,
  selectedReboque,
  isEdit,
  onViewClose,
  onFormClose,
  onDeleteClose,
  onSave,
  onEdit,
  onDelete,
  saving = false,
  deleting = false
}: ReboqueCRUDProps) {

  // Configurar ações do modal de visualização
  const viewActions = selectedReboque ? [
    {
      label: 'Editar Reboque',
      icon: 'edit',
      variant: 'warning' as const,
      onClick: () => {
        onViewClose();
        onEdit(selectedReboque);
      }
    }
  ] : [];

  return (
    <>
      {/* Modal de Visualização */}
      <GenericViewModal
        isOpen={viewModalOpen}
        onClose={onViewClose}
        item={selectedReboque}
        title={reboqueConfig.view.title}
        subtitle={reboqueConfig.view.subtitle}
        headerIcon={reboqueConfig.view.headerIcon}
        headerColor={reboqueConfig.view.headerColor}
        sections={selectedReboque ? reboqueConfig.view.getSections(selectedReboque) : []}
        actions={viewActions}
        statusConfig={selectedReboque ? reboqueConfig.view.getStatusConfig?.(selectedReboque) : undefined}
        idField={reboqueConfig.view.idField}
      />

      {/* Modal de Criação/Edição */}
      <GenericFormModal
        isOpen={formModalOpen}
        onClose={onFormClose}
        onSave={onSave}
        item={selectedReboque}
        isEditing={isEdit}
        title={isEdit ? (reboqueConfig.form.editTitle || reboqueConfig.form.title) : reboqueConfig.form.title}
        subtitle={isEdit ? (reboqueConfig.form.editSubtitle || reboqueConfig.form.subtitle) : reboqueConfig.form.subtitle}
        headerIcon={reboqueConfig.form.headerIcon}
        headerColor={reboqueConfig.form.headerColor}
        sections={reboqueConfig.form.getSections(selectedReboque)}
        loading={saving}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Excluir Reboque"
        message="Tem certeza de que deseja excluir este reboque?"
        itemName={selectedReboque ?
          `reboque ${selectedReboque.placa}`
          : ''
        }
        onConfirm={onDelete}
        onCancel={onDeleteClose}
        loading={deleting}
      />
    </>
  );
}