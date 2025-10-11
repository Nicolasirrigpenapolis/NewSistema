import { CRUDConfig } from '../../types/modal';
import { formatCNPJ, formatCPF, applyMask } from '../../utils/formatters';

interface Emitente {
  id?: number;
  cnpj?: string;
  cpf?: string;
  ie?: string;
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
  tipoEmitente: string;
  caminhoSalvarXml?: string;
  rntrc?: string;
  caminhoCertificadoDigital?: string;
  senhaCertificadoDigital?: string;
  caminhoLogotipo?: string;
}

export const emitenteConfig: CRUDConfig<Emitente> = {
  entity: {
    name: 'emitente',
    pluralName: 'emitentes',
    idField: 'id'
  },

  view: {
    title: 'Visualizar Emitente',
    subtitle: 'Detalhes completos do emitente',
    headerIcon: 'eye',
    headerColor: 'linear-gradient(to right, #2563eb, #4f46e5)',

    getSections: (emitente) => [
      {
        title: 'IdentificaÃ§Ã£o',
        subtitle: 'Dados principais da empresa',
        icon: 'id-card',
        color: '#2563eb',
        bgColor: '#dbeafe',
        fields: [
          {
            label: 'CNPJ',
            value: emitente.cnpj,
            icon: 'building',
            formatter: (value) => value ? formatCNPJ(value) : 'N/A',
            show: !!emitente.cnpj
          },
          {
            label: 'CPF',
            value: emitente.cpf,
            icon: 'user',
            formatter: (value) => value ? formatCPF(value) : 'N/A',
            show: !!emitente.cpf
          },
          {
            label: 'RazÃ£o Social',
            value: emitente.razaoSocial,
            icon: 'file-signature'
          },
          {
            label: 'Nome Fantasia',
            value: emitente.nomeFantasia,
            icon: 'store',
            show: !!emitente.nomeFantasia
          },
          {
            label: 'InscriÃ§Ã£o Estadual',
            value: emitente.ie,
            icon: 'certificate',
            show: !!emitente.ie
          },
          {
            label: 'Tipo de Emitente',
            value: emitente.tipoEmitente === 'PrestadorServico' ? 'Prestador de ServiÃ§o' : 'Entrega PrÃ³pria',
            icon: 'tags',
            type: 'badge'
          }
        ]
      },
      {
        title: 'EndereÃ§o',
        subtitle: 'LocalizaÃ§Ã£o da empresa',
        icon: 'map-marker-alt',
        color: '#2563eb',
        bgColor: '#dcfce7',
        fields: [
          {
            label: 'Logradouro',
            value: emitente.endereco,
            icon: 'road',
            colSpan: 2
          },
          {
            label: 'NÃºmero',
            value: emitente.numero,
            icon: 'hashtag',
            show: !!emitente.numero
          },
          {
            label: 'Bairro',
            value: emitente.bairro,
            icon: 'home'
          },
          {
            label: 'Complemento',
            value: emitente.complemento,
            icon: 'plus',
            show: !!emitente.complemento
          },
          {
            label: 'MunicÃ­pio',
            value: emitente.municipio,
            icon: 'city'
          },
          {
            label: 'CEP',
            value: emitente.cep,
            icon: 'mail-bulk',
            formatter: (value) => value ? applyMask(value, 'cep') : 'N/A'
          },
          {
            label: 'UF',
            value: emitente.uf,
            icon: 'map'
          }
        ]
      },
      {
        title: 'ConfiguraÃ§Ãµes',
        subtitle: 'ConfiguraÃ§Ãµes tÃ©cnicas',
        icon: 'cog',
        color: '#2563eb',
        bgColor: '#ede9fe',
        fields: [
          {
            label: 'RNTRC',
            value: emitente.rntrc,
            icon: 'truck',
            show: !!emitente.rntrc
          },
          {
            label: 'Pasta para Salvar XMLs',
            value: emitente.caminhoSalvarXml,
            icon: 'folder',
            show: !!emitente.caminhoSalvarXml,
            colSpan: 2
          },
          {
            label: 'Certificado Digital',
            value: emitente.caminhoCertificadoDigital,
            icon: 'certificate',
            show: !!emitente.caminhoCertificadoDigital,
            colSpan: 2
          },
          {
            label: 'Senha do Certificado',
            value: emitente.senhaCertificadoDigital,
            icon: 'lock',
            formatter: (value) => value ? '********' : 'Não informado',
            show: !!emitente.senhaCertificadoDigital,
            colSpan: 2
          },
          {
            label: 'Status',
            value: emitente.ativo ? 'Ativo' : 'Inativo',
            icon: 'circle',
            type: 'status'
          }
        ]
      }
    ],

    getStatusConfig: (emitente) => ({
      value: emitente.ativo ? 'Ativo' : 'Inativo',
      color: emitente.ativo ? '#059669' : '#dc2626',
      bgColor: emitente.ativo ? '#dcfce7' : '#fee2e2',
      textColor: emitente.ativo ? '#166534' : '#991b1b'
    }),

    idField: 'id'
  },

  form: {
    title: 'Novo Emitente',
    editTitle: 'Editar Emitente',
    subtitle: 'Cadastre uma nova empresa emissora de MDF-e',
    editSubtitle: 'Atualize as informaÃ§Ãµes do emitente',
    headerIcon: 'building',
    headerColor: 'linear-gradient(to right, #2563eb, #4f46e5)',

    defaultValues: {
      razaoSocial: '',
      endereco: '',
      bairro: '',
      codMunicipio: 0,
      municipio: '',
      cep: '',
      uf: '',
      tipoEmitente: 'PrestadorServico',
      ativo: true,
      caminhoSalvarXml: '',
      rntrc: '',
      caminhoLogotipo: '',
      caminhoCertificadoDigital: '',
      senhaCertificadoDigital: ''
    },

    getSections: (item) => [
      {
        title: 'IdentificaÃ§Ã£o',
        subtitle: 'Dados principais da empresa',
        icon: 'id-card',
        color: '#2563eb',
        bgColor: '#dbeafe',
        fields: [
          {
            key: 'cnpj',
            label: 'CNPJ',
            type: 'cnpj',
            icon: 'building',
            placeholder: '00.000.000/0000-00',
            autoFetch: !item, // SÃ³ buscar dados automaticamente quando for novo cadastro
            onDataFetch: (data) => {
              // Esta funÃ§Ã£o serÃ¡ implementada no componente pai
              console.log('Dados do CNPJ:', data);
            }
          },
          {
            key: 'cpf',
            label: 'CPF (Pessoa FÃ­sica)',
            type: 'cpf',
            icon: 'user',
            placeholder: '000.000.000-00'
          },
          {
            key: 'razaoSocial',
            label: 'RazÃ£o Social',
            type: 'text',
            icon: 'file-signature',
            placeholder: 'Nome completo da empresa',
            required: true,
            maxLength: 100
          },
          {
            key: 'nomeFantasia',
            label: 'Nome Fantasia',
            type: 'text',
            icon: 'store',
            placeholder: 'Nome comercial (opcional)',
            maxLength: 100
          },
          {
            key: 'ie',
            label: 'InscriÃ§Ã£o Estadual',
            type: 'text',
            icon: 'certificate',
            placeholder: 'NÃºmero da InscriÃ§Ã£o Estadual',
            maxLength: 20
          },
          {
            key: 'tipoEmitente',
            label: 'Tipo de Emitente',
            type: 'select',
            icon: 'tags',
            required: true,
            options: [
              { value: 'PrestadorServico', label: 'Prestador de ServiÃ§o' },
              { value: 'EntregaPropria', label: 'Entrega PrÃ³pria' }
            ]
          }
        ]
      },
      {
        title: 'EndereÃ§o',
        subtitle: 'LocalizaÃ§Ã£o da empresa',
        icon: 'map-marker-alt',
        color: '#2563eb',
        bgColor: '#dcfce7',
        columns: 3,
        fields: [
          {
            key: 'endereco',
            label: 'Logradouro',
            type: 'text',
            icon: 'road',
            placeholder: 'Rua, Avenida, etc.',
            required: true,
            colSpan: 2,
            maxLength: 100
          },
          {
            key: 'numero',
            label: 'NÃºmero',
            type: 'text',
            icon: 'hashtag',
            placeholder: '123',
            maxLength: 10
          },
          {
            key: 'bairro',
            label: 'Bairro',
            type: 'text',
            icon: 'home',
            placeholder: 'Nome do bairro',
            required: true,
            maxLength: 60
          },
          {
            key: 'complemento',
            label: 'Complemento',
            type: 'text',
            icon: 'plus',
            placeholder: 'Apt, Sala, Bloco, etc.',
            maxLength: 50
          },
          {
            key: 'municipio',
            label: 'MunicÃ­pio',
            type: 'text',
            icon: 'city',
            placeholder: 'Nome da cidade',
            required: true,
            maxLength: 60
          },
          {
            key: 'cep',
            label: 'CEP',
            type: 'cep',
            icon: 'mail-bulk',
            placeholder: '00000-000',
            required: true
          },
          {
            key: 'uf',
            label: 'UF',
            type: 'select',
            icon: 'map',
            required: true,
            options: [
              { value: 'AC', label: 'Acre' },
              { value: 'AL', label: 'Alagoas' },
              { value: 'AP', label: 'AmapÃ¡' },
              { value: 'AM', label: 'Amazonas' },
              { value: 'BA', label: 'Bahia' },
              { value: 'CE', label: 'CearÃ¡' },
              { value: 'DF', label: 'Distrito Federal' },
              { value: 'ES', label: 'EspÃ­rito Santo' },
              { value: 'GO', label: 'GoiÃ¡s' },
              { value: 'MA', label: 'MaranhÃ£o' },
              { value: 'MT', label: 'Mato Grosso' },
              { value: 'MS', label: 'Mato Grosso do Sul' },
              { value: 'MG', label: 'Minas Gerais' },
              { value: 'PA', label: 'ParÃ¡' },
              { value: 'PB', label: 'ParaÃ­ba' },
              { value: 'PR', label: 'ParanÃ¡' },
              { value: 'PE', label: 'Pernambuco' },
              { value: 'PI', label: 'PiauÃ­' },
              { value: 'RJ', label: 'Rio de Janeiro' },
              { value: 'RN', label: 'Rio Grande do Norte' },
              { value: 'RS', label: 'Rio Grande do Sul' },
              { value: 'RO', label: 'RondÃ´nia' },
              { value: 'RR', label: 'Roraima' },
              { value: 'SC', label: 'Santa Catarina' },
              { value: 'SP', label: 'SÃ£o Paulo' },
              { value: 'SE', label: 'Sergipe' },
              { value: 'TO', label: 'Tocantins' }
            ]
          }
        ]
      },
      {
        title: 'ConfiguraÃ§Ãµes',
        subtitle: 'ConfiguraÃ§Ãµes tÃ©cnicas',
        icon: 'cog',
        color: '#2563eb',
        bgColor: '#ede9fe',
        collapsible: true,
        defaultCollapsed: false,
        fields: [
          {
            key: 'rntrc',
            label: 'RNTRC',
            type: 'text',
            icon: 'truck',
            placeholder: 'Registro Nacional dos Transportadores',
            maxLength: 20
          },
          {
            key: 'caminhoSalvarXml',
            label: 'Pasta para Salvar XMLs',
            type: 'folder' as const,
            icon: 'folder',
            placeholder: 'Selecione onde salvar os XMLs gerados',
            colSpan: 2,
            buttonLabel: 'Buscar Pasta'
          },
          {
            key: 'caminhoCertificadoDigital',
            label: 'Caminho do Certificado Digital',
            type: 'text',
            icon: 'certificate',
            placeholder: 'Ex: C:\\\\Sistemas\\\\certificados\\\\empresa.pfx',
            colSpan: 2
          },
          {
            key: 'senhaCertificadoDigital',
            label: 'Senha do Certificado',
            type: 'password',
            icon: 'lock',
            placeholder: 'Informe a senha do certificado digital',
            colSpan: 2
          },
          {
            key: 'ativo',
            label: 'Status Ativo',
            type: 'checkbox',
            icon: 'toggle-on',
            placeholder: 'Emitente ativo no sistema',
            show: !!item // SÃ³ mostrar no modo de ediÃ§Ã£o
          }
        ]
      }
    ],

    validate: (data) => {
      const errors: Record<string, string> = {};

      if (!data.razaoSocial?.trim()) {
        errors.razaoSocial = 'RazÃ£o Social Ã© obrigatÃ³ria';
      }

      if (!data.endereco?.trim()) {
        errors.endereco = 'EndereÃ§o Ã© obrigatÃ³rio';
      }

      if (!data.bairro?.trim()) {
        errors.bairro = 'Bairro Ã© obrigatÃ³rio';
      }

      if (!data.municipio?.trim()) {
        errors.municipio = 'MunicÃ­pio Ã© obrigatÃ³rio';
      }

      if (!data.cep?.trim()) {
        errors.cep = 'CEP Ã© obrigatÃ³rio';
      }

      if (!data.uf?.trim()) {
        errors.uf = 'UF Ã© obrigatÃ³ria';
      }

      if (!data.tipoEmitente?.trim()) {
        errors.tipoEmitente = 'Tipo de Emitente Ã© obrigatÃ³rio';
      }

      return errors;
    }
  }
};


