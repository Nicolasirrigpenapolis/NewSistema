import { CRUDConfig, FormSection } from '../../types/modal';
import { UsuarioFormData } from './UsuarioConfig';

export const createUsuarioConfigWithCargos = (cargos: Array<{ value: number; label: string }>): CRUDConfig<UsuarioFormData> => {
  return {
    entity: {
      name: 'usuario',
      pluralName: 'usuarios',
      idField: 'id'
    },

    view: {
      title: 'Visualizar Usuário',
      subtitle: 'Detalhes completos do usuário do sistema',
      headerIcon: 'users',
      headerColor: 'linear-gradient(to right, #16A34A, #15803D, #166534)',

      getSections: (usuario) => [
        {
          title: 'Identificação',
          subtitle: 'Dados principais do usuário',
          icon: 'user',
          color: '#16A34A',
          bgColor: '#F0FDF4',
          fields: [
            {
              label: 'Nome',
              value: usuario.nome,
              type: 'text',
              colSpan: 2
            },
            {
              label: 'Username',
              value: usuario.username,
              type: 'text',
              colSpan: 1 as const
            },
            {
              label: 'Cargo',
              value: usuario.cargoNome || 'Não atribuído',
              type: 'text',
              colSpan: 1 as const
            },
            {
              label: 'Status',
              value: usuario.ativo ? 'Ativo' : 'Inativo',
              type: 'status',
              colSpan: 1 as const
            }
          ],
          columns: 2 as const
        },
        {
          title: 'Informações do Sistema',
          subtitle: 'Dados de acesso e atividade',
          icon: 'clock',
          color: '#059669',
          bgColor: '#ECFDF5',
          fields: [
            {
              label: 'Data de Criação',
              value: usuario.dataCriacao,
              type: 'date',
              colSpan: 1 as const
            },
            {
              label: 'Último Login',
              value: usuario.ultimoLogin || 'Nunca',
              type: 'text',
              colSpan: 1 as const
            }
          ],
          columns: 2 as const
        }
      ]
    },

    form: {
      title: 'Usuário',
      subtitle: 'Preencha os dados do usuário',
      headerIcon: 'users',
      headerColor: 'linear-gradient(to right, #16A34A, #15803D, #166534)',

      getSections: (usuario): FormSection[] => {
        // Determinar se é edição ou criação
        const isEdit = !!usuario?.id;

        return [
          {
            title: 'Dados Básicos',
            subtitle: 'Informações principais do usuário',
            icon: 'user',
            color: '#16A34A',
            bgColor: '#F0FDF4',
            fields: [
              {
                key: 'nome',
                label: 'Nome',
                type: 'text' as const,
                placeholder: 'Digite o nome completo',
                required: true,
                colSpan: 2 as const,
                icon: 'user'
              },
              {
                key: 'username',
                label: 'Username',
                type: 'text' as const,
                placeholder: 'Digite o username único',
                required: true,
                colSpan: 1 as const,
                icon: 'at',
                validation: (value) => {
                  if (!value) return 'Username é obrigatório';
                  if (value.length < 3) return 'Username deve ter pelo menos 3 caracteres';
                  if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username deve conter apenas letras, números e _';
                  return null;
                }
              },
              {
                key: 'cargoId',
                label: 'Cargo',
                type: 'select' as const,
                placeholder: 'Selecione o cargo',
                required: true,
                colSpan: 1 as const,
                icon: 'briefcase',
                options: cargos,
                validation: (value) => {
                  if (!value) return 'Cargo é obrigatório';
                  return null;
                }
              },
              // Campo "Usuário Ativo" só aparece na edição
              ...(isEdit ? [{
                key: 'ativo' as const,
                label: 'Usuário Ativo',
                type: 'checkbox' as const,
                colSpan: 2 as const
              }] : [])
            ],
            columns: 2 as const
          },
          {
            title: 'Segurança',
            subtitle: isEdit
              ? 'Defina uma senha segura (deixe em branco para manter atual)'
              : 'Defina uma senha segura para o novo usuário',
            icon: 'lock',
            color: '#059669',
            bgColor: '#ECFDF5',
            fields: [
              {
                key: 'password',
                label: 'Senha',
                type: 'password' as const,
                placeholder: 'Digite uma senha segura',
                required: !isEdit, // Senha obrigatória na criação, opcional na edição
                colSpan: 2 as const,
                icon: 'key',
                validation: (value) => {
                  // Na criação, senha é obrigatória
                  if (!isEdit && !value) return 'Senha é obrigatória';
                  // Se informar senha, deve ter pelo menos 6 caracteres
                  if (value && value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
                  return null;
                }
              }
            ],
            columns: 1 as const
          }
        ];
      },

      defaultValues: {
        nome: '',
        username: '',
        password: '',
        cargoId: undefined,
        ativo: true
      },

      validate: (data) => {
        const errors: Record<string, string> = {};

        if (!data.nome?.trim()) {
          errors.nome = 'Nome é obrigatório';
        }

        if (!data.username?.trim()) {
          errors.username = 'Username é obrigatório';
        } else if (data.username.length < 3) {
          errors.username = 'Username deve ter pelo menos 3 caracteres';
        } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
          errors.username = 'Username deve conter apenas letras, números e _';
        }

        if (!data.cargoId) {
          errors.cargoId = 'Cargo é obrigatório';
        }

        return errors;
      }
    }
  };
};
