import { CRUDConfig } from '../../types/modal';

export interface MunicipioFormData {
  codigo: number;
  nome: string;
  uf: string;
  ativo?: boolean;
}

export const municipioConfig: CRUDConfig<MunicipioFormData> = {
  entity: {
    name: 'município',
    pluralName: 'municípios',
    idField: 'id'
  },

  view: {
    title: 'Visualizar Município',
    subtitle: 'Detalhes do município',
    headerIcon: 'map-marker-alt',
    headerColor: 'linear-gradient(to right, #4f46e5, #9333ea)',

    getSections: (municipio) => [
      {
        title: 'Dados do Município',
        subtitle: 'Informações principais',
        icon: 'map-marker-alt',
        color: '#4f46e5',
        bgColor: '#F3E8FF',
        fields: [
          {
            label: 'Código IBGE',
            value: municipio.codigo?.toString(),
            type: 'text'
          },
          {
            label: 'Nome',
            value: municipio.nome,
            type: 'text'
          },
          {
            label: 'UF',
            value: municipio.uf,
            type: 'text'
          }
        ]
      }
    ],

    getStatusConfig: (municipio) => ({
      value: municipio.ativo ? 'Ativo' : 'Inativo',
      color: municipio.ativo ? '#059669' : '#DC2626',
      bgColor: municipio.ativo ? '#ECFDF5' : '#FEF2F2',
      textColor: municipio.ativo ? '#065F46' : '#991B1B'
    }),

    idField: 'id'
  },

  form: {
    title: 'Novo Município',
    editTitle: 'Editar Município',
    subtitle: 'Cadastre um novo município',
    editSubtitle: 'Edite os dados do município',
    headerIcon: 'map-marker-alt',
    headerColor: 'linear-gradient(to right, #4f46e5, #9333ea)',

    getSections: (municipio) => [
      {
        title: 'Dados do Município',
        subtitle: 'Informações principais',
        icon: 'map-marker-alt',
        color: '#4f46e5',
        bgColor: '#F3E8FF',
        fields: [
          {
            key: 'codigo',
            label: 'Código IBGE',
            type: 'number',
            required: true,
            placeholder: '1234567',
            validation: (value) => {
              if (!value) return 'Código IBGE é obrigatório';
              const codigo = Number(value);
              if (codigo < 1000000 || codigo > 9999999) return 'Código deve ter 7 dígitos';
              return null;
            }
          },
          {
            key: 'nome',
            label: 'Nome do Município',
            type: 'text',
            required: true,
            placeholder: 'Nome do município',
            maxLength: 60,
            validation: (value) => {
              if (!value) return 'Nome é obrigatório';
              if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
              return null;
            }
          },
          {
            key: 'uf',
            label: 'UF',
            type: 'select',
            required: true,
            options: [
              { value: 'AC', label: 'Acre' },
              { value: 'AL', label: 'Alagoas' },
              { value: 'AP', label: 'Amapá' },
              { value: 'AM', label: 'Amazonas' },
              { value: 'BA', label: 'Bahia' },
              { value: 'CE', label: 'Ceará' },
              { value: 'DF', label: 'Distrito Federal' },
              { value: 'ES', label: 'Espírito Santo' },
              { value: 'GO', label: 'Goiás' },
              { value: 'MA', label: 'Maranhão' },
              { value: 'MT', label: 'Mato Grosso' },
              { value: 'MS', label: 'Mato Grosso do Sul' },
              { value: 'MG', label: 'Minas Gerais' },
              { value: 'PA', label: 'Pará' },
              { value: 'PB', label: 'Paraíba' },
              { value: 'PR', label: 'Paraná' },
              { value: 'PE', label: 'Pernambuco' },
              { value: 'PI', label: 'Piauí' },
              { value: 'RJ', label: 'Rio de Janeiro' },
              { value: 'RN', label: 'Rio Grande do Norte' },
              { value: 'RS', label: 'Rio Grande do Sul' },
              { value: 'RO', label: 'Rondônia' },
              { value: 'RR', label: 'Roraima' },
              { value: 'SC', label: 'Santa Catarina' },
              { value: 'SP', label: 'São Paulo' },
              { value: 'SE', label: 'Sergipe' },
              { value: 'TO', label: 'Tocantins' }
            ],
            validation: (value) => !value ? 'UF é obrigatória' : null
          }
        ]
      }
    ],

    defaultValues: {
      ativo: true
    }
  }
};