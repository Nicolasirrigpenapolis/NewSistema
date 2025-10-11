import React from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { contratanteConfig } from './ContratanteConfig';
import { formatCNPJ, formatCPF } from '../../utils/formatters';

interface Contratante {
  id?: number;
  cnpj?: string;
  cpf?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  codMunicipio: number;
  municipio: string;
  cep: string;
  uf: string;
  ativo?: boolean;
}

interface ContratanteCRUDProps {
  // Modais
  viewModalOpen: boolean;
  formModalOpen: boolean;
  deleteModalOpen: boolean;

  // Dados
  selectedContratante: Contratante | null;
  isEdit: boolean;
  formData?: Partial<Contratante>;

  // Callbacks
  onViewClose: () => void;
  onFormClose: () => void;
  onDeleteClose: () => void;
  onSave: (data: Contratante) => Promise<void>;
  onEdit: (contratante: Contratante) => void;
  onDelete: () => Promise<void>;
  onCNPJDataFetch?: (data: any) => void;
  onFieldChange?: (field: string, value: any) => void;

  // Estados
  saving?: boolean;
  deleting?: boolean;
}

export function ContratanteCRUD({
  viewModalOpen,
  formModalOpen,
  deleteModalOpen,
  selectedContratante,
  isEdit,
  formData,
  onViewClose,
  onFormClose,
  onDeleteClose,
  onSave,
  onEdit,
  onDelete,
  onCNPJDataFetch,
  onFieldChange,
  saving = false,
  deleting = false
}: ContratanteCRUDProps) {

  // Configurar ações do modal de visualização
  const viewActions = selectedContratante ? [
    {
      label: 'Editar Contratante',
      icon: 'edit',
      variant: 'warning' as const,
      onClick: () => {
        onViewClose();
        onEdit(selectedContratante);
      }
    }
  ] : [];

  // Configurar seções do formulário com callback de CNPJ
  const getFormSections = (item?: Contratante) => {
    const sections = contratanteConfig.form.getSections(item);

    // Configurar callback do CNPJ se fornecido
    if (onCNPJDataFetch) {
      sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.key === 'cnpj') {
            field.onDataFetch = onCNPJDataFetch;
          }
        });
      });
    }

    // Configurar visibilidade condicional dos campos CNPJ/CPF
    sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.key === 'cnpj' || field.key === 'cpf') {
          // Campos serão mostrados/ocultados com base no tipoDocumento
          field.show = true; // O componente pai controlará a visibilidade
        }
      });
    });

    return sections;
  };

  return (
    <>
      {/* Modal de Visualização */}
      <GenericViewModal
        isOpen={viewModalOpen}
        onClose={onViewClose}
        item={selectedContratante}
        title={contratanteConfig.view.title}
        subtitle={contratanteConfig.view.subtitle}
        headerIcon={contratanteConfig.view.headerIcon}
        headerColor={contratanteConfig.view.headerColor}
        sections={selectedContratante ? contratanteConfig.view.getSections(selectedContratante) : []}
        actions={viewActions}
        statusConfig={selectedContratante ? contratanteConfig.view.getStatusConfig?.(selectedContratante) : undefined}
        idField={contratanteConfig.view.idField}
      />

      {/* Modal de Criação/Edição */}
      <GenericFormModal
        isOpen={formModalOpen}
        onClose={onFormClose}
        onSave={onSave}
        item={selectedContratante}
        data={formData}
        title={isEdit ? (contratanteConfig.form.editTitle || contratanteConfig.form.title) : contratanteConfig.form.title}
        subtitle={isEdit ? (contratanteConfig.form.editSubtitle || contratanteConfig.form.subtitle) : contratanteConfig.form.subtitle}
        headerIcon={contratanteConfig.form.headerIcon}
        headerColor={contratanteConfig.form.headerColor}
        sections={getFormSections(selectedContratante)}
        loading={saving}
        isEdit={isEdit}
        onFieldChange={onFieldChange}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Excluir Contratante"
        message="Tem certeza de que deseja excluir este contratante?"
        itemName={selectedContratante ?
          `${selectedContratante.razaoSocial}${selectedContratante.cnpj ? ` (${formatCNPJ(selectedContratante.cnpj)})` : selectedContratante.cpf ? ` (${formatCPF(selectedContratante.cpf)})` : ''}`
          : ''
        }
        onConfirm={onDelete}
        onCancel={onDeleteClose}
        loading={deleting}
      />
    </>
  );
}