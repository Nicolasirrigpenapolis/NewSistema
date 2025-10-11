import { ModalConfig } from '../../types/modal';

export interface CargoFormData {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export const cargoConfig: ModalConfig<CargoFormData> = {
  title: 'Cargo',
  createTitle: 'Novo Cargo',
  editTitle: 'Editar Cargo',
  createSubtitle: 'Cadastre um novo cargo',
  editSubtitle: 'Edite os dados do cargo',
  theme: 'indigo',

  sections: [
    {
      id: 'dados',
      title: 'Dados do Cargo',
      subtitle: 'Informações principais',
      fields: [
        {
          name: 'nome',
          label: 'Nome do Cargo',
          type: 'text',
          required: true,
          placeholder: 'Ex: Administrador, Operador, etc.',
          colSpan: 2
        },
        {
          name: 'descricao',
          label: 'Descrição',
          type: 'textarea',
          placeholder: 'Descrição das responsabilidades do cargo (opcional)',
          colSpan: 2
        }
      ]
    }
  ],

  viewFields: [
    { name: 'nome', label: 'Nome' },
    { name: 'descricao', label: 'Descrição', optional: true },
    { name: 'ativo', label: 'Status', type: 'status' }
  ]
};