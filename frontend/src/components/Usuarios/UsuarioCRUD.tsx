import React, { useMemo } from 'react';
import { GenericViewModal } from '../UI/feedback/GenericViewModal';
import { GenericFormModal } from '../UI/feedback/GenericFormModal';
import { ConfirmDeleteModal } from '../UI/feedback/ConfirmDeleteModal';
import { createUsuarioConfigWithCargos } from './UsuarioConfigWithCargos';
import { UsuarioFormData } from './UsuarioConfig';

interface Usuario {
  id?: number;
  nome: string;
  username?: string;
  cargoId?: number;
  cargoNome?: string;
  ativo?: boolean;
  dataCriacao?: string;
  ultimoLogin?: string;
  password?: string;
}

interface Cargo {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface UsuarioCRUDProps {
  // Modais
  viewModalOpen: boolean;
  formModalOpen: boolean;
  deleteModalOpen: boolean;

  // Dados
  selectedUsuario: Usuario | null;
  isEdit: boolean;
  cargos: Cargo[];

  // Callbacks
  onViewClose: () => void;
  onFormClose: () => void;
  onDeleteClose: () => void;
  onSave: (data: Usuario) => Promise<void>;
  onEdit: (usuario: Usuario) => void;
  onDelete: () => Promise<void>;

  // Estados
  saving?: boolean;
  deleting?: boolean;
}

export function UsuarioCRUD({
  viewModalOpen,
  formModalOpen,
  deleteModalOpen,
  selectedUsuario,
  isEdit,
  cargos,
  onViewClose,
  onFormClose,
  onDeleteClose,
  onSave,
  onEdit,
  onDelete,
  saving = false,
  deleting = false
}: UsuarioCRUDProps) {
  // Criar config dinâmico com os cargos
  const usuarioConfig = useMemo(() => {
    const cargosOptions = cargos
      .filter(c => c.ativo)
      .map(c => ({ value: c.id, label: c.nome }));
    return createUsuarioConfigWithCargos(cargosOptions);
  }, [cargos]);

  const handleSave = async (formData: UsuarioFormData) => {
    const usuarioData: Usuario = {
      ...(isEdit && selectedUsuario?.id ? { id: selectedUsuario.id } : {}),
      nome: formData.nome,
      username: formData.username,
      cargoId: formData.cargoId,
      ativo: formData.ativo ?? true,
      ...(formData.password ? { password: formData.password } : {}),
      ...(isEdit && selectedUsuario ? {
        dataCriacao: selectedUsuario.dataCriacao,
        ultimoLogin: selectedUsuario.ultimoLogin
      } : {})
    };

    await onSave(usuarioData);
  };

  const handleEdit = () => {
    if (selectedUsuario) {
      onEdit(selectedUsuario);
    }
  };

  return (
    <>
      {/* Modal de Visualização */}
      <GenericViewModal
        isOpen={viewModalOpen}
        onClose={onViewClose}
        item={selectedUsuario}
        title={usuarioConfig.view.title}
        subtitle={usuarioConfig.view.subtitle}
        headerIcon={usuarioConfig.view.headerIcon}
        headerColor={usuarioConfig.view.headerColor}
        sections={selectedUsuario ? usuarioConfig.view.getSections(selectedUsuario) : []}
        actions={[{
          label: 'Editar',
          icon: 'edit',
          variant: 'warning' as const,
          onClick: handleEdit
        }]}
      />

      {/* Modal de Formulário */}
      <GenericFormModal
        isOpen={formModalOpen}
        onClose={onFormClose}
        onSave={handleSave}
        item={selectedUsuario}
        isEditing={isEdit}
        title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}
        subtitle={usuarioConfig.form.subtitle}
        headerIcon={usuarioConfig.form.headerIcon}
        headerColor={usuarioConfig.form.headerColor}
        sections={usuarioConfig.form.getSections(selectedUsuario)}
        loading={saving}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onCancel={onDeleteClose}
        onConfirm={onDelete}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${selectedUsuario?.nome}"?`}
        itemName={selectedUsuario?.nome || 'usuário'}
        loading={deleting}
      />
    </>
  );
}