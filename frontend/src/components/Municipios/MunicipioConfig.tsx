import { CRUDConfig, FormSection } from '../../types/modal';

export interface MunicipioFormData {
  codigo: string | number;
  nome: string;
  uf: string;
  ativo?: boolean;
}

const estados = [
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
];

export const municipioConfig: CRUDConfig<MunicipioFormData> = {
  entity: {
    name: 'Município',
    pluralName: 'Municípios',
    idField: 'id'
  },
  form: {
    title: 'Cadastrar Novo Município',
    editTitle: 'Editar Informações do Município',
    subtitle: 'Preencha os dados oficiais para disponibilizar o município no sistema',
    editSubtitle: 'Atualize os dados cadastrais do município selecionado',
    headerIcon: 'map',
    headerColor: '#65a30d',
    defaultValues: {
      codigo: '',
      nome: '',
      uf: '',
      ativo: true
    },
    getSections: (item?: MunicipioFormData): FormSection[] => [
      {
        title: 'Dados de Identificação',
        subtitle: 'Informações oficiais conforme cadastro do IBGE',
        color: '#65a30d',
        bgColor: '#ecfccb',
        columns: 2,
        fields: [
          {
            key: 'codigo',
            label: 'Código IBGE',
            type: 'text',
            required: true,
            maxLength: 7,
            placeholder: 'Ex: 3550308',
            hint: 'Informe o código IBGE com 7 dígitos numéricos.',
            disabled: Boolean(item?.codigo)
          },
          {
            key: 'nome',
            label: 'Nome do Município',
            type: 'text',
            required: true,
            placeholder: 'Ex: São Paulo',
            colSpan: 2,
            hint: 'Utilize o nome completo, exatamente como consta no cadastro oficial.'
          },
          {
            key: 'uf',
            label: 'Unidade Federativa (UF)',
            type: 'select',
            required: true,
            options: estados,
            hint: 'Escolha o estado federativo ao qual o município pertence.'
          }
        ]
      }
    ]
  },
  view: {
    title: 'Visualização do Município',
    subtitle: 'Detalhes completos das informações cadastradas',
    headerIcon: 'map',
    headerColor: '#65a30d',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Dados de Identificação',
        icon: 'map',
        color: '#65a30d',
        bgColor: '#ecfccb',
        columns: 2,
        fields: [
          { label: 'Código IBGE', value: item.codigo },
          { label: 'Nome do Município', value: item.nome, colSpan: 2 },
          { label: 'Unidade Federativa (UF)', value: item.uf }
        ]
      },
      {
        title: 'Configuração no Sistema',
        icon: 'cog',
        color: '#4d7c0f',
        bgColor: '#d9f99d',
        columns: 2,
        fields: [
          { label: 'Status', value: item.ativo ? 'Ativo' : 'Inativo', colSpan: 2 }
        ]
      }
    ],
    getStatusConfig: (item: any) => ({
      value: item.ativo ? 'Ativo' : 'Inativo',
      color: item.ativo ? '#4d7c0f' : '#b91c1c',
      bgColor: item.ativo ? '#ecfccb' : '#fee2e2',
      textColor: item.ativo ? '#3f6212' : '#7f1d1d',
      icon: item.ativo ? 'check-circle' : 'times-circle'
    })
  }
};
