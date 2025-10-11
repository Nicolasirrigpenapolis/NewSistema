import React from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { seguradoraConfig } from './SeguradoraConfig';
import { formatCNPJ } from '../../utils/formatters';

interface Seguradora {
  id?: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  apolice?: string;
  ativo?: boolean;
}

interface SeguradoraCRUDProps {
  // Modais
  viewModalOpen: boolean;
  formModalOpen: boolean;
  deleteModalOpen: boolean;

  // Dados
  selectedSeguradora: Seguradora | null;
  isEdit: boolean;

  // Callbacks
  onViewClose: () => void;
  onFormClose: () => void;
  onDeleteClose: () => void;
  onSave: (data: Seguradora) => Promise<void>;
  onEdit: (seguradora: Seguradora) => void;
  onDelete: () => Promise<void>;
  onCNPJDataFetch?: (data: any) => void;

  // Estados
  saving?: boolean;
  deleting?: boolean;
}

export function SeguradoraCRUD({
  viewModalOpen,
  formModalOpen,
  deleteModalOpen,
  selectedSeguradora,
  isEdit,
  onViewClose,
  onFormClose,
  onDeleteClose,
  onSave,
  onEdit,
  onDelete,
  onCNPJDataFetch,
  saving = false,
  deleting = false
}: SeguradoraCRUDProps) {

  // Configurar ações do modal de visualização
  const viewActions = selectedSeguradora ? [
    {
      label: 'Editar Seguradora',
      icon: 'edit',
      variant: 'warning' as const,
      onClick: () => {
        onViewClose();
        onEdit(selectedSeguradora);
      }
    }
  ] : [];

  // Configurar seções do formulário com callback de CNPJ
  const getFormSections = (item?: Seguradora) => {
    const sections = seguradoraConfig.form.getSections(item);

    // Configurar callback do CNPJ se fornecido
    if (onCNPJDataFetch) {
      sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.key === 'cnpj' && field.onDataFetch) {
            field.onDataFetch = onCNPJDataFetch;
          }
        });
      });
    }

    return sections;
  };

  return (
    <>
      {/* Modal de Visualização */}
      <GenericViewModal
        isOpen={viewModalOpen}
        onClose={onViewClose}
        item={selectedSeguradora}
        title={seguradoraConfig.view.title}
        subtitle={seguradoraConfig.view.subtitle}
        headerIcon={seguradoraConfig.view.headerIcon}
        headerColor={seguradoraConfig.view.headerColor}
        sections={selectedSeguradora ? seguradoraConfig.view.getSections(selectedSeguradora) : []}
        actions={viewActions}
        statusConfig={selectedSeguradora ? seguradoraConfig.view.getStatusConfig?.(selectedSeguradora) : undefined}
        idField={seguradoraConfig.view.idField}
      />

      {/* Modal de Criação/Edição */}
      <GenericFormModal
        isOpen={formModalOpen}
        onClose={onFormClose}
        onSave={onSave}
        item={selectedSeguradora}
        isEditing={isEdit}
        title={isEdit ? (seguradoraConfig.form.editTitle || seguradoraConfig.form.title) : seguradoraConfig.form.title}
        subtitle={isEdit ? (seguradoraConfig.form.editSubtitle || seguradoraConfig.form.subtitle) : seguradoraConfig.form.subtitle}
        headerIcon={seguradoraConfig.form.headerIcon}
        headerColor={seguradoraConfig.form.headerColor}
        sections={getFormSections(selectedSeguradora)}
        loading={saving}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Excluir Seguradora"
        message="Tem certeza de que deseja excluir esta seguradora?"
        itemName={selectedSeguradora ?
          `${selectedSeguradora.razaoSocial} (${formatCNPJ(selectedSeguradora.cnpj)})`
          : ''
        }
        onConfirm={onDelete}
        onCancel={onDeleteClose}
        loading={deleting}
      />
    </>
  );
}