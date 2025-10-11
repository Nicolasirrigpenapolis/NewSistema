/**
 * TIPOS UNIFICADOS DA API
 * Centralização de todos os tipos de resposta e estruturas da API
 */

// ========== RESPOSTA PADRÃO DA API ==========
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationInfo;
  errors?: ErrorInfo[];
  meta?: Record<string, any>;
  timestamp: string;
}

// Formato alternativo usado em alguns endpoints (para compatibilidade)
export interface ApiResponseAlternativo<T> {
  sucesso: boolean;
  data?: T;
  mensagem?: string;
}

// ========== PAGINAÇÃO ==========
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startItem: number;
  endItem: number;
}

export interface PaginationRequest {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// ========== TRATAMENTO DE ERROS ==========
export interface ErrorInfo {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// ========== AUTENTICAÇÃO ==========
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  nome: string;
  username: string;
  password: string;
  cargoId: number;
}

export interface UserInfo {
  id: number;
  nome: string;
  username: string;
  cargoId?: number;
  cargoNome?: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

// ========== VALIDAÇÃO DE DOCUMENTOS ==========
export interface ValidacaoResponse<T> {
  sucesso: boolean;
  data?: T;
  mensagem?: string;
}

export interface CNPJData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  codigoMunicipio: number;
  telefone?: string;
  email?: string;
  situacao?: string;
  dataSituacao?: string;
}

// ========== LOCALIZAÇÃO ==========
export interface EstadoDto {
  sigla: string;
  nome: string;
}

export interface MunicipioDto {
  id: number;
  codigo: number;
  nome: string;
  uf: string;
  ativo: boolean;
}

export interface CodigoMunicipioDto {
  codigo: number;
  municipio: string;
  uf: string;
}

// ========== TIPOS HELPER ==========
export type PaginatedApiResponse<T> = ApiResponse<T[]> & {
  pagination: PaginationInfo;
};

export type ErrorApiResponse = ApiResponse<null> & {
  errors: ErrorInfo[];
};

// ========== ENTIDADES COMUNS ==========
export interface EntityOption {
  id: number;
  label: string;
  description?: string;
}

export interface ImportResultDto {
  sucesso: boolean;
  totalEstados: number;
  totalInseridos: number;
  totalAtualizados: number;
  totalIgnorados: number;
  tempoProcessamento?: string;
  erros: string[];
}