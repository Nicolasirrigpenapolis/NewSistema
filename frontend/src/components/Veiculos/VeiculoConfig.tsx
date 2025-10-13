import { CRUDConfig, FormSection } from '../../types/modal';

export const veiculoConfig: CRUDConfig<any> = {
  entity: {
    name: 'Veículo',
    pluralName: 'Veículos',
    idField: 'id'
  },
  form: {
    title: 'Novo Veículo',
    editTitle: 'Editar Veículo',
    subtitle: 'Cadastre um novo veículo',
    editSubtitle: 'Atualize os dados do veículo',
    headerIcon: 'truck',
    headerColor: '#f59e0b',
    defaultValues: {
      placa: '',
      marca: '',
      tara: 0,
      tipoRodado: '',
      tipoCarroceria: '',
      uf: '',
      ativo: true
    },
    getSections: (item?: any): FormSection[] => [
      {
        title: 'Dados do Veículo',
        subtitle: 'Informações principais',
        icon: 'truck',
        color: '#f59e0b',
        bgColor: '#fef3c7',
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
            key: 'marca',
            label: 'Marca',
            type: 'text',
            placeholder: 'Ex: Volvo, Scania'
          },
          {
            key: 'tara',
            label: 'Tara (kg)',
            type: 'number',
            required: true
          },
          {
            key: 'uf',
            label: 'UF',
            type: 'text',
            required: true,
            placeholder: 'SP'
          },
          {
            key: 'tipoRodado',
            label: 'Tipo de Rodado',
            type: 'text',
            colSpan: 2
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
    title: 'Detalhes do Veículo',
    subtitle: 'Visualização completa',
    headerIcon: 'truck',
    headerColor: '#f59e0b',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Informações do Veículo',
        icon: 'truck',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        columns: 2,
        fields: [
          { label: 'Placa', value: item.placa },
          { label: 'Marca', value: item.marca || 'N/A' },
          { label: 'Tara', value: `${item.tara} kg` },
          { label: 'UF', value: item.uf },
          { label: 'Tipo de Rodado', value: item.tipoRodado || 'N/A' },
          { label: 'Tipo de Carroceria', value: item.tipoCarroceria || 'N/A' },
          { label: 'Status', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      }
    ]
  }
};
