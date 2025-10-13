import { CRUDConfig, FormSection } from '../../types/modal';

export interface SeguradoraFormData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  apolice?: string;
  ativo?: boolean;
}

export const seguradoraConfig: CRUDConfig<SeguradoraFormData> = {
  entity: {
    name: 'Seguradora',
    pluralName: 'Seguradoras',
    idField: 'id'
  },
  form: {
    title: 'Nova Seguradora',
    editTitle: 'Editar Seguradora',
    subtitle: 'Cadastre uma nova seguradora',
    editSubtitle: 'Atualize os dados da seguradora',
    headerIcon: 'shield-alt',
    headerColor: '#10b981',
    defaultValues: {
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      apolice: '',
      ativo: true
    },
    getSections: (item?: SeguradoraFormData): FormSection[] => [
      {
        title: 'Dados da Seguradora',
        subtitle: 'Informações principais',
        icon: 'shield-alt',
        color: '#10b981',
        bgColor: '#d1fae5',
        columns: 2,
        fields: [
          {
            key: 'cnpj',
            label: 'CNPJ',
            type: 'text',
            required: true,
            placeholder: '00.000.000/0000-00'
          },
          {
            key: 'razaoSocial',
            label: 'Razão Social',
            type: 'text',
            required: true,
            placeholder: 'Nome da seguradora',
            colSpan: 2
          },
          {
            key: 'nomeFantasia',
            label: 'Nome Fantasia',
            type: 'text',
            placeholder: 'Nome fantasia',
            colSpan: 2
          },
          {
            key: 'apolice',
            label: 'Apólice',
            type: 'text',
            placeholder: 'Número da apólice',
            colSpan: 2
          }
        ]
      }
    ]
  },
  view: {
    title: 'Detalhes da Seguradora',
    subtitle: 'Visualização completa',
    headerIcon: 'shield-alt',
    headerColor: '#10b981',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Informações da Seguradora',
        icon: 'shield-alt',
        color: '#10b981',
        bgColor: '#d1fae5',
        columns: 2,
        fields: [
          { label: 'CNPJ', value: item.cnpj },
          { label: 'Razão Social', value: item.razaoSocial, colSpan: 2 },
          { label: 'Nome Fantasia', value: item.nomeFantasia || 'N/A', colSpan: 2 },
          { label: 'Apólice', value: item.apolice || 'N/A' },
          { label: 'Status', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      }
    ]
  }
};
