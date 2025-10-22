import { CRUDConfig, FormSection } from '../../types/modal';

export const emitenteConfig: CRUDConfig<any> = {
  entity: {
    name: 'Emitente',
    pluralName: 'Emitentes',
    idField: 'id'
  },
  form: {
    title: 'Novo Emitente',
    editTitle: 'Editar Emitente',
    subtitle: 'Cadastre uma nova empresa emitente',
    editSubtitle: 'Atualize os dados da empresa',
  headerIcon: 'building',
  headerColor: '#f43f5e',
    defaultValues: {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      cpf: '',
      inscricaoEstadual: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      municipio: '',
      uf: '',
      cep: '',
      telefone: '',
      email: '',
      ativo: true
    },
    getSections: (item?: any): FormSection[] => [
      {
        title: 'Identificação',
        subtitle: 'Dados da empresa',
  icon: 'building',
  color: '#f43f5e',
  bgColor: '#ffe4e6',
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
            type: 'text',
            placeholder: '00.000.000/0000-00'
          },
          {
            key: 'inscricaoEstadual',
            label: 'Inscrição Estadual',
            type: 'text'
          }
        ]
      },
      {
        title: 'Endereço',
        subtitle: 'Localização',
  icon: 'map-marker-alt',
  color: '#f43f5e',
  bgColor: '#fecdd3',
        columns: 2,
        fields: [
          {
            key: 'cep',
            label: 'CEP',
            type: 'text',
            mask: 'cep',
            required: true,
            placeholder: '00000-000'
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
            key: 'bairro',
            label: 'Bairro',
            type: 'text',
            required: true
          }
        ]
      },
      {
        title: 'Contato',
        subtitle: 'Informações de contato',
  icon: 'phone',
  color: '#f43f5e',
  bgColor: '#fecdd3',
        columns: 2,
        fields: [
          {
            key: 'telefone',
            label: 'Telefone',
            type: 'text',
            mask: 'telefone',
            placeholder: '(00) 00000-0000'
          },
          {
            key: 'email',
            label: 'E-mail',
            type: 'email'
          }
        ]
      }
    ]
  },
  view: {
    title: 'Detalhes do Emitente',
    subtitle: 'Visualização completa',
  headerIcon: 'building',
  headerColor: '#f43f5e',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Identificação',
  icon: 'building',
  color: '#f43f5e',
  bgColor: '#ffe4e6',
        columns: 2,
        fields: [
          { label: 'Razão Social', value: item.razaoSocial, colSpan: 2 },
          { label: 'Nome Fantasia', value: item.nomeFantasia || 'N/A', colSpan: 2 },
          { label: 'CNPJ', value: item.cnpj || 'N/A' },
          { label: 'IE', value: item.inscricaoEstadual || 'N/A' }
        ]
      },
      {
        title: 'Endereço',
  icon: 'map-marker-alt',
  color: '#f43f5e',
  bgColor: '#fecdd3',
        columns: 2,
        fields: [
          { label: 'CEP', value: item.cep },
          { label: 'UF', value: item.uf },
          { label: 'Município', value: item.municipio, colSpan: 2 },
          { label: 'Endereço', value: `${item.endereco}, ${item.numero}`, colSpan: 2 },
          { label: 'Bairro', value: item.bairro }
        ]
      },
      {
        title: 'Contato',
  icon: 'phone',
  color: '#f43f5e',
  bgColor: '#fecdd3',
        columns: 2,
        fields: [
          { label: 'Telefone', value: item.telefone || 'N/A' },
          { label: 'E-mail', value: item.email || 'N/A' }
        ]
      }
    ]
  }
};
