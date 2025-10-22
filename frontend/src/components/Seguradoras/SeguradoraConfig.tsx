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
    title: 'Cadastrar Nova Seguradora',
    editTitle: 'Editar Informações da Seguradora',
    subtitle: 'Preencha todos os dados necessários para cadastrar a seguradora no sistema',
    editSubtitle: 'Altere as informações cadastrais da seguradora selecionada',
    headerIcon: 'shield-alt',
    headerColor: '#475569',
    defaultValues: {
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      apolice: '',
      ativo: true
    },
    getSections: (item?: SeguradoraFormData): FormSection[] => [
      {
        title: 'Dados de Identificação',
        subtitle: 'Informações corporativas e cadastrais da seguradora',
        color: '#475569',
        bgColor: '#e2e8f0',
        columns: 2,
        fields: [
          {
            key: 'cnpj',
            label: 'CNPJ da Seguradora',
            type: 'text',
            required: true,
            placeholder: '00.000.000/0000-00',
            hint: 'Informe o CNPJ com 14 dígitos. A máscara é aplicada automaticamente.'
          },
          {
            key: 'razaoSocial',
            label: 'Razão Social',
            type: 'text',
            required: true,
            placeholder: 'Ex: Seguradora Brasil LTDA',
            colSpan: 2,
            hint: 'Utilize o nome jurídico completo como consta no cadastro da SUSEP'
          },
          {
            key: 'nomeFantasia',
            label: 'Nome Fantasia',
            type: 'text',
            placeholder: 'Ex: Brasil Seguros',
            colSpan: 2
          }
        ]
      },
      {
        title: 'Informações da Apólice',
        subtitle: 'Dados contratuais vigentes para cobertura de transporte',
        color: '#334155',
        bgColor: '#cbd5f5',
        columns: 2,
        fields: [
          {
            key: 'apolice',
            label: 'Número da Apólice',
            type: 'text',
            required: true,
            colSpan: 2,
            placeholder: 'Ex: AP-2024-000123',
            hint: 'Informe o número da apólice vigente que cobre o transporte de cargas'
          },
          {
            key: 'ativo',
            label: 'Seguradora ativa no sistema',
            type: 'checkbox',
            colSpan: 2
          }
        ]
      }
    ]
  },
  view: {
    title: 'Visualização da Seguradora',
    subtitle: 'Detalhes completos das informações cadastradas',
    headerIcon: 'shield-alt',
    headerColor: '#475569',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Dados de Identificação',
        icon: 'shield-alt',
        color: '#475569',
        bgColor: '#e2e8f0',
        columns: 2,
        fields: [
          { label: 'CNPJ da Seguradora', value: item.cnpj },
          { label: 'Razão Social', value: item.razaoSocial, colSpan: 2 },
          { label: 'Nome Fantasia', value: item.nomeFantasia || 'Não informado', colSpan: 2 },
          { label: 'Situação', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      },
      {
        title: 'Informações da Apólice',
        icon: 'file-contract',
        color: '#334155',
        bgColor: '#cbd5f5',
        columns: 2,
        fields: [
          { label: 'Número da Apólice', value: item.apolice || 'Não informado', colSpan: 2 }
        ]
      }
    ]
  }
};
