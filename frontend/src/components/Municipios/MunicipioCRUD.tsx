import React from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { municipioConfig } from './MunicipioConfig';

interface Municipio {
  id?: number;
  codigo: number;
  nome: string;
  uf: string;
  ativo?: boolean;
}

interface MunicipioCRUDProps {
  // Modais
  viewModalOpen: boolean;
  formModalOpen: boolean;
  deleteModalOpen: boolean;

  // Dados
  selectedMunicipio: Municipio | null;
  isEdit: boolean;

  // Callbacks
  onViewClose: () => void;
  onFormClose: () => void;
  onDeleteClose: () => void;
  onSave: (data: Municipio) => Promise<void>;
  onEdit: (municipio: Municipio) => void;
  onDelete: () => Promise<void>;

  // Estados
  saving?: boolean;
  deleting?: boolean;
}

export function MunicipioCRUD({
  viewModalOpen,
  formModalOpen,
  deleteModalOpen,
  selectedMunicipio,
  isEdit,
  onViewClose,
  onFormClose,
  onDeleteClose,
  onSave,
  onEdit,
  onDelete,
  saving = false,
  deleting = false
}: MunicipioCRUDProps) {

  // Configurar ações do modal de visualização
  const viewActions = selectedMunicipio ? [
    {
      label: 'Editar Município',
      icon: 'edit',
      variant: 'warning' as const,
      onClick: () => {
        onViewClose();
        onEdit(selectedMunicipio);
      }
    }
  ] : [];

  // Configurar seções do formulário
  const getFormSections = (item?: Municipio) => {
    return municipioConfig.form.getSections(item);
  };

  return (
    <>
      {/* Modal de Visualização */}
      <GenericViewModal
        isOpen={viewModalOpen}
        onClose={onViewClose}
        item={selectedMunicipio}
        title={municipioConfig.view.title}
        subtitle={municipioConfig.view.subtitle}
        headerIcon={municipioConfig.view.headerIcon}
        headerColor={municipioConfig.view.headerColor}
        sections={selectedMunicipio ? municipioConfig.view.getSections(selectedMunicipio) : []}
        actions={viewActions}
        statusConfig={selectedMunicipio ? municipioConfig.view.getStatusConfig?.(selectedMunicipio) : undefined}
        idField={municipioConfig.view.idField}
      />

      {/* Modal de Criação/Edição */}
      <GenericFormModal
        isOpen={formModalOpen}
        onClose={onFormClose}
        onSave={onSave}
        item={selectedMunicipio}
        isEditing={isEdit}
        title={isEdit ? (municipioConfig.form.editTitle || municipioConfig.form.title) : municipioConfig.form.title}
        subtitle={isEdit ? (municipioConfig.form.editSubtitle || municipioConfig.form.subtitle) : municipioConfig.form.subtitle}
        headerIcon={municipioConfig.form.headerIcon}
        headerColor={municipioConfig.form.headerColor}
        sections={getFormSections(selectedMunicipio || undefined)}
        loading={saving}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Excluir Município"
        message="Tem certeza de que deseja excluir este município?"
        itemName={selectedMunicipio ?
          `${selectedMunicipio.nome} - ${selectedMunicipio.uf}`
          : ''
        }
        onConfirm={onDelete}
        onClose={onDeleteClose}
        loading={deleting}
      />
    </>
  );
}