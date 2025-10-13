import { CRUDConfig, FormSection } from '../../types/modal';

export interface UsuarioFormData {
  nome: string;
  email?: string;
  username?: string;
  password?: string;
  cargoId?: number;
  ativo?: boolean;
}

export function createUsuarioConfigWithCargos(cargosOptions: Array<{ value: number; label: string }>): CRUDConfig<UsuarioFormData> {
  return {
    entity: {
      name: 'Usuário',
      pluralName: 'Usuários',
      idField: 'id'
    },
    form: {
      title: 'Novo Usuário',
      editTitle: 'Editar Usuário',
      subtitle: 'Cadastre um novo usuário do sistema',
      editSubtitle: 'Atualize os dados do usuário',
      headerIcon: 'user',
      headerColor: '#3b82f6',
      defaultValues: {
        nome: '',
        email: '',
        username: '',
        password: '',
        cargoId: undefined,
        ativo: true
      },
      getSections: (item?: UsuarioFormData): FormSection[] => [
      {
        title: 'Dados do Usuário',
        subtitle: 'Informações pessoais',
        icon: 'user',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        columns: 2,
        fields: [
          {
            key: 'nome',
            label: 'Nome Completo',
            type: 'text',
            required: true,
            placeholder: 'Digite o nome completo',
            colSpan: 2
          },
          {
            key: 'email',
            label: 'E-mail',
            type: 'text',
            required: true,
            placeholder: 'usuario@exemplo.com'
          },
          {
            key: 'username',
            label: 'Nome de Usuário',
            type: 'text',
            required: true,
            placeholder: 'username'
          }
        ]
      },
      {
        title: 'Autenticação',
        subtitle: 'Credenciais de acesso',
        icon: 'lock',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        columns: 2,
        fields: [
          {
            key: 'password',
            label: item ? 'Nova Senha (deixe em branco para manter)' : 'Senha',
            type: 'password',
            required: !item,
            placeholder: '••••••••'
          },
          {
            key: 'cargoId',
            label: 'Cargo',
            type: 'select',
            options: cargosOptions
          }
        ]
      }
    ]
  },
  view: {
    title: 'Detalhes do Usuário',
    subtitle: 'Visualização completa',
    headerIcon: 'user',
    headerColor: '#3b82f6',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Informações do Usuário',
        icon: 'user',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        columns: 2,
        fields: [
          { label: 'Nome', value: item.nome, colSpan: 2 },
          { label: 'E-mail', value: item.email },
          { label: 'Username', value: item.username },
          { label: 'Cargo', value: item.cargo?.nome || 'N/A' },
          { label: 'Status', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      }
    ]
  }
  };
}

export const usuarioConfigWithCargos = createUsuarioConfigWithCargos([]);
