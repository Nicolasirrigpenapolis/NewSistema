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

export const veiculoConfig: CRUDConfig<any> = {
  entity: {
    name: 'Veículo',
    pluralName: 'Veículos',
    idField: 'id'
  },
  form: {
    title: 'Cadastrar Novo Veículo',
    editTitle: 'Editar Informações do Veículo',
    subtitle: 'Preencha todos os dados necessários para o cadastro do veículo no sistema',
    editSubtitle: 'Altere as informações cadastrais do veículo selecionado',
    headerIcon: 'truck',
    headerColor: '#1e40af',
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
        title: 'Dados de Identificação',
        subtitle: 'Informações de registro e emplacamento do veículo',
        color: '#1e40af',
        bgColor: '#e0e7ff',
        columns: 2,
        fields: [
          {
            key: 'placa',
            label: 'Placa do Veículo',
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
            hint: 'Selecione o estado onde o veículo está registrado'
          },
          {
            key: 'marca',
            label: 'Marca do Veículo',
            type: 'select',
            required: false,
            options: [
              { value: 'AGRALE', label: 'AGRALE' },
              { value: 'CHEVROLET', label: 'CHEVROLET' },
              { value: 'CITROËN', label: 'CITROËN' },
              { value: 'DAF', label: 'DAF' },
              { value: 'FIAT', label: 'FIAT' },
              { value: 'FORD', label: 'FORD' },
              { value: 'HYUNDAI', label: 'HYUNDAI' },
              { value: 'INTERNATIONAL', label: 'INTERNATIONAL' },
              { value: 'IVECO', label: 'IVECO' },
              { value: 'JAC', label: 'JAC' },
              { value: 'MAN', label: 'MAN' },
              { value: 'MERCEDES-BENZ', label: 'MERCEDES-BENZ' },
              { value: 'PEUGEOT', label: 'PEUGEOT' },
              { value: 'RENAULT', label: 'RENAULT' },
              { value: 'SCANIA', label: 'SCANIA' },
              { value: 'VOLKSWAGEN', label: 'VOLKSWAGEN' },
              { value: 'VOLVO', label: 'VOLVO' },
              { value: 'OUTRO', label: 'OUTRO' }
            ],
            colSpan: 2,
            hint: 'Escolha a marca/fabricante do veículo da lista'
          }
        ]
      },
      {
        title: 'Características Técnicas',
        subtitle: 'Especificações técnicas e configuração do veículo',
        color: '#1d4ed8',
        bgColor: '#c7d2fe',
        columns: 2,
        fields: [
          {
            key: 'tara',
            label: 'Tara do Veículo (kg)',
            type: 'number',
            required: true,
            placeholder: '0',
            hint: 'Informe o peso do veículo sem carga (tara) em quilogramas'
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
    title: 'Visualização do Veículo',
    subtitle: 'Detalhes completos das informações cadastradas',
    headerIcon: 'truck',
    headerColor: '#1e40af',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Dados de Identificação',
        icon: 'file-text',
        color: '#1e40af',
        bgColor: '#e0e7ff',
        columns: 2,
        fields: [
          { label: 'Placa do Veículo', value: item.placa },
          { label: 'Estado (UF)', value: item.uf },
          { label: 'Marca', value: item.marca || 'Não informado', colSpan: 2 },
          { label: 'Situação', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      },
      {
        title: 'Características Técnicas',
        icon: 'cog',
        color: '#1d4ed8',
        bgColor: '#c7d2fe',
        columns: 2,
        fields: [
          { label: 'Tara do Veículo', value: `${item.tara.toLocaleString('pt-BR')} kg` },
          { label: 'Tipo de Rodado', value: getTipoRodadoLabel(item.tipoRodado) },
          { label: 'Tipo de Carroceria', value: getTipoCarroceriaLabel(item.tipoCarroceria), colSpan: 2 }
        ]
      }
    ]
  }
};
