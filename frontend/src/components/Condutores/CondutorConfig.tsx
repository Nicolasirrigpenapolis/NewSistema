import { CRUDConfig, FormSection } from '../../types/modal';
import { formatCPF, formatTelefone } from '../../utils/formatters';

export const condutorConfig: CRUDConfig<any> = {
  entity: {
    name: 'Condutor',
    pluralName: 'Condutores',
    idField: 'id'
  },
  form: {
    title: 'Cadastrar Novo Condutor',
    editTitle: 'Editar Informações do Condutor',
    subtitle: 'Preencha todos os dados necessários para o cadastro do condutor no sistema',
    editSubtitle: 'Atualize as informações cadastrais do condutor selecionado',
    headerIcon: 'user',
    headerColor: '#f97316',
    defaultValues: {
      nome: '',
      cpf: '',
      telefone: '',
      ativo: true
    },
    getSections: (item?: any): FormSection[] => [
      {
        title: 'Dados de Identificação',
        subtitle: 'Informações pessoais e documento oficial do condutor',
        color: '#f97316',
        bgColor: '#ffedd5',
        columns: 2,
        fields: [
          {
            key: 'nome',
            label: 'Nome Completo do Condutor',
            type: 'text',
            required: true,
            placeholder: 'Ex: João da Silva',
            colSpan: 2,
            hint: 'Informe o nome completo exatamente como consta nos documentos oficiais do condutor'
          },
          {
            key: 'cpf',
            label: 'CPF do Condutor',
            type: 'text',
            required: true,
            placeholder: '000.000.000-00',
            mask: 'cpf',
            maxLength: 11,
            hint: 'Digite um CPF válido com 11 dígitos. A máscara é aplicada automaticamente.'
          },
          {
            key: 'ativo',
            label: 'Condutor ativo no sistema',
            type: 'checkbox',
            colSpan: 2
          }
        ]
      },
      {
        title: 'Contato e Operação',
        subtitle: 'Dados utilizados nas comunicações e avisos operacionais',
        color: '#f97316',
        bgColor: '#fed7aa',
        columns: 2,
        fields: [
          {
            key: 'telefone',
            label: 'Telefone para Contato',
            type: 'text',
            placeholder: '(00) 00000-0000',
            mask: 'telefone',
            maxLength: 11,
            colSpan: 2,
            hint: 'Informe um telefone celular ou fixo. A máscara é aplicada automaticamente.'
          }
        ]
      }
    ]
  },
  view: {
    title: 'Visualização do Condutor',
    subtitle: 'Detalhes completos das informações cadastradas',
    headerIcon: 'user',
    headerColor: '#f97316',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Dados de Identificação',
        icon: 'file-text',
        color: '#f97316',
        bgColor: '#ffedd5',
        columns: 2,
        fields: [
          { label: 'Nome Completo', value: item.nome, colSpan: 2 },
          { label: 'CPF', value: formatCPF(item.cpf) },
          { label: 'Situação', value: item.ativo ? 'Ativo' : 'Inativo' }
        ]
      },
      {
        title: 'Contato e Operação',
        icon: 'phone',
        color: '#f97316',
        bgColor: '#fed7aa',
        columns: 2,
        fields: [
          {
            label: 'Telefone para Contato',
            value: item.telefone ? formatTelefone(item.telefone) : 'Não informado',
            colSpan: 2
          }
        ]
      }
    ]
  }
};
