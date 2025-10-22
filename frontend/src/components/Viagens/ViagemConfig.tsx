import { CRUDConfig, FormSection } from '../../types/modal';
import type { DespesaViagem, ReceitaViagem } from '../../services/viagensService';

export interface ViagemFormData {
  veiculoId: number | string;
  condutorId?: number | string;
  motoristaNome?: string;
  dataInicio: string;
  dataFim: string;
  origemDestino?: string;
  kmInicial?: number | string;
  kmFinal?: number | string;
  observacoes?: string;
  receitas: ReceitaViagem[];
  despesas: DespesaViagem[];
}

const primaryColor = '#f59e0b';
const secondaryColor = '#d97706';
const accentColor = '#92400e';

export const viagemConfig: CRUDConfig<any> = {
  entity: {
    name: 'Viagem',
    pluralName: 'Viagens',
    idField: 'id'
  },
  form: {
    title: 'Nova Viagem',
    editTitle: 'Editar Viagem',
    subtitle: 'Estruture a viagem, registre receitas e despesas e acompanhe o saldo.',
    editSubtitle: 'Revise o planejamento e ajuste lançamentos quando necessário.',
    headerIcon: 'route',
    headerColor: primaryColor,
    defaultValues: {
      veiculoId: '',
      condutorId: '',
      motoristaNome: '',
      dataInicio: new Date(Date.now() - 86400000).toISOString().split('T')[0], // -1 dia (ontem)
      dataFim: new Date().toISOString().split('T')[0], // hoje
      origemDestino: '',
      kmInicial: '',
      kmFinal: '',
      observacoes: '',
      receitas: [],
      despesas: []
    },
    getSections: (_item?: ViagemFormData): FormSection[] => [
      {
        title: 'Planejamento da Viagem',
        subtitle: 'Selecione o veículo, motoristas e período da operação.',
        color: primaryColor,
        bgColor: '#fef3c7',
        columns: 2,
        fields: [
          {
            key: 'veiculoId',
            label: 'Veículo',
            type: 'select',
            required: true,
            placeholder: 'Escolha o veículo da viagem'
          },
          {
            key: 'condutorId',
            label: 'Condutor responsável',
            type: 'select',
            placeholder: 'Selecione o condutor (opcional)'
          },
          {
            key: 'dataInicio',
            label: 'Data início',
            type: 'date',
            required: true
          },
          {
            key: 'dataFim',
            label: 'Data fim',
            type: 'date',
            required: true
          },
          {
            key: 'origemDestino',
            label: 'Origem → Destino',
            type: 'text',
            maxLength: 200,
            placeholder: 'Ex: São Paulo/SP → Curitiba/PR',
            colSpan: 2,
            hint: 'Digite as cidades e estados da rota. Ex: Campinas/SP → Rio de Janeiro/RJ'
          }
        ]
      },
      {
        title: 'Dados Operacionais',
        subtitle: 'Controle de kilometragem e observações importantes.',
        color: secondaryColor,
        bgColor: '#fde68a',
        columns: 2,
        fields: [
          {
            key: 'kmInicial',
            label: 'KM inicial',
            type: 'text',
            mask: 'number',
            placeholder: 'Ex: 150.000',
            hint: 'Quilometragem no odômetro ao iniciar a viagem'
          },
          {
            key: 'kmFinal',
            label: 'KM final',
            type: 'text',
            mask: 'number',
            placeholder: 'Ex: 151.500',
            hint: 'Quilometragem no odômetro ao finalizar a viagem'
          },
          {
            key: 'observacoes',
            label: 'Observações',
            type: 'textarea',
            rows: 3,
            maxLength: 1000,
            colSpan: 2,
            placeholder: 'Anote ocorrências, alertas ou pontos de atenção.'
          }
        ]
      },
      {
        title: 'Lançamentos Financeiros',
        subtitle: 'Registre receitas e despesas da viagem para acompanhar o saldo.',
        color: accentColor,
        bgColor: '#fcd34d',
        columns: 1,
        fields: [
          {
            key: 'receitas',
            label: 'Receitas registradas',
            type: 'custom',
            colSpan: 1
          },
          {
            key: 'despesas',
            label: 'Despesas registradas',
            type: 'custom',
            colSpan: 1
          }
        ]
      }
    ]
  },
  view: {
    title: 'Resumo da Viagem',
    subtitle: 'Visualize o desempenho operacional e financeiro da viagem.',
    headerIcon: 'navigation',
    headerColor: primaryColor,
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Planejamento da Viagem',
        icon: '',
        color: primaryColor,
        bgColor: '#fef3c7',
        columns: 2,
        fields: [
          { label: 'Veículo', value: `${item.veiculoPlaca || ''} ${item.veiculoMarca ? `- ${item.veiculoMarca}` : ''}` },
          { label: 'Motorista', value: item.condutorNome || item.motoristaNome || 'Não informado' },
          { label: 'Período', value: item.dataInicio && item.dataFim ? `${new Date(item.dataInicio).toLocaleDateString('pt-BR')} até ${new Date(item.dataFim).toLocaleDateString('pt-BR')}` : '-' , colSpan: 2 },
          { label: 'Origem/Destino', value: item.origemDestino || 'Não informado', colSpan: 2 }
        ]
      },
      {
        title: 'Dados Operacionais',
        icon: '',
        color: secondaryColor,
        bgColor: '#fde68a',
        columns: 2,
        fields: [
          { label: 'KM inicial', value: item.kmInicial || '-' },
          { label: 'KM final', value: item.kmFinal || '-' },
          { label: 'Observações', value: item.observacoes || 'Sem observações', colSpan: 2 }
        ]
      },
      {
        title: 'Resultados Financeiros',
        icon: 'credit-card',
        color: accentColor,
        bgColor: '#fcd34d',
        columns: 2,
        fields: [
          { label: 'Receita total', value: item.receitaTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00' },
          { label: 'Despesa total', value: item.totalDespesas?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00' },
          { label: 'Saldo líquido', value: item.saldoLiquido?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00', colSpan: 2 }
        ]
      }
    ]
  }
};
