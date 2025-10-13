import { CRUDConfig, FormSection } from '../../types/modal';

export const municipioConfig: CRUDConfig<any> = {
  entity: {
    name: 'Município',
    pluralName: 'Municípios',
    idField: 'codigoIBGE'
  },
  form: {
    title: 'Novo Município',
    editTitle: 'Editar Município',
    subtitle: 'Cadastre um novo município',
    editSubtitle: 'Atualize os dados do município',
    headerIcon: 'map',
    headerColor: '#06b6d4',
    defaultValues: {
      codigoIBGE: '',
      nome: '',
      uf: '',
      ativo: true
    },
    getSections: (item?: any): FormSection[] => [
      {
        title: 'Dados do Município',
        subtitle: 'Informações do IBGE',
        icon: 'map',
        color: '#06b6d4',
        bgColor: '#cffafe',
        columns: 2,
        fields: [
          {
            key: 'codigoIBGE',
            label: 'Código IBGE',
            type: 'text',
            required: true,
            placeholder: '1234567'
          },
          {
            key: 'nome',
            label: 'Nome do Município',
            type: 'text',
            required: true,
            placeholder: 'Digite o nome'
          },
          {
            key: 'uf',
            label: 'UF',
            type: 'text',
            required: true,
            placeholder: 'SP'
          }
        ]
      }
    ]
  },
  view: {
    title: 'Detalhes do Município',
    subtitle: 'Visualização completa',
    headerIcon: 'map',
    headerColor: '#06b6d4',
    idField: 'codigoIBGE',
    getSections: (item: any) => [
      {
        title: 'Informações',
        icon: 'map',
        color: '#06b6d4',
        bgColor: '#cffafe',
        columns: 2,
        fields: [
          { label: 'Código IBGE', value: item.codigoIBGE },
          { label: 'Nome', value: item.nome },
          { label: 'UF', value: item.uf },
          { label: 'Status', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      }
    ]
  }
};
