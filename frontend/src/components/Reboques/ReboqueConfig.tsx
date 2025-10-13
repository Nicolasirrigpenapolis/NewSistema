import { CRUDConfig, FormSection } from '../../types/modal';

export const reboqueConfig: CRUDConfig<any> = {
  entity: {
    name: 'Reboque',
    pluralName: 'Reboques',
    idField: 'id'
  },
  form: {
    title: 'Novo Reboque',
    editTitle: 'Editar Reboque',
    subtitle: 'Cadastre um novo reboque',
    editSubtitle: 'Atualize os dados do reboque',
    headerIcon: 'trailer',
    headerColor: '#ec4899',
    defaultValues: {
      placa: '',
      tara: 0,
      tipoRodado: '',
      tipoCarroceria: '',
      uf: '',
      ativo: true
    },
    getSections: (item?: any): FormSection[] => [
      {
        title: 'Dados do Reboque',
        subtitle: 'Informações principais',
        icon: 'trailer',
        color: '#ec4899',
        bgColor: '#fce7f3',
        columns: 2,
        fields: [
          {
            key: 'placa',
            label: 'Placa',
            type: 'text',
            required: true,
            placeholder: 'ABC-1234'
          },
          {
            key: 'uf',
            label: 'UF',
            type: 'text',
            required: true,
            placeholder: 'SP'
          },
          {
            key: 'tara',
            label: 'Tara (kg)',
            type: 'number',
            required: true
          },
          {
            key: 'tipoRodado',
            label: 'Tipo de Rodado',
            type: 'text'
          },
          {
            key: 'tipoCarroceria',
            label: 'Tipo de Carroceria',
            type: 'text',
            colSpan: 2
          }
        ]
      }
    ]
  },
  view: {
    title: 'Detalhes do Reboque',
    subtitle: 'Visualização completa',
    headerIcon: 'trailer',
    headerColor: '#ec4899',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Informações do Reboque',
        icon: 'trailer',
        color: '#ec4899',
        bgColor: '#fce7f3',
        columns: 2,
        fields: [
          { label: 'Placa', value: item.placa },
          { label: 'UF', value: item.uf },
          { label: 'Tara', value: `${item.tara} kg` },
          { label: 'Tipo de Rodado', value: item.tipoRodado || 'N/A' },
          { label: 'Tipo de Carroceria', value: item.tipoCarroceria || 'N/A', colSpan: 2 },
          { label: 'Status', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      }
    ]
  }
};
