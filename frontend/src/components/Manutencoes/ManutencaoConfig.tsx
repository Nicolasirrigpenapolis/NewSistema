import { CRUDConfig, FormSection } from '../../types/modal';
import type { ManutencaoPeca } from '../../services/manutencoesService';

export interface ManutencaoFormData {
  veiculoId: number | string;
  dataManutencao: string;
  descricao: string;
  fornecedorId?: number | string;
  valorMaoObra?: number | string;
  valorPecas?: number | string;
  valorTotal?: number | string;
  kmAtual?: number | string;
  proximaRevisaoKm?: number | string;
  observacoes?: string;
  pecas: ManutencaoPeca[];
}

const primaryColor = '#16a34a';
const secondaryColor = '#15803d';
const accentColor = '#166534';

const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00';
  }

  const numericValue = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'));

  if (Number.isNaN(numericValue)) {
    return 'R$ 0,00';
  }

  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

export const manutencaoConfig: CRUDConfig<any> = {
  entity: {
    name: 'Manutenção',
    pluralName: 'Manutenções',
    idField: 'id'
  },
  form: {
    title: 'Registrar Manutenção',
    editTitle: 'Atualizar Manutenção',
    subtitle: 'Organize os serviços realizados na frota e acompanhe custos com clareza.',
    editSubtitle: 'Revise ou complemente as informações da manutenção selecionada.',
    headerIcon: 'wrench',
    headerColor: primaryColor,
    defaultValues: {
      veiculoId: '',
      dataManutencao: '',
      descricao: '',
      fornecedorId: '',
      valorMaoObra: '',
      valorPecas: '',
      valorTotal: '',
      kmAtual: '',
      proximaRevisaoKm: '',
      observacoes: '',
      pecas: []
    },
    getSections: (_item?: ManutencaoFormData): FormSection[] => [
      {
        title: 'Identificação da Manutenção',
        subtitle: 'Escolha o veículo, informe a data e descreva o serviço realizado.',
        color: primaryColor,
        bgColor: '#dcfce7',
        columns: 2,
        fields: [
          {
            key: 'veiculoId',
            label: 'Veículo atendido',
            type: 'select',
            required: true,
            placeholder: 'Selecione o veículo'
          },
          {
            key: 'dataManutencao',
            label: 'Data da manutenção',
            type: 'date',
            required: true
          },
          {
            key: 'descricao',
            label: 'Descrição do serviço',
            type: 'textarea',
            required: true,
            colSpan: 2,
            rows: 3,
            maxLength: 500,
            placeholder: 'Detalhe o que foi executado ou diagnosticado'
          },
          {
            key: 'fornecedorId',
            label: 'Fornecedor responsável',
            type: 'select',
            placeholder: 'Selecione o fornecedor (opcional)'
          }
        ]
      },
      {
        title: 'Custos e Planejamento',
        subtitle: 'Registre investimentos e defina próximos acompanhamentos.',
        color: secondaryColor,
        bgColor: '#bbf7d0',
        columns: 2,
        fields: [
          {
            key: 'valorMaoObra',
            label: 'Valor mão de obra',
            type: 'text',
            mask: 'currency',
            placeholder: 'R$ 0,00',
            hint: 'Informe apenas o custo com mão de obra e serviços'
          },
          {
            key: 'valorPecas',
            label: 'Valor peças (calculado)',
            type: 'text',
            mask: 'currency',
            disabled: true,
            placeholder: 'R$ 0,00',
            hint: 'Valor calculado automaticamente das peças adicionadas abaixo'
          },
          {
            key: 'valorTotal',
            label: 'Valor total (calculado)',
            type: 'text',
            mask: 'currency',
            disabled: true,
            placeholder: 'R$ 0,00',
            hint: 'Soma automática: Mão de obra + Peças'
          },
          {
            key: 'kmAtual',
            label: 'Quilometragem atual',
            type: 'text',
            mask: 'number',
            placeholder: 'Ex: 150.000',
            hint: 'Informe a quilometragem no momento da manutenção'
          },
          {
            key: 'proximaRevisaoKm',
            label: 'Próxima revisão em (km)',
            type: 'text',
            mask: 'number',
            placeholder: 'Ex: 160.000',
            hint: 'Quilometragem planejada para a próxima manutenção'
          },
          {
            key: 'observacoes',
            label: 'Observações internas',
            type: 'textarea',
            colSpan: 2,
            rows: 3,
            maxLength: 1000,
            placeholder: 'Inclua observações relevantes.'
          }
        ]
      },
      {
        title: 'Peças e insumos utilizados',
        subtitle: 'Detalhe os componentes substituídos para consolidar custos.',
        color: accentColor,
        bgColor: '#a7f3d0',
        columns: 1,
        fields: [
          {
            key: 'pecas',
            label: 'Peças aplicadas',
            type: 'custom',
            colSpan: 1
          }
        ]
      }
    ]
  },
  view: {
    title: 'Resumo da Manutenção',
    subtitle: 'Visualize as informações registradas e o histórico de peças aplicadas.',
    headerIcon: 'wrench',
    headerColor: primaryColor,
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Informações básicas',
        icon: '',
        color: primaryColor,
        bgColor: '#dcfce7',
        columns: 2,
        fields: [
          { 
            label: 'Veículo', 
            value: item.veiculoPlaca 
              ? `${item.veiculoPlaca}${item.veiculoMarca ? ` - ${item.veiculoMarca}` : ''}`
              : 'Veículo não identificado'
          },
          { label: 'Data', value: item.dataManutencao ? new Date(item.dataManutencao).toLocaleDateString('pt-BR') : '-' },
          { label: 'Descrição', value: item.descricao, colSpan: 2 },
          { label: 'Fornecedor', value: item.fornecedorNome || 'Não informado' }
        ]
      },
      {
        title: 'Custos e Planejamento',
        icon: '',
        color: secondaryColor,
        bgColor: '#bbf7d0',
        columns: 2,
        fields: [
          { label: 'Mão de obra', value: formatCurrency(item.valorMaoObra) },
          { label: 'Peças', value: formatCurrency(item.valorPecas) },
          { label: 'Total', value: formatCurrency(item.valorTotal), colSpan: 2 },
          { label: 'KM atual', value: item.kmAtual || '-' },
          { label: 'Próxima revisão (km)', value: item.proximaRevisaoKm || '-' },
          { label: 'Observações', value: item.observacoes || 'Sem observações', colSpan: 2 }
        ]
      },
      {
        title: 'Peças utilizadas',
        icon: '',
        color: accentColor,
        bgColor: '#a7f3d0',
        columns: 1,
        fields: [
          {
            label: 'Componentes',
            value: Array.isArray(item.pecas) && item.pecas.length > 0
              ? item.pecas
                  .map((peca: ManutencaoPeca) => `${peca.descricaoPeca} (${peca.quantidade || 0} x ${formatCurrency(peca.valorUnitario)})`)
                  .join(' • ')
              : 'Nenhuma peça cadastrada',
            colSpan: 1
          }
        ]
      }
    ]
  }
};
