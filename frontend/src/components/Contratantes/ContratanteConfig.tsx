import { CRUDConfig, FormSection } from '../../types/modal';

export const contratanteConfig: CRUDConfig<any> = {
  entity: {
    name: 'Contratante',
    pluralName: 'Contratantes',
    idField: 'id'
  },
  form: {
    title: 'Cadastrar Novo Contratante',
    editTitle: 'Editar Informações do Contratante',
    subtitle: 'Preencha todos os dados essenciais para registrar o contratante no sistema',
    editSubtitle: 'Altere as informações cadastrais do contratante selecionado',
    headerIcon: 'building',
    headerColor: '#dc2626',
    defaultValues: {
      tipoDocumento: 'cnpj',
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      cpf: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      codMunicipio: 0,
      municipio: '',
      cep: '',
      uf: '',
      ativo: true
    },
    getSections: (item?: any): FormSection[] => {
      const tipoDocumento = item?.tipoDocumento || (item?.cnpj ? 'cnpj' : item?.cpf ? 'cpf' : 'cnpj');
      
      return [
      {
        title: 'Dados de Identificação',
    subtitle: 'Informações jurídicas e fiscais do contratante',
    color: '#dc2626',
    bgColor: '#fee2e2',
        columns: 2,
        fields: [
          {
            key: 'tipoDocumento',
            label: 'Tipo de Documento',
            type: 'select',
            required: true,
            colSpan: 2,
            options: [
              { value: 'cnpj', label: 'CNPJ - Pessoa Jurídica' },
              { value: 'cpf', label: 'CPF - Pessoa Física' }
            ],
            hint: 'Selecione o tipo de documento do contratante'
          },
          ...(tipoDocumento === 'cnpj' ? [{
            key: 'cnpj' as const,
            label: 'CNPJ',
            type: 'text' as const,
            // Não usar mask aqui, usar o componente InputCNPJ especial
            required: true,
            colSpan: 2 as const,
            placeholder: '00.000.000/0000-00',
            hint: 'Digite o CNPJ e os dados da empresa serão preenchidos automaticamente via Receita Federal.'
          }] : []),
          ...(tipoDocumento === 'cpf' ? [{
            key: 'cpf' as const,
            label: 'CPF',
            type: 'text' as const,
            mask: 'cpf' as const,
            required: true,
            colSpan: 2 as const,
            placeholder: '000.000.000-00',
            hint: 'Informe o CPF da pessoa física. A máscara será aplicada automaticamente.'
          }] : []),
          {
            key: 'razaoSocial',
            label: tipoDocumento === 'cpf' ? 'Nome Completo' : 'Razão Social',
            type: 'text',
            required: true,
            colSpan: 2,
            maxLength: 200,
            placeholder: tipoDocumento === 'cpf' ? 'Ex: João da Silva' : 'Ex: Transportes Silva LTDA',
            hint: tipoDocumento === 'cpf' 
              ? 'Informe o nome completo da pessoa física'
              : 'Informe a razão social conforme consta no cadastro oficial da empresa'
          },
          {
            key: 'nomeFantasia',
            label: 'Nome Fantasia',
            type: 'text',
            colSpan: 2,
            maxLength: 200,
            placeholder: 'Ex: TransSilva'
          }
        ]
      },
      {
        title: 'Endereço Comercial',
    subtitle: 'Localização principal do contratante',
    color: '#dc2626',
    bgColor: '#fecaca',
        columns: 3,
        fields: [
          {
            key: 'cep',
            label: 'CEP',
            type: 'text',
            mask: 'cep',
            required: true,
            placeholder: '00000-000',
            hint: 'Utilize o CEP com 8 dígitos para facilitar o preenchimento automático'
          },
          {
            key: 'uf',
            label: 'Estado (UF)',
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
            hint: 'Selecione o estado onde o contratante mantém sua sede operacional'
          },
          {
            key: 'municipio',
            label: 'Município',
            type: 'text',
            required: true,
            maxLength: 100,
            placeholder: 'Ex: São Paulo',
            hint: 'Informe o município conforme cadastro no IBGE'
          },
          {
            key: 'endereco',
            label: 'Logradouro',
            type: 'text',
            required: true,
            colSpan: 2,
            maxLength: 200,
            placeholder: 'Rua, avenida ou estrada'
          },
          {
            key: 'numero',
            label: 'Número',
            type: 'text',
            maxLength: 10,
            placeholder: 'Ex: 123'
          },
          {
            key: 'complemento',
            label: 'Complemento',
            type: 'text',
            colSpan: 2,
            maxLength: 100,
            placeholder: 'Sala, bloco, referência'
          },
          {
            key: 'bairro',
            label: 'Bairro',
            type: 'text',
            required: true,
            maxLength: 100,
            placeholder: 'Ex: Centro'
          }
        ]
      }
    ];
    }
  },
  view: {
    title: 'Visualização do Contratante',
    subtitle: 'Detalhes completos das informações cadastradas',
    headerIcon: 'building',
    headerColor: '#dc2626',
    idField: 'id',
    getSections: (item: any) => {
      // Função para formatar CNPJ
      const formatCNPJ = (cnpj: string) => {
        if (!cnpj) return 'Não informado';
        const cleaned = cnpj.replace(/\D/g, '');
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      };

      // Função para formatar CPF
      const formatCPF = (cpf: string) => {
        if (!cpf) return 'Não informado';
        const cleaned = cpf.replace(/\D/g, '');
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      };

      // Função para formatar CEP
      const formatCEP = (cep: string) => {
        if (!cep) return 'Não informado';
        const cleaned = cep.replace(/\D/g, '');
        return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
      };

      return [
      {
        title: 'Dados de Identificação',
        icon: 'building',
        color: '#dc2626',
        bgColor: '#fee2e2',
        columns: 2,
        fields: [
          { label: 'Razão Social', value: item.razaoSocial, colSpan: 2 },
          { label: 'Nome Fantasia', value: item.nomeFantasia || 'Não informado', colSpan: 2 },
          { label: 'CNPJ', value: formatCNPJ(item.cnpj) },
          { label: 'CPF', value: formatCPF(item.cpf) },
          { label: 'Situação', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      },
      {
        title: 'Endereço Comercial',
        icon: 'map-marker-alt',
        color: '#dc2626',
        bgColor: '#fecaca',
        columns: 2,
        fields: [
          { label: 'CEP', value: formatCEP(item.cep) },
          { label: 'Estado (UF)', value: item.uf },
          { label: 'Município', value: item.municipio, colSpan: 2 },
          { label: 'Logradouro', value: `${item.endereco}${item.numero ? `, ${item.numero}` : ''}`, colSpan: 2 },
          { label: 'Complemento', value: item.complemento || 'Não informado', colSpan: 2 },
          { label: 'Bairro', value: item.bairro, colSpan: 2 }
        ]
      }
    ];
    }
  }
};
