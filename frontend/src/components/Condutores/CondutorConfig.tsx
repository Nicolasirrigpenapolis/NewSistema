import { CRUDConfig } from '../../types/modal';
import { formatCPF } from '../../utils/formatters';

interface Condutor {
  id?: number;
  nome: string;
  cpf: string;
  telefone?: string;
  ativo?: boolean;
}

export const condutorConfig: CRUDConfig<Condutor> = {
  entity: {
    name: 'condutor',
    pluralName: 'condutores',
    idField: 'id'
  },

  view: {
    title: 'Visualizar Condutor',
    subtitle: 'Detalhes do condutor',
    headerIcon: 'user',
    headerColor: 'linear-gradient(to right, #16a34a, #059669)',

    getSections: (condutor) => [
      {
        title: 'Dados Pessoais',
        subtitle: 'Informações do condutor',
        icon: 'id-card',
        color: '#16a34a',
        bgColor: '#dcfce7',
        columns: 1,
        fields: [
          {
            label: 'Nome Completo',
            value: condutor.nome,
            icon: 'user'
          },
          {
            label: 'CPF',
            value: condutor.cpf,
            icon: 'id-card',
            formatter: (value) => value ? formatCPF(value) : 'N/A'
          },
          {
            label: 'Telefone',
            value: condutor.telefone || 'Não informado',
            icon: 'phone'
          },
          {
            label: 'Status',
            value: condutor.ativo ? 'Ativo' : 'Inativo',
            icon: 'circle',
            type: 'status'
          }
        ]
      }
    ],

    getStatusConfig: (condutor) => ({
      value: condutor.ativo ? 'Ativo' : 'Inativo',
      color: condutor.ativo ? '#059669' : '#dc2626',
      bgColor: condutor.ativo ? '#dcfce7' : '#fee2e2',
      textColor: condutor.ativo ? '#166534' : '#991b1b'
    }),

    idField: 'id'
  },

  form: {
    title: 'Novo Condutor',
    editTitle: 'Editar Condutor',
    subtitle: 'Cadastre um novo condutor',
    editSubtitle: 'Atualize as informações do condutor',
    headerIcon: 'user',
    headerColor: 'linear-gradient(to right, #16a34a, #059669)',

    defaultValues: {
      nome: '',
      cpf: '',
      telefone: '',
      ativo: true
    },

    getSections: (item) => [
      {
        title: 'Dados Pessoais',
        subtitle: 'Informações do condutor',
        icon: 'id-card',
        color: '#16a34a',
        bgColor: '#dcfce7',
        columns: 1,
        fields: [
          {
            key: 'nome',
            label: 'Nome Completo',
            type: 'text',
            icon: 'user',
            placeholder: 'Nome completo do condutor',
            required: true,
            maxLength: 100
          },
          {
            key: 'cpf',
            label: 'CPF',
            type: 'cpf',
            icon: 'id-card',
            placeholder: '000.000.000-00',
            required: true,
            validation: (value) => {
              if (!value) return null;
              const cleanCpf = value.replace(/\D/g, '');
              if (cleanCpf.length !== 11) {
                return 'CPF deve ter 11 dígitos';
              }
              return null;
            }
          },
          {
            key: 'telefone',
            label: 'Telefone',
            type: 'telefone',
            icon: 'phone',
            placeholder: '(00) 00000-0000',
            required: false
          },
          {
            key: 'ativo',
            label: 'Status Ativo',
            type: 'checkbox',
            icon: 'toggle-on',
            placeholder: 'Condutor ativo no sistema',
            show: !!item // Só mostrar no modo de edição
          }
        ]
      }
    ],

    validate: (data) => {
      const errors: Record<string, string> = {};

      if (!data.nome?.trim()) {
        errors.nome = 'Nome é obrigatório';
      }

      if (!data.cpf?.trim()) {
        errors.cpf = 'CPF é obrigatório';
      } else {
        const cleanCpf = data.cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11) {
          errors.cpf = 'CPF deve ter 11 dígitos';
        }
      }

      return errors;
    }
  }
};