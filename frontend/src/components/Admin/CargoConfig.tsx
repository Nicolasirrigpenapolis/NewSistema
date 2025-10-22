import { CRUDConfig, FormSection, FormField } from '../../types/modal';

export interface CargoFormData {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export const cargoConfig: CRUDConfig<CargoFormData> = {
  entity: {
    name: 'Cargo',
    pluralName: 'Cargos',
    idField: 'id'
  },
  form: {
    title: 'Novo Cargo',
    editTitle: 'Editar Cargo',
    subtitle: 'Cadastre um novo cargo no sistema',
    editSubtitle: 'Atualize as informações do cargo',
    headerIcon: 'briefcase',
    headerColor: '#3b82f6',
    defaultValues: {
      nome: '',
      descricao: '',
      ativo: true
    },
    getSections: (item?: CargoFormData): FormSection[] => [
      {
        title: 'Informações do Cargo',
        subtitle: 'Dados de identificação e descrição',
        color: '#3b82f6',
        bgColor: 'transparent',
        columns: 1,
        fields: [
          {
            key: 'nome',
            label: 'Nome do Cargo',
            type: 'text',
            required: true,
            placeholder: 'Ex: Gerente, Analista, Operador',
            maxLength: 100,
            hint: 'Nome que identifica o cargo no sistema (máx. 100 caracteres)'
          },
          {
            key: 'descricao',
            label: 'Descrição / Atribuições',
            type: 'textarea',
            placeholder: 'Descreva as principais responsabilidades e atribuições deste cargo...',
            maxLength: 500,
            hint: 'Descrição detalhada das funções e responsabilidades (opcional, máx. 500 caracteres)'
          },
          // Só mostra o campo Status quando estiver editando um cargo existente
          ...(item ? [{
            key: 'ativo',
            label: 'Status do Cargo',
            type: 'checkbox' as const,
            hint: 'Desmarque para inativar (não poderá ser atribuído a novos usuários)'
          } as FormField] : [])
        ]
      }
    ]
  },
  view: {
    title: 'Detalhes do Cargo',
    subtitle: 'Visualização completa das informações',
    headerIcon: 'briefcase',
    headerColor: '#3b82f6',
    idField: 'id',
    getSections: (item: any) => [
      {
        title: 'Informações do Cargo',
        icon: 'briefcase',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        columns: 2,
        fields: [
          { label: 'Nome do Cargo', value: item.nome || 'Não informado' },
          { 
            label: 'Status', 
            value: item.ativo || item.ativo === undefined ? '✅ Ativo' : '❌ Inativo' 
          },
          { 
            label: 'Usuários com este Cargo', 
            value: item.quantidadeUsuarios !== undefined 
              ? `${item.quantidadeUsuarios} usuário(s)` 
              : 'Não disponível'
          },
          { 
            label: 'Data de Criação', 
            value: item.dataCriacao 
              ? new Date(item.dataCriacao).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Não disponível'
          },
          { 
            label: 'Descrição / Atribuições', 
            value: item.descricao || 'Nenhuma descrição fornecida', 
            colSpan: 2 
          }
        ]
      }
    ]
  }
};
