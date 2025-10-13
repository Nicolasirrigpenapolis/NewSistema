import { FormSection } from '../../types/modal';

export interface RelatorioDespesasFilter {
  dataInicio?: string;
  dataFim?: string;
  veiculoId?: number;
  condutorId?: number;
  tipoManutencao?: string;
}

export function getRelatorioDespesasFilterSections(options: { tipoDespesaOptions?: Array<{ value: string; label: string }> }): FormSection[] {
  return [
    {
      title: 'Filtros',
      subtitle: 'Defina os critérios do relatório',
      icon: 'filter',
      color: '#6366f1',
      bgColor: '#e0e7ff',
      columns: 2,
      fields: [
        {
          key: 'dataInicio',
          label: 'Data Início',
          type: 'date',
          placeholder: 'dd/mm/aaaa'
        },
        {
          key: 'dataFim',
          label: 'Data Fim',
          type: 'date',
          placeholder: 'dd/mm/aaaa'
        },
        {
          key: 'placa',
          label: 'Placa',
          type: 'text',
          placeholder: 'Buscar por placa'
        },
        {
          key: 'tipoDespesa',
          label: 'Tipo de Despesa',
          type: 'select',
          options: options.tipoDespesaOptions || []
        }
      ]
    }
  ];
}

export const relatorioDespesasFilterConfig = {
  defaultValues: {
    dataInicio: '',
    dataFim: '',
    placa: '',
    tipoDespesa: ''
  },
  getSections: () => getRelatorioDespesasFilterSections({})
};
