/**
 * Mensagens padronizadas do sistema
 * Centralizando terminologia para facilitar manutenção
 */

export const MESSAGES = {
  // Soft Delete - Desativar ao invés de excluir
  DESATIVAR: {
    BUTTON: 'Desativar',
    TITLE: 'Desativar Registro',
    CONFIRM: 'Tem certeza de que deseja desativar este registro?',
    SUCCESS: 'Registro desativado com sucesso',
    ERROR: 'Erro ao desativar registro',
  },
  
  REATIVAR: {
    BUTTON: 'Reativar',
    TITLE: 'Reativar Registro',
    CONFIRM: 'Tem certeza de que deseja reativar este registro?',
    SUCCESS: 'Registro reativado com sucesso',
    ERROR: 'Erro ao reativar registro',
  },

  // Entidades específicas
  VEICULO: {
    DESATIVAR_TITLE: 'Desativar Veículo',
    DESATIVAR_CONFIRM: 'Tem certeza de que deseja desativar este veículo? Ele não será mais exibido nas listagens.',
    DESATIVAR_SUCCESS: 'Veículo desativado com sucesso',
    DESATIVAR_ERROR: 'Erro ao desativar veículo',
    REATIVAR_SUCCESS: 'Veículo reativado com sucesso',
    REATIVAR_ERROR: 'Erro ao reativar veículo',
  },

  CONDUTOR: {
    DESATIVAR_TITLE: 'Desativar Condutor',
    DESATIVAR_CONFIRM: 'Tem certeza de que deseja desativar este condutor? Ele não será mais exibido nas listagens.',
    DESATIVAR_SUCCESS: 'Condutor desativado com sucesso',
    DESATIVAR_ERROR: 'Erro ao desativar condutor',
    REATIVAR_SUCCESS: 'Condutor reativado com sucesso',
    REATIVAR_ERROR: 'Erro ao reativar condutor',
  },

  CONTRATANTE: {
    DESATIVAR_TITLE: 'Desativar Contratante',
    DESATIVAR_CONFIRM: 'Tem certeza de que deseja desativar este contratante? Ele não será mais exibido nas listagens.',
    DESATIVAR_SUCCESS: 'Contratante desativado com sucesso',
    DESATIVAR_ERROR: 'Erro ao desativar contratante',
    REATIVAR_SUCCESS: 'Contratante reativado com sucesso',
    REATIVAR_ERROR: 'Erro ao reativar contratante',
  },

  SEGURADORA: {
    DESATIVAR_TITLE: 'Desativar Seguradora',
    DESATIVAR_CONFIRM: 'Tem certeza de que deseja desativar esta seguradora? Ela não será mais exibida nas listagens.',
    DESATIVAR_SUCCESS: 'Seguradora desativada com sucesso',
    DESATIVAR_ERROR: 'Erro ao desativar seguradora',
    REATIVAR_SUCCESS: 'Seguradora reativada com sucesso',
    REATIVAR_ERROR: 'Erro ao reativar seguradora',
  },

  REBOQUE: {
    DESATIVAR_TITLE: 'Desativar Reboque',
    DESATIVAR_CONFIRM: 'Tem certeza de que deseja desativar este reboque? Ele não será mais exibido nas listagens.',
    DESATIVAR_SUCCESS: 'Reboque desativado com sucesso',
    DESATIVAR_ERROR: 'Erro ao desativar reboque',
    REATIVAR_SUCCESS: 'Reboque reativado com sucesso',
    REATIVAR_ERROR: 'Erro ao reativar reboque',
  },

  FORNECEDOR: {
    DESATIVAR_TITLE: 'Desativar Fornecedor',
    DESATIVAR_CONFIRM: 'Tem certeza de que deseja desativar este fornecedor? Ele não será mais exibido nas listagens.',
    DESATIVAR_SUCCESS: 'Fornecedor desativado com sucesso',
    DESATIVAR_ERROR: 'Erro ao desativar fornecedor',
    REATIVAR_SUCCESS: 'Fornecedor reativado com sucesso',
    REATIVAR_ERROR: 'Erro ao reativar fornecedor',
  },

  // Para entidades que podem ser excluídas (transacionais)
  VIAGEM: {
    EXCLUIR_TITLE: 'Excluir Viagem',
    EXCLUIR_CONFIRM: 'Tem certeza de que deseja excluir esta viagem? Todas as despesas e receitas serão excluídas também.',
    EXCLUIR_SUCCESS: 'Viagem excluída com sucesso',
    EXCLUIR_ERROR: 'Erro ao excluir viagem',
  },

  MANUTENCAO: {
    EXCLUIR_TITLE: 'Excluir Manutenção',
    EXCLUIR_CONFIRM: 'Tem certeza de que deseja excluir esta manutenção?',
    EXCLUIR_SUCCESS: 'Manutenção excluída com sucesso',
    EXCLUIR_ERROR: 'Erro ao excluir manutenção',
  },
};
