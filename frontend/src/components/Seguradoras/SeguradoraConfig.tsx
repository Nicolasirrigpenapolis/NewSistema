import { CRUDConfig } from '../../types/modal';
import { formatCNPJ } from '../../utils/formatters';

export interface SeguradoraFormData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  apolice?: string;
  ativo?: boolean;
}

export const seguradoraConfig: CRUDConfig<SeguradoraFormData> = {
  entity: {
    name: 'seguradora',
    pluralName: 'seguradoras',
    idField: 'id'
  },

  view: {
    title: 'Visualizar Seguradora',
    subtitle: 'Detalhes completos da seguradora',
    headerIcon: 'shield-alt',
    headerColor: 'linear-gradient(to right, #0d9488, #0891b2)',

    getSections: (seguradora) => [
      {
        title: 'Dados Principais',
        subtitle: 'Informações da seguradora',
        icon: 'shield-alt',
        color: '#0d9488',
        bgColor: '#FFFBEB',
        fields: [
          {
            label: 'CNPJ',
            value: seguradora.cnpj ? formatCNPJ(seguradora.cnpj) : undefined,
            type: 'text'
          },
          {
            label: 'Razão Social',
            value: seguradora.razaoSocial,
            type: 'text'
          },
          {
            label: 'Nome Fantasia',
            value: seguradora.nomeFantasia,
            type: 'text',
            show: !!seguradora.nomeFantasia
          },
          {
            label: 'Apólice',
            value: seguradora.apolice,
            type: 'text',
            show: !!seguradora.apolice
          }
        ]
      }
    ],

    getStatusConfig: (seguradora) => ({
      value: seguradora.ativo ? 'Ativa' : 'Inativa',
      color: seguradora.ativo ? '#059669' : '#DC2626',
      bgColor: seguradora.ativo ? '#ECFDF5' : '#FEF2F2',
      textColor: seguradora.ativo ? '#065F46' : '#991B1B'
    }),

    idField: 'id'
  },

  form: {
    title: 'Nova Seguradora',
    editTitle: 'Editar Seguradora',
    subtitle: 'Cadastre uma nova seguradora',
    editSubtitle: 'Edite os dados da seguradora',
    headerIcon: 'shield-alt',
    headerColor: 'linear-gradient(to right, #0d9488, #0891b2)',

    getSections: (seguradora) => [
      {
        title: 'Dados Principais',
        subtitle: 'Informações da seguradora',
        icon: 'shield-alt',
        color: '#0d9488',
        bgColor: '#FFFBEB',
        fields: [
          {
            key: 'cnpj',
            label: 'CNPJ',
            type: 'cnpj',
            required: true,
            placeholder: '00.000.000/0000-00',
            autoFetch: true,
            validation: (value) => {
              if (!value) return 'CNPJ é obrigatório';
              const cnpjLimpo = value.replace(/\D/g, '');
              return cnpjLimpo.length === 14 ? null : 'CNPJ deve ter 14 dígitos';
            }
          },
          {
            key: 'razaoSocial',
            label: 'Razão Social',
            type: 'text',
            required: true,
            placeholder: 'Razão social da seguradora',
            maxLength: 100,
            validation: (value) => {
              if (!value) return 'Razão social é obrigatória';
              if (value.length < 3) return 'Razão social deve ter pelo menos 3 caracteres';
              return null;
            }
          },
          {
            key: 'nomeFantasia',
            label: 'Nome Fantasia',
            type: 'text',
            placeholder: 'Nome fantasia (opcional)',
            maxLength: 100
          },
          {
            key: 'apolice',
            label: 'Apólice',
            type: 'text',
            placeholder: 'Número da apólice (opcional)',
            maxLength: 50
          }
        ]
      }
    ],

    defaultValues: {
      ativo: true
    }
  }
};