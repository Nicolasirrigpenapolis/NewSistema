import { CRUDConfig, FormSection } from '../../types/modal';

export interface CargoFormData {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export const cargoConfig: CRUDConfig<CargoFormData> = {
  entity: {
    name: 'Cargo',
    pluralName: 'Cargos',
    idField: 'id'
  },
  form: {
    title: 'Novo Cargo',
    editTitle: 'Editar Cargo',
    subtitle: 'Preencha os dados do cargo',
    editSubtitle: 'Atualize os dados do cargo',
    headerIcon: 'briefcase',
    headerColor: '#3b82f6',
    defaultValues: {
      nome: '',
      descricao: '',
      ativo: true
    },
    getSections: (item?: CargoFormData): FormSection[] => [
      {
        title: 'Dados do Cargo',
        subtitle: 'Informações básicas',
        icon: 'briefcase',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        columns: 1,
        fields: [
          {
            key: 'nome',
            label: 'Nome do Cargo',
            type: 'text',
            required: true,
            placeholder: 'Digite o nome do cargo'
          },
          {
            key: 'descricao',
            label: 'Descrição',
            type: 'textarea',
            placeholder: 'Descrição opcional do cargo'
          }
        ]
      }
    ]
  },
  view: {
    title: 'Detalhes do Cargo',
    subtitle: 'Visualização completa',
    headerIcon: 'briefcase',
    headerColor: '#3b82f6',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Informações',
        icon: 'info-circle',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        columns: 2,
        fields: [
          { label: 'Nome', value: item.nome },
          { label: 'Status', value: item.ativo ? 'Ativo' : 'Inativo' },
          { label: 'Descrição', value: item.descricao || 'N/A', colSpan: 2 }
        ]
      }
    ]
  }
};
