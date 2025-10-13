import { CRUDConfig, FormSection } from '../../types/modal';

export const condutorConfig: CRUDConfig<any> = {
  entity: {
    name: 'Condutor',
    pluralName: 'Condutores',
    idField: 'id'
  },
  form: {
    title: 'Novo Condutor',
    editTitle: 'Editar Condutor',
    subtitle: 'Cadastre um novo condutor',
    editSubtitle: 'Atualize os dados do condutor',
    headerIcon: 'user',
    headerColor: '#10b981',
    defaultValues: {
      nome: '',
      cpf: '',
      telefone: '',
      ativo: true
    },
    getSections: (item?: any): FormSection[] => [
      {
        title: 'Dados Pessoais',
        subtitle: 'Informações do condutor',
        icon: 'user',
        color: '#10b981',
        bgColor: '#d1fae5',
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
            key: 'cpf',
            label: 'CPF',
            type: 'text',
            required: true,
            placeholder: '000.000.000-00'
          },
          {
            key: 'telefone',
            label: 'Telefone',
            type: 'text',
            placeholder: '(00) 00000-0000'
          }
        ]
      }
    ]
  },
  view: {
    title: 'Detalhes do Condutor',
    subtitle: 'Visualização completa',
    headerIcon: 'user',
    headerColor: '#10b981',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Informações Pessoais',
        icon: 'user',
        color: '#10b981',
        bgColor: '#d1fae5',
        columns: 2,
        fields: [
          { label: 'Nome', value: item.nome },
          { label: 'CPF', value: item.cpf },
          { label: 'Telefone', value: item.telefone || 'N/A' },
          { label: 'Status', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      }
    ]
  }
};
