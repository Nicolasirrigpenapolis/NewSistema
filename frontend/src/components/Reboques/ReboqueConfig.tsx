import { CRUDConfig } from '../../types/modal';

interface Reboque {
  id?: number;
  placa: string;
  tara: number;
  tipoRodado: string;
  tipoCarroceria: string;
  uf: string;
  rntrc?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataUltimaAlteracao?: string;
}

export const reboqueConfig: CRUDConfig<Reboque> = {
  entity: {
    name: 'reboque',
    pluralName: 'reboques',
    idField: 'id'
  },

  view: {
    title: 'Visualizar Reboque',
    subtitle: 'Detalhes do reboque',
    headerIcon: 'trailer',
    headerColor: 'linear-gradient(to right, #ea580c, #dc2626)',

    getSections: (reboque) => [
      {
        title: 'Dados do Reboque',
        subtitle: 'Informações principais',
        icon: 'trailer',
        color: '#ea580c',
        bgColor: '#fed7aa',
        columns: 2,
        fields: [
          {
            label: 'Placa',
            value: reboque.placa,
            icon: 'id-card'
          },
          {
            label: 'Tara (kg)',
            value: reboque.tara?.toLocaleString() || '0',
            icon: 'weight'
          },
          {
            label: 'UF',
            value: reboque.uf,
            icon: 'map-marker'
          },
          {
            label: 'RNTRC',
            value: reboque.rntrc || 'Não informado',
            icon: 'id-card'
          },
          {
            label: 'Tipo Rodado',
            value: reboque.tipoRodado,
            icon: 'circle'
          },
          {
            label: 'Tipo Carroceria',
            value: reboque.tipoCarroceria,
            icon: 'truck'
          },
          {
            label: 'Status',
            value: reboque.ativo ? 'Ativo' : 'Inativo',
            icon: 'circle',
            type: 'status'
          }
        ]
      }
    ],

    getStatusConfig: (reboque) => ({
      value: reboque.ativo ? 'Ativo' : 'Inativo',
      color: reboque.ativo ? '#059669' : '#dc2626',
      bgColor: reboque.ativo ? '#dcfce7' : '#fee2e2',
      textColor: reboque.ativo ? '#166534' : '#991b1b'
    }),

    idField: 'id'
  },

  form: {
    title: 'Novo Reboque',
    editTitle: 'Editar Reboque',
    subtitle: 'Cadastre um novo reboque',
    editSubtitle: 'Atualize as informações do reboque',
    headerIcon: 'trailer',
    headerColor: 'linear-gradient(to right, #ea580c, #dc2626)',

    defaultValues: {
      placa: '',
      tara: 0,
      tipoRodado: '',
      tipoCarroceria: '',
      uf: '',
      rntrc: '',
      ativo: true
    },

    getSections: (item) => [
      {
        title: 'Dados do Reboque',
        subtitle: 'Informações principais',
        icon: 'trailer',
        color: '#ea580c',
        bgColor: '#fed7aa',
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
            key: 'rntrc',
            label: 'RNTRC',
            type: 'text',
            icon: 'id-card',
            placeholder: '12345678',
            maxLength: 20
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
            placeholder: 'Reboque ativo no sistema',
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