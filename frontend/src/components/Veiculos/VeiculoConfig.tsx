import { CRUDConfig } from '../../types/modal';

interface Veiculo {
  id?: number;
  placa: string;
  marca?: string;
  tara: number;
  tipoRodado: string;
  tipoCarroceria: string;
  uf: string;
  ativo?: boolean;
}

export const veiculoConfig: CRUDConfig<Veiculo> = {
  entity: {
    name: 'veiculo',
    pluralName: 'veiculos',
    idField: 'id'
  },

  view: {
    title: 'Visualizar Veículo',
    subtitle: 'Detalhes do veículo',
    headerIcon: 'truck',
    headerColor: 'linear-gradient(to right, #9333ea, #6366f1)',

    getSections: (veiculo) => [
      {
        title: 'Dados do Veículo',
        subtitle: 'Informações principais',
        icon: 'truck',
        color: '#9333ea',
        bgColor: '#f3e8ff',
        columns: 2,
        fields: [
          {
            label: 'Placa',
            value: veiculo.placa,
            icon: 'id-card'
          },
          {
            label: 'Marca',
            value: veiculo.marca || 'Não informado',
            icon: 'tag'
          },
          {
            label: 'Tara (kg)',
            value: veiculo.tara?.toString() || '0',
            icon: 'weight'
          },
          {
            label: 'UF',
            value: veiculo.uf,
            icon: 'map-marker'
          },
          {
            label: 'Tipo Rodado',
            value: veiculo.tipoRodado,
            icon: 'circle'
          },
          {
            label: 'Tipo Carroceria',
            value: veiculo.tipoCarroceria,
            icon: 'truck'
          },
          {
            label: 'Status',
            value: veiculo.ativo ? 'Ativo' : 'Inativo',
            icon: 'circle',
            type: 'status'
          }
        ]
      }
    ],

    getStatusConfig: (veiculo) => ({
      value: veiculo.ativo ? 'Ativo' : 'Inativo',
      color: veiculo.ativo ? '#059669' : '#dc2626',
      bgColor: veiculo.ativo ? '#dcfce7' : '#fee2e2',
      textColor: veiculo.ativo ? '#166534' : '#991b1b'
    }),

    idField: 'id'
  },

  form: {
    title: 'Novo Veículo',
    editTitle: 'Editar Veículo',
    subtitle: 'Cadastre um novo veículo',
    editSubtitle: 'Atualize as informações do veículo',
    headerIcon: 'truck',
    headerColor: 'linear-gradient(to right, #9333ea, #6366f1)',

    defaultValues: {
      placa: '',
      marca: '',
      tara: 0,
      tipoRodado: '',
      tipoCarroceria: '',
      uf: '',
      ativo: true
    },

    getSections: (item) => [
      {
        title: 'Dados do Veículo',
        subtitle: 'Informações principais',
        icon: 'truck',
        color: '#9333ea',
        bgColor: '#f3e8ff',
        columns: 2,
        fields: [
          {
            key: 'placa',
            label: 'Placa',
            type: 'text',
            icon: 'id-card',
            placeholder: 'ABC-1234',
            required: true,
            maxLength: 8,
            mask: 'AAA-9*99'
          },
          {
            key: 'marca',
            label: 'Marca',
            type: 'text',
            icon: 'tag',
            placeholder: 'Marca do veículo',
            maxLength: 100
          },
          {
            key: 'tara',
            label: 'Tara (kg)',
            type: 'number',
            icon: 'weight',
            placeholder: '5000',
            required: true,
            min: 0
          },
          {
            key: 'uf',
            label: 'UF',
            type: 'select',
            icon: 'map-marker',
            required: true,
            options: [
              { value: '', label: 'Selecione...' },
              { value: 'AC', label: 'AC' },
              { value: 'AL', label: 'AL' },
              { value: 'AP', label: 'AP' },
              { value: 'AM', label: 'AM' },
              { value: 'BA', label: 'BA' },
              { value: 'CE', label: 'CE' },
              { value: 'DF', label: 'DF' },
              { value: 'ES', label: 'ES' },
              { value: 'GO', label: 'GO' },
              { value: 'MA', label: 'MA' },
              { value: 'MT', label: 'MT' },
              { value: 'MS', label: 'MS' },
              { value: 'MG', label: 'MG' },
              { value: 'PA', label: 'PA' },
              { value: 'PB', label: 'PB' },
              { value: 'PR', label: 'PR' },
              { value: 'PE', label: 'PE' },
              { value: 'PI', label: 'PI' },
              { value: 'RJ', label: 'RJ' },
              { value: 'RN', label: 'RN' },
              { value: 'RS', label: 'RS' },
              { value: 'RO', label: 'RO' },
              { value: 'RR', label: 'RR' },
              { value: 'SC', label: 'SC' },
              { value: 'SP', label: 'SP' },
              { value: 'SE', label: 'SE' },
              { value: 'TO', label: 'TO' }
            ]
          },
          {
            key: 'tipoRodado',
            label: 'Tipo Rodado',
            type: 'select',
            icon: 'circle',
            required: true,
            options: [
              { value: '01', label: 'Truck' },
              { value: '02', label: 'Toco' },
              { value: '03', label: 'Cavalo Mecânico' },
              { value: '04', label: 'VAN' },
              { value: '05', label: 'Utilitário' },
              { value: '06', label: 'Outros' }
            ]
          },
          {
            key: 'tipoCarroceria',
            label: 'Tipo Carroceria',
            type: 'select',
            icon: 'truck',
            required: true,
            options: [
              { value: '00', label: 'Não aplicável' },
              { value: '01', label: 'Aberta' },
              { value: '02', label: 'Fechada/Baú' },
              { value: '03', label: 'Granelera' },
              { value: '04', label: 'Porta Container' },
              { value: '05', label: 'Sider' },
              { value: '06', label: 'Outros' }
            ]
          },
          {
            key: 'ativo',
            label: 'Status Ativo',
            type: 'checkbox',
            icon: 'toggle-on',
            placeholder: 'Veículo ativo no sistema',
            show: !!item // Só mostrar no modo de edição
          }
        ]
      }
    ],

    validate: (data) => {
      const errors: Record<string, string> = {};

      if (!data.placa?.trim()) {
        errors.placa = 'Placa é obrigatória';
      }

      if (!data.tara || data.tara <= 0) {
        errors.tara = 'Tara deve ser maior que zero';
      }

      if (!data.tipoRodado?.trim()) {
        errors.tipoRodado = 'Tipo de rodado é obrigatório';
      }

      if (!data.tipoCarroceria?.trim()) {
        errors.tipoCarroceria = 'Tipo de carroceria é obrigatório';
      }

      if (!data.uf?.trim()) {
        errors.uf = 'UF é obrigatória';
      }

      return errors;
    }
  }
};