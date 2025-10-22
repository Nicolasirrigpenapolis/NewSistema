import { CRUDConfig, FormSection } from '../../types/modal';
import { formatCEP, formatDocument, formatTelefone } from '../../utils/formatters';

export type TipoPessoa = 'F' | 'J';

export interface FornecedorFormData {
  nome: string;
  tipoPessoa: TipoPessoa;
  cnpjCpf: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  observacoes?: string;
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

const tipoPessoaOptions = [
  { value: 'J', label: 'Pessoa Jurídica' },
  { value: 'F', label: 'Pessoa Física' }
];

export const fornecedorConfig: CRUDConfig<FornecedorFormData> = {
  entity: {
    name: 'Fornecedor',
    pluralName: 'Fornecedores',
    idField: 'id'
  },
  form: {
    title: 'Cadastrar Novo Fornecedor',
    editTitle: 'Editar Informações do Fornecedor',
    subtitle: 'Preencha os dados para disponibilizar o fornecedor nas rotinas de manutenção',
    editSubtitle: 'Atualize os dados cadastrais do fornecedor selecionado',
    headerIcon: 'building',
    headerColor: '#1e3a8a',
    defaultValues: {
      nome: '',
      tipoPessoa: 'J',
      cnpjCpf: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      uf: '',
      cep: '',
      observacoes: '',
      ativo: true
    },
    getSections: (item?: FornecedorFormData): FormSection[] => {
      const isPessoaFisica = item?.tipoPessoa === 'F';
      const documentoLabel = isPessoaFisica ? 'CPF do Fornecedor' : 'CNPJ do Fornecedor';
      const documentoHint = isPessoaFisica
        ? 'Informe um CPF válido com 11 dígitos. A máscara é aplicada automaticamente.'
        : 'Informe um CNPJ válido com 14 dígitos. A máscara é aplicada automaticamente.';
      const documentoPlaceholder = isPessoaFisica ? '000.000.000-00' : '00.000.000/0000-00';
      const documentoMask = isPessoaFisica ? 'cpf' : 'cnpj';

      return [
        {
          title: 'Dados do Fornecedor',
          subtitle: 'Informações cadastrais e de contato para identificar o fornecedor',
          color: '#1e3a8a',
          bgColor: '#e0e7ff',
          columns: 2,
          fields: [
            {
              key: 'nome',
              label: 'Nome ou Razão Social',
              type: 'text',
              required: true,
              placeholder: 'Ex: Oficina Brasil Serviços Automotivos',
              colSpan: 2,
              hint: 'Utilize o nome completo para facilitar a identificação nas rotinas operacionais.'
            },
            {
              key: 'tipoPessoa',
              label: 'Tipo de Pessoa',
              type: 'select',
              required: true,
              options: tipoPessoaOptions,
              hint: 'Selecione se o fornecedor é pessoa jurídica (CNPJ) ou pessoa física (CPF).'
            },
            {
              key: 'cnpjCpf',
              label: documentoLabel,
              type: 'text',
              mask: documentoMask,
              required: true,
              placeholder: documentoPlaceholder,
              hint: documentoHint
            },
            {
              key: 'email',
              label: 'E-mail de Contato',
              type: 'email',
              placeholder: 'contato@fornecedor.com.br'
            },
            {
              key: 'telefone',
              label: 'Telefone',
              type: 'text',
              mask: 'telefone',
              placeholder: '(00) 00000-0000'
            },
            {
              key: 'ativo',
              label: 'Fornecedor ativo no sistema',
              type: 'checkbox',
              colSpan: 2,
              hint: 'Desmarque para impedir que o fornecedor seja utilizado em novas ordens de serviço.'
            }
          ]
        },
        {
          title: 'Endereço e Observações',
          subtitle: 'Localização e anotações internas sobre o fornecedor',
          color: '#1e3a8a',
          bgColor: '#c7d2fe',
          columns: 2,
          fields: [
            {
              key: 'endereco',
              label: 'Logradouro',
              type: 'text',
              colSpan: 2,
              placeholder: 'Rua, Avenida, número e complemento'
            },
            {
              key: 'cidade',
              label: 'Cidade',
              type: 'text',
              placeholder: 'Ex: São Paulo'
            },
            {
              key: 'uf',
              label: 'Unidade Federativa (UF)',
              type: 'select',
              options: estados,
              placeholder: 'Selecione a UF'
            },
            {
              key: 'cep',
              label: 'CEP',
              type: 'text',
              mask: 'cep',
              placeholder: '00000-000'
            },
            {
              key: 'observacoes',
              label: 'Observações Internas',
              type: 'textarea',
              colSpan: 2,
              rows: 4,
              placeholder: 'Inclua detalhes relevantes sobre políticas comerciais, agendamentos ou contatos.'
            }
          ]
        }
      ];
    }
  },
  view: {
    title: 'Visualização do Fornecedor',
    subtitle: 'Detalhes completos das informações cadastradas',
    headerIcon: 'building',
    headerColor: '#1e3a8a',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Dados do Fornecedor',
  icon: 'building',
  color: '#1e3a8a',
  bgColor: '#e0e7ff',
        columns: 2,
        fields: [
          { label: 'Nome ou Razão Social', value: item.nome, colSpan: 2 },
          {
            label: 'Tipo de Pessoa',
            value: item.tipoPessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'
          },
          {
            label: item.tipoPessoa === 'F' ? 'CPF' : 'CNPJ',
            value: formatDocument(item.cnpjCpf, item.tipoPessoa === 'F' ? 'F' : 'J')
          },
          { label: 'E-mail', value: item.email || 'Não informado' },
          {
            label: 'Telefone',
            value: item.telefone ? formatTelefone(item.telefone) : 'Não informado'
          },
          { label: 'Status', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      },
      {
  title: 'Endereço e Observações',
  icon: 'map-marker-alt',
  color: '#1e3a8a',
  bgColor: '#c7d2fe',
        columns: 2,
        fields: [
          {
            label: 'Logradouro',
            value: item.endereco || 'Não informado',
            colSpan: 2
          },
          { label: 'Cidade', value: item.cidade || 'Não informado' },
          { label: 'UF', value: item.uf || 'Não informado' },
          {
            label: 'CEP',
            value: item.cep ? formatCEP(item.cep) : 'Não informado'
          },
          {
            label: 'Observações',
            value: item.observacoes || 'Não informado',
            colSpan: 2
          }
        ]
      }
    ]
  }
};
