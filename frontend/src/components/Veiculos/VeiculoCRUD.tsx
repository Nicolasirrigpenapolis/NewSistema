import React from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { veiculoConfig } from './VeiculoConfig';

interface Veiculo {
  id?: number;
  placa: string;
  marca?: string;
  tara: number;
  tipoRodado: string;
  tipoCarroceria: string;
  uf: string;
  ativo?: boolean;
}

interface VeiculoCRUDProps {
  // Modais
  viewModalOpen: boolean;
  formModalOpen: boolean;
  deleteModalOpen: boolean;

  // Dados
  selectedVeiculo: Veiculo | null;
  isEdit: boolean;

  // Callbacks
  onViewClose: () => void;
  onFormClose: () => void;
  onDeleteClose: () => void;
  onSave: (data: Veiculo) => Promise<void>;
  onEdit: (veiculo: Veiculo) => void;
  onDelete: () => Promise<void>;

  // Estados
  saving?: boolean;
  deleting?: boolean;
}

export function VeiculoCRUD({
  viewModalOpen,
  formModalOpen,
  deleteModalOpen,
  selectedVeiculo,
  isEdit,
  onViewClose,
  onFormClose,
  onDeleteClose,
  onSave,
  onEdit,
  onDelete,
  saving = false,
  deleting = false
}: VeiculoCRUDProps) {

  // Configurar ações do modal de visualização
  const viewActions = selectedVeiculo ? [
    {
      label: 'Editar Veículo',
      icon: 'edit',
      onClick: () => {
        onViewClose();
        onEdit(selectedVeiculo);
      }
    }
  ] : [];

  return (
    <>
      {/* Modal de Visualização */}
      <GenericViewModal
        isOpen={viewModalOpen}
        onClose={onViewClose}
        item={selectedVeiculo}
        title={veiculoConfig.view.title}
        subtitle={veiculoConfig.view.subtitle}
        headerIcon={veiculoConfig.view.headerIcon}
        headerColor={veiculoConfig.view.headerColor}
        sections={selectedVeiculo ? veiculoConfig.view.getSections(selectedVeiculo) : []}
        actions={viewActions}
        statusConfig={selectedVeiculo ? veiculoConfig.view.getStatusConfig?.(selectedVeiculo) : undefined}
        idField={veiculoConfig.view.idField}
      />

      {/* Modal de Criação/Edição */}
      <GenericFormModal
        isOpen={formModalOpen}
        onClose={onFormClose}
        onSave={onSave}
        item={selectedVeiculo}
        isEditing={isEdit}
        title={isEdit ? (veiculoConfig.form.editTitle || veiculoConfig.form.title) : veiculoConfig.form.title}
        subtitle={isEdit ? (veiculoConfig.form.editSubtitle || veiculoConfig.form.subtitle) : veiculoConfig.form.subtitle}
        headerIcon={veiculoConfig.form.headerIcon}
        headerColor={veiculoConfig.form.headerColor}
        sections={veiculoConfig.form.getSections(selectedVeiculo)}
        loading={saving}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Excluir Veículo"
        message="Tem certeza de que deseja excluir este veículo?"
        itemName={selectedVeiculo ?
          `veículo ${selectedVeiculo.placa} (${selectedVeiculo.marca || 'Sem marca'})`
          : ''
        }
        onConfirm={onDelete}
        onCancel={onDeleteClose}
        loading={deleting}
      />
    </>
  );
}