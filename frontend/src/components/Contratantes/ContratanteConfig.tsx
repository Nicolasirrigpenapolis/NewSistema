import { CRUDConfig } from '../../types/modal';
import { formatCNPJ, formatCPF } from '../../utils/formatters';

export interface ContratanteFormData {
  cnpj?: string;
  cpf?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  codMunicipio: number;
  municipio: string;
  cep: string;
  uf: string;
  ativo?: boolean;
}

export const contratanteConfig: CRUDConfig<ContratanteFormData> = {
  entity: {
    name: 'contratante',
    pluralName: 'contratantes',
    idField: 'id'
  },

  view: {
    title: 'Visualizar Contratante',
    subtitle: 'Detalhes completos do contratante',
    headerIcon: 'handshake',
    headerColor: 'linear-gradient(to right, #ca8a04, #ea580c)',

    getSections: (contratante) => [
      {
        title: 'Identificação',
        subtitle: 'Dados principais do contratante',
        icon: 'id-card',
        color: '#ca8a04',
        bgColor: '#ECFDF5',
        fields: [
          {
            label: 'CNPJ',
            value: contratante.cnpj ? formatCNPJ(contratante.cnpj) : undefined,
            type: 'text',
            show: !!contratante.cnpj
          },
          {
            label: 'CPF',
            value: contratante.cpf ? formatCPF(contratante.cpf) : undefined,
            type: 'text',
            show: !!contratante.cpf
          },
          {
            label: 'Razão Social / Nome',
            value: contratante.razaoSocial,
            type: 'text'
          },
          {
            label: 'Nome Fantasia',
            value: contratante.nomeFantasia,
            type: 'text',
            show: !!contratante.nomeFantasia
          }
        ]
      },
      {
        title: 'Endereço',
        subtitle: 'Localização do contratante',
        icon: 'map-marker-alt',
        color: '#ca8a04',
        bgColor: '#ECFDF5',
        fields: [
          {
            label: 'CEP',
            value: contratante.cep,
            type: 'text'
          },
          {
            label: 'Endereço',
            value: contratante.endereco,
            type: 'text'
          },
          {
            label: 'Número',
            value: contratante.numero,
            type: 'text',
            show: !!contratante.numero
          },
          {
            label: 'Complemento',
            value: contratante.complemento,
            type: 'text',
            show: !!contratante.complemento
          },
          {
            label: 'Bairro',
            value: contratante.bairro,
            type: 'text'
          },
          {
            label: 'Município',
            value: contratante.municipio,
            type: 'text'
          },
          {
            label: 'UF',
            value: contratante.uf,
            type: 'text'
          }
        ]
      }
    ],

    getStatusConfig: (contratante) => ({
      value: contratante.ativo ? 'Ativo' : 'Inativo',
      color: contratante.ativo ? '#059669' : '#DC2626',
      bgColor: contratante.ativo ? '#ECFDF5' : '#FEF2F2',
      textColor: contratante.ativo ? '#065F46' : '#991B1B'
    }),

    idField: 'id'
  },

  form: {
    title: 'Novo Contratante',
    editTitle: 'Editar Contratante',
    subtitle: 'Cadastre um novo contratante',
    editSubtitle: 'Edite os dados do contratante',
    headerIcon: 'handshake',
    headerColor: 'linear-gradient(to right, #ca8a04, #ea580c)',

    getSections: (contratante) => [
      {
        title: 'Identificação',
        subtitle: 'Dados de identificação',
        icon: 'id-card',
        color: '#ca8a04',
        bgColor: '#ECFDF5',
        fields: [
          {
            key: 'tipoDocumento',
            label: 'Tipo de Documento',
            type: 'select',
            required: true,
            options: [
              { value: 'cnpj', label: 'CNPJ (Pessoa Jurídica)' },
              { value: 'cpf', label: 'CPF (Pessoa Física)' }
            ],
            validation: (value) => !value ? 'Tipo de documento é obrigatório' : null
          },
          {
            key: 'cnpj',
            label: 'CNPJ',
            type: 'cnpj',
            placeholder: '00.000.000/0000-00',
            show: true,
            autoFetch: true,
            conditionalShow: { field: 'tipoDocumento', value: 'cnpj' }
          },
          {
            key: 'cpf',
            label: 'CPF',
            type: 'cpf',
            placeholder: '000.000.000-00',
            show: true,
            conditionalShow: { field: 'tipoDocumento', value: 'cpf' }
          },
          {
            key: 'razaoSocial',
            label: 'Razão Social / Nome',
            type: 'text',
            required: true,
            placeholder: 'Nome completo ou razão social',
            maxLength: 100,
            validation: (value) => {
              if (!value) return 'Nome/Razão social é obrigatório';
              if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
              return null;
            }
          },
          {
            key: 'nomeFantasia',
            label: 'Nome Fantasia',
            type: 'text',
            placeholder: 'Nome fantasia (opcional)',
            maxLength: 100
          }
        ]
      },
      {
        title: 'Endereço',
        subtitle: 'Dados de endereço',
        icon: 'map-marker-alt',
        color: '#ca8a04',
        bgColor: '#ECFDF5',
        fields: [
          {
            key: 'cep',
            label: 'CEP',
            type: 'cep',
            required: true,
            placeholder: '00000-000'
          },
          {
            key: 'endereco',
            label: 'Endereço',
            type: 'text',
            required: true,
            placeholder: 'Logradouro',
            maxLength: 100,
            validation: (value) => !value ? 'Endereço é obrigatório' : null
          },
          {
            key: 'numero',
            label: 'Número',
            type: 'text',
            placeholder: 'Número',
            maxLength: 10
          },
          {
            key: 'complemento',
            label: 'Complemento',
            type: 'text',
            placeholder: 'Complemento (opcional)',
            maxLength: 50
          },
          {
            key: 'bairro',
            label: 'Bairro',
            type: 'text',
            required: true,
            placeholder: 'Bairro',
            maxLength: 60,
            validation: (value) => !value ? 'Bairro é obrigatório' : null
          },
          {
            key: 'uf',
            label: 'UF',
            type: 'text',
            required: true,
            readonly: true,
            validation: (value) => !value ? 'UF é obrigatória' : null
          },
          {
            key: 'municipio',
            label: 'Município',
            type: 'text',
            required: true,
            placeholder: 'Município (preenchido automaticamente)',
            readonly: true,
            validation: (value) => !value ? 'Município é obrigatório' : null
          }
        ]
      }
    ],

    defaultValues: {
      ativo: true,
      codMunicipio: 0,
      municipio: ''
    }
  }
};