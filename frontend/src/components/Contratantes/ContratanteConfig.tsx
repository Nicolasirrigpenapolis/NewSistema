import { CRUDConfig, FormSection } from '../../types/modal';

export const contratanteConfig: CRUDConfig<any> = {
  entity: {
    name: 'Contratante',
    pluralName: 'Contratantes',
    idField: 'id'
  },
  form: {
    title: 'Novo Contratante',
    editTitle: 'Editar Contratante',
    subtitle: 'Cadastre um novo contratante',
    editSubtitle: 'Atualize os dados do contratante',
    headerIcon: 'building',
    headerColor: '#8b5cf6',
    defaultValues: {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      cpf: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      codMunicipio: 0,
      municipio: '',
      cep: '',
      uf: '',
      ativo: true
    },
    getSections: (item?: any): FormSection[] => [
      {
        title: 'Identificação',
        subtitle: 'Dados principais',
        icon: 'building',
        color: '#8b5cf6',
        bgColor: '#ede9fe',
        columns: 2,
        fields: [
          {
            key: 'razaoSocial',
            label: 'Razão Social',
            type: 'text',
            required: true,
            colSpan: 2
          },
          {
            key: 'nomeFantasia',
            label: 'Nome Fantasia',
            type: 'text',
            colSpan: 2
          },
          {
            key: 'cnpj',
            label: 'CNPJ',
            type: 'text'
          },
          {
            key: 'cpf',
            label: 'CPF',
            type: 'text'
          }
        ]
      },
      {
        title: 'Endereço',
        subtitle: 'Localização',
        icon: 'map-marker-alt',
        color: '#8b5cf6',
        bgColor: '#ede9fe',
        columns: 2,
        fields: [
          {
            key: 'cep',
            label: 'CEP',
            type: 'text',
            required: true
          },
          {
            key: 'uf',
            label: 'UF',
            type: 'text',
            required: true
          },
          {
            key: 'municipio',
            label: 'Município',
            type: 'text',
            required: true,
            colSpan: 2
          },
          {
            key: 'endereco',
            label: 'Endereço',
            type: 'text',
            required: true,
            colSpan: 2
          },
          {
            key: 'numero',
            label: 'Número',
            type: 'text'
          },
          {
            key: 'complemento',
            label: 'Complemento',
            type: 'text'
          },
          {
            key: 'bairro',
            label: 'Bairro',
            type: 'text',
            required: true,
            colSpan: 2
          }
        ]
      }
    ]
  },
  view: {
    title: 'Detalhes do Contratante',
    subtitle: 'Visualização completa',
    headerIcon: 'building',
    headerColor: '#8b5cf6',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Identificação',
        icon: 'building',
        color: '#8b5cf6',
        bgColor: '#ede9fe',
        columns: 2,
        fields: [
          { label: 'Razão Social', value: item.razaoSocial, colSpan: 2 },
          { label: 'Nome Fantasia', value: item.nomeFantasia || 'N/A', colSpan: 2 },
          { label: 'CNPJ', value: item.cnpj || 'N/A' },
          { label: 'CPF', value: item.cpf || 'N/A' }
        ]
      },
      {
        title: 'Endereço',
        icon: 'map-marker-alt',
        color: '#8b5cf6',
        bgColor: '#ede9fe',
        columns: 2,
        fields: [
          { label: 'CEP', value: item.cep },
          { label: 'UF', value: item.uf },
          { label: 'Município', value: item.municipio, colSpan: 2 },
          { label: 'Endereço', value: `${item.endereco}, ${item.numero}`, colSpan: 2 },
          { label: 'Bairro', value: item.bairro, colSpan: 2 }
        ]
      }
    ]
  }
};
