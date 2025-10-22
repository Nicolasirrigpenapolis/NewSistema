import { CRUDConfig, FormSection } from '../../types/modal';

// Funções helper para converter códigos em textos descritivos
const getTipoRodadoLabel = (codigo: string | undefined | null): string => {
  if (!codigo) return 'Não informado';
  
  const tipos: Record<string, string> = {
    '01': 'Truck',
    '02': 'Toco',
    '03': 'Cavalo Mecânico',
    '04': 'VAN',
    '05': 'Utilitário',
    '06': 'Outros'
  };
  
  return tipos[codigo] || `Código ${codigo}`;
};

const getTipoCarroceriaLabel = (codigo: string | undefined | null): string => {
  if (!codigo) return 'Não informado';
  
  const tipos: Record<string, string> = {
    '00': 'Não Aplicável',
    '01': 'Aberta',
    '02': 'Fechada/Baú',
    '03': 'Granelera',
    '04': 'Porta Container',
    '05': 'Sider'
  };
  
  return tipos[codigo] || `Código ${codigo}`;
};

export const reboqueConfig: CRUDConfig<any> = {
  entity: {
    name: 'Reboque',
    pluralName: 'Reboques',
    idField: 'id'
  },
  form: {
    title: 'Cadastrar Novo Reboque',
    editTitle: 'Editar Informações do Reboque',
    subtitle: 'Preencha todos os dados necessários para o cadastro do reboque no sistema',
    editSubtitle: 'Altere as informações cadastrais do reboque selecionado',
    headerIcon: 'trailer',
    headerColor: '#b45309',
    defaultValues: {
      placa: '',
      tara: 0,
      tipoRodado: '',
      tipoCarroceria: '',
      uf: '',
      rntrc: '',
      ativo: true
    },
    getSections: (item?: any): FormSection[] => [
      {
        title: 'Dados de Identificação',
        subtitle: 'Informações de registro e emplacamento do reboque',
        color: '#b45309',
        bgColor: '#ffedd5',
        columns: 2,
        fields: [
          {
            key: 'placa',
            label: 'Placa do Reboque',
            type: 'text',
            required: true,
            placeholder: 'ABC1D23',
            maxLength: 7,
            hint: 'Informe a placa no formato Mercosul (ABC1D23) ou formato antigo (ABC1234)'
          },
          {
            key: 'uf',
            label: 'Estado de Registro (UF)',
            type: 'select',
            required: true,
            options: [
              { value: 'AC', label: 'AC - Acre' },
              { value: 'AL', label: 'AL - Alagoas' },
              { value: 'AP', label: 'AP - Amapá' },
              { value: 'AM', label: 'AM - Amazonas' },
              { value: 'BA', label: 'BA - Bahia' },
              { value: 'CE', label: 'CE - Ceará' },
              { value: 'DF', label: 'DF - Distrito Federal' },
              { value: 'ES', label: 'ES - Espírito Santo' },
              { value: 'GO', label: 'GO - Goiás' },
              { value: 'MA', label: 'MA - Maranhão' },
              { value: 'MT', label: 'MT - Mato Grosso' },
              { value: 'MS', label: 'MS - Mato Grosso do Sul' },
              { value: 'MG', label: 'MG - Minas Gerais' },
              { value: 'PA', label: 'PA - Pará' },
              { value: 'PB', label: 'PB - Paraíba' },
              { value: 'PR', label: 'PR - Paraná' },
              { value: 'PE', label: 'PE - Pernambuco' },
              { value: 'PI', label: 'PI - Piauí' },
              { value: 'RJ', label: 'RJ - Rio de Janeiro' },
              { value: 'RN', label: 'RN - Rio Grande do Norte' },
              { value: 'RS', label: 'RS - Rio Grande do Sul' },
              { value: 'RO', label: 'RO - Rondônia' },
              { value: 'RR', label: 'RR - Roraima' },
              { value: 'SC', label: 'SC - Santa Catarina' },
              { value: 'SP', label: 'SP - São Paulo' },
              { value: 'SE', label: 'SE - Sergipe' },
              { value: 'TO', label: 'TO - Tocantins' }
            ],
            hint: 'Selecione o estado onde o reboque está registrado'
          },
          {
            key: 'rntrc',
            label: 'RNTRC (opcional)',
            type: 'text',
            required: false,
            maxLength: 20,
            placeholder: '00000000',
            colSpan: 2,
            hint: 'Informe o Registro Nacional do Transportador Rodoviário de Cargas, se aplicável'
          }
        ]
      },
      {
        title: 'Características Técnicas',
        subtitle: 'Especificações técnicas e configuração do reboque',
        color: '#b45309',
        bgColor: '#fed7aa',
        columns: 2,
        fields: [
          {
            key: 'tara',
            label: 'Tara do Reboque (kg)',
            type: 'number',
            required: true,
            placeholder: '0',
            hint: 'Informe o peso do reboque sem carga (tara) em quilogramas'
          },
          {
            key: 'tipoRodado',
            label: 'Tipo de Rodado',
            type: 'select',
            required: false,
            options: [
              { value: '01', label: '01 - Truck' },
              { value: '02', label: '02 - Toco' },
              { value: '03', label: '03 - Cavalo Mecânico' },
              { value: '04', label: '04 - VAN' },
              { value: '05', label: '05 - Utilitário' },
              { value: '06', label: '06 - Outros' }
            ],
            hint: 'Selecione a configuração de rodado conforme padrão SEFAZ'
          },
          {
            key: 'tipoCarroceria',
            label: 'Tipo de Carroceria',
            type: 'select',
            required: false,
            options: [
              { value: '00', label: '00 - Não Aplicável' },
              { value: '01', label: '01 - Aberta' },
              { value: '02', label: '02 - Fechada/Baú' },
              { value: '03', label: '03 - Granelera' },
              { value: '04', label: '04 - Porta Container' },
              { value: '05', label: '05 - Sider' }
            ],
            colSpan: 2,
            hint: 'Selecione o tipo de carroceria conforme padrão SEFAZ'
          }
        ]
      }
    ]
  },
  view: {
    title: 'Visualização do Reboque',
    subtitle: 'Detalhes completos das informações cadastradas',
    headerIcon: 'trailer',
    headerColor: '#b45309',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Dados de Identificação',
        icon: 'file-text',
        color: '#b45309',
        bgColor: '#ffedd5',
        columns: 2,
        fields: [
          { label: 'Placa do Reboque', value: item.placa },
          { label: 'Estado (UF)', value: item.uf },
          { label: 'RNTRC', value: item.rntrc || 'Não informado', colSpan: 2 },
          { label: 'Situação', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      },
      {
        title: 'Características Técnicas',
        icon: 'cog',
        color: '#b45309',
        bgColor: '#fed7aa',
        columns: 2,
        fields: [
          { label: 'Tara do Reboque', value: `${Number(item.tara || 0).toLocaleString('pt-BR')} kg` },
          { label: 'Tipo de Rodado', value: getTipoRodadoLabel(item.tipoRodado) },
          { label: 'Tipo de Carroceria', value: getTipoCarroceriaLabel(item.tipoCarroceria), colSpan: 2 }
        ]
      }
    ]
  }
};
