import React from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { emitenteConfig } from './EmitenteConfig';
import { formatCNPJ, formatCPF } from '../../utils/formatters';

interface Emitente {
  id?: number;
  cnpj?: string;
  cpf?: string;
  ie?: string;
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
  tipoEmitente: string;
  caminhoSalvarXml?: string;
  rntrc?: string;
  caminhoLogotipo?: string;
  caminhoCertificadoDigital?: string;
  senhaCertificadoDigital?: string;
}

interface EmitenteCRUDProps {
  // Modais
  viewModalOpen: boolean;
  formModalOpen: boolean;
  deleteModalOpen: boolean;

  // Dados
  selectedEmitente: Emitente | null;
  isEdit: boolean;

  // Callbacks
  onViewClose: () => void;
  onFormClose: () => void;
  onDeleteClose: () => void;
  onSave: (data: Emitente) => Promise<void>;
  onEdit: (emitente: Emitente) => void;
  onDelete: () => Promise<void>;
  onCNPJDataFetch?: (data: any) => void;

  // Estados
  saving?: boolean;
  deleting?: boolean;
}

export function EmitenteCRUD({
  viewModalOpen,
  formModalOpen,
  deleteModalOpen,
  selectedEmitente,
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
}: EmitenteCRUDProps) {

  // Configurar aÃ§Ãµes do modal de visualizaÃ§Ã£o
  const viewActions = selectedEmitente ? [
    {
      label: 'Editar Emitente',
      icon: 'edit',
      variant: 'warning' as const,
      onClick: () => {
        onViewClose();
        onEdit(selectedEmitente);
      }
    }
  ] : [];

  // Configurar seÃ§Ãµes do formulÃ¡rio com callback de CNPJ
  const getFormSections = (item?: Emitente) => {
    const sections = emitenteConfig.form.getSections(item);

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
      {/* Modal de VisualizaÃ§Ã£o */}
      <GenericViewModal
        isOpen={viewModalOpen}
        onClose={onViewClose}
        item={selectedEmitente}
        title={emitenteConfig.view.title}
        subtitle={emitenteConfig.view.subtitle}
        headerIcon={emitenteConfig.view.headerIcon}
        headerColor={emitenteConfig.view.headerColor}
        sections={selectedEmitente ? emitenteConfig.view.getSections(selectedEmitente) : []}
        actions={viewActions}
        statusConfig={selectedEmitente ? emitenteConfig.view.getStatusConfig?.(selectedEmitente) : undefined}
        idField={emitenteConfig.view.idField}
      />

      {/* Modal de CriaÃ§Ã£o/EdiÃ§Ã£o */}
      <GenericFormModal
        isOpen={formModalOpen}
        onClose={onFormClose}
        onSave={onSave}
        item={selectedEmitente}
        title={isEdit ? (emitenteConfig.form.editTitle || emitenteConfig.form.title) : emitenteConfig.form.title}
        subtitle={isEdit ? (emitenteConfig.form.editSubtitle || emitenteConfig.form.subtitle) : emitenteConfig.form.subtitle}
        headerIcon={emitenteConfig.form.headerIcon}
        headerColor={emitenteConfig.form.headerColor}
        sections={getFormSections(selectedEmitente)}
        loading={saving}
        isEdit={isEdit}
      />

      {/* Modal de ConfirmaÃ§Ã£o de ExclusÃ£o */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Excluir Emitente"
        message="Tem certeza de que deseja excluir este emitente?"
        itemName={selectedEmitente ?
          `${selectedEmitente.razaoSocial}${selectedEmitente.cnpj ? ` (${formatCNPJ(selectedEmitente.cnpj)})` : selectedEmitente.cpf ? ` (${formatCPF(selectedEmitente.cpf)})` : ''}`
          : ''
        }
        onConfirm={onDelete}
        onCancel={onDeleteClose}
        loading={deleting}
      />
    </>
  );
}

