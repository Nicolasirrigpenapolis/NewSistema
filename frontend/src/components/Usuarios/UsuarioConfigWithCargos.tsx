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
      headerColor: '#1d4ed8',
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
          subtitle: 'Informações pessoais e identificação',
          color: '#1d4ed8',
          bgColor: '#dbeafe',
          columns: 2,
          fields: [
            {
              key: 'nome',
              label: 'Nome Completo',
              type: 'text',
              required: true,
              placeholder: 'Ex: João Silva Santos',
              colSpan: 2,
              maxLength: 100,
              hint: 'Nome completo do usuário como deve aparecer no sistema'
            },
            {
              key: 'email',
              label: 'E-mail',
              type: 'text',
              required: true,
              placeholder: 'usuario@empresa.com.br',
              maxLength: 100,
              hint: 'E-mail corporativo para comunicações do sistema'
            },
            {
              key: 'username',
              label: 'Nome de Usuário (Login)',
              type: 'text',
              required: true,
              placeholder: 'joao.silva',
              maxLength: 50,
              hint: 'Username único usado para fazer login no sistema'
            }
          ]
        },
        {
          title: 'Autenticação',
          subtitle: 'Credenciais de acesso e permissões',
          color: '#1d4ed8',
          bgColor: '#dbeafe',
          columns: 2,
          fields: [
            {
              key: 'password',
              label: item ? 'Nova Senha' : 'Senha',
              type: 'password',
              required: !item,
              placeholder: '••••••••',
              maxLength: 100,
              hint: item 
                ? 'Deixe em branco para manter a senha atual' 
                : 'Mínimo 6 caracteres. Recomendamos usar letras, números e símbolos'
            },
            {
              key: 'cargoId',
              label: 'Cargo / Função',
              type: 'select',
              required: true,
              options: cargosOptions,
              hint: 'Define as permissões e nível de acesso do usuário'
            }
          ]
        }
      ]
    },
    view: {
      title: 'Detalhes do Usuário',
      subtitle: 'Visualização completa das informações',
      headerIcon: 'user',
      headerColor: '#1d4ed8',
      idField: 'id',
      getSections: (item: any) => [
        {
          title: 'Informações do Usuário',
          icon: 'user',
          color: '#1d4ed8',
          bgColor: '#dbeafe',
          columns: 2,
          fields: [
            { label: 'Nome Completo', value: item.nome, colSpan: 2 },
            { label: 'E-mail', value: item.email || 'Não informado' },
            { label: 'Username', value: item.username || 'Não informado' },
            { label: 'Cargo', value: item.cargo?.nome || item.cargoNome || 'Não atribuído' },
            { 
              label: 'Status', 
              value: item.ativo || item.ativo === undefined ? '✅ Ativo' : '❌ Inativo' 
            },
            { 
              label: 'Data de Criação', 
              value: item.dataCriacao 
                ? new Date(item.dataCriacao).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Não disponível'
            },
            { 
              label: 'Último Login', 
              value: item.ultimoLogin 
                ? new Date(item.ultimoLogin).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Nunca acessou'
            }
          ]
        }
      ]
    }
  };
}

export const usuarioConfigWithCargos = createUsuarioConfigWithCargos([]);
