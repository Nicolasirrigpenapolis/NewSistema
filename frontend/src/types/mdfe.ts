export interface LocalidadeInput {
  uf: string;
  municipio: string;
  codigoIBGE: number;
}

export interface ValePedagioInput {
  cnpjFornecedor: string;
  cnpjPagador?: string;
  numeroCompra: string;
  valorVale: number;
  tipoVale?: string;
  nomeFornecedor?: string;
}

export interface PagamentoComponenteInput {
  tipoComponente: string;
  valor: number;
  descricao?: string;
}

export interface PagamentoPrazoInput {
  numeroParcela: string;
  valorParcela: number;
  dataVencimento?: string;
}

export interface PagamentoBancoInput {
  codigoBanco?: string;
  codigoAgencia?: string;
  cnpjIpef?: string;
  numeroContaPagamento?: string;
}

export interface PagamentoInfoInput {
  cnpjCpf?: string;
  idEstrangeiro?: string;
  nome?: string;
  tipoPagamento?: string;
  indicadorPagamento?: string;
  valorContrato?: number;
  observacoes?: string;
  componentes?: PagamentoComponenteInput[];
  prazos?: PagamentoPrazoInput[];
  banco?: PagamentoBancoInput;
}

export interface ResponsavelTecnicoInput {
  cnpj?: string;
  nomeContato?: string;
  email?: string;
  telefone?: string;
  idCsrt?: string;
  hashCsrt?: string;
}

export interface LacreInput {
  numeroLacre: string;
}

export interface UnidadeCargaInput {
  tipoUnidadeCarga: string;
  idUnidadeCarga?: string;
  qtdRat?: number;
  lacres?: LacreInput[];
}

export interface UnidadeTransporteInput {
  tipoUnidadeTransporte: string;
  codigoInterno?: string;
  placa?: string;
  tara?: number;
  capacidadeKg?: number;
  capacidadeM3?: number;
  tipoRodado?: string;
  tipoCarroceria?: string;
  uf?: string;
  quantidadeRateada?: number;
  lacres?: LacreInput[];
  unidadesCarga?: UnidadeCargaInput[];
}

export type MDFeStep =
  | 'emitente-transporte'  // Emitente, Veículo, Motorista
  | 'origem-destino'       // Rota: origem, destino, percurso
  | 'documentos'           // Documentos fiscais transportados
  | 'carga-seguro'         // Informações da carga e seguro
  | 'emissao';             // Revisão final e emissão

// Documentos são tratados como arrays de strings (chaves) - interfaces removidas para simplicidade

// INTERFACE FRONTEND SIMPLIFICADA - Apenas dados que o usuário insere
export interface MDFeData {
  // === IDENTIFICAÇÃO (apenas para edição) ===
  id?: number;

  // === ENTIDADES (apenas IDs - responsabilidade do frontend) ===
  emitenteId: number; // ÚNICO campo obrigatório para rascunho
  veiculoId?: number; // Opcional
  condutorId?: number; // Opcional
  contratanteId?: number; // Opcional
  seguradoraId?: number; // Opcional

  // === DADOS BÁSICOS DA VIAGEM (entrada do usuário) ===
  ufIni?: string; // Backend pode preencher do emitente
  ufFim?: string; // Backend pode preencher do emitente
  pesoBrutoTotal?: number;
  valorTotal?: number;
  infoAdicional?: string;

  // === ENTREGA ÚNICA / LOCAÇÃO ===
  // Quando tiver apenas 1 CT-e = entrega única/locação
  entregaUnica?: boolean; // Calculado automaticamente no frontend
  ncmEntregaUnica?: string; // NCM do serviço de locação (obrigatório se entregaUnica = true)
  valorEntregaUnica?: number; // Valor da locação (obrigatório se entregaUnica = true)

  // === DOCUMENTOS (arrays simples) ===
  documentosCTe?: string[];
  documentosNFe?: string[];
  reboquesIds?: number[];
  localidadesCarregamento?: LocalidadeInput[];
  localidadesDescarregamento?: LocalidadeInput[];
  rotaPercurso?: string[];
  valesPedagio?: ValePedagioInput[];
  semValePedagio?: boolean;

  // === CAMPOS OPCIONAIS AVANÇADOS ===
  tipoCarga?: string;
  descricaoProduto?: string;
  produtoPredominante?: string;

  // === CAMPOS RESOLVIDOS AUTOMATICAMENTE PELO BACKEND ===
  // Os seguintes campos SÃO suportados no backend, mas são extraídos automaticamente
  // das entidades relacionadas (Emitente, Veículo, Condutor, Contratante, Seguradora)
  // e NÃO precisam ser enviados pelo frontend:
  // - cepCarregamento / cepDescarregamento (do Emitente)
  // - tipoResponsavelSeguro / numeroApoliceSeguro / numeroAverbacaoSeguro (da Seguradora)
  // - codigoCIOT (do Contratante ou configuração)
  // - latitudeCarregamento / longitudeCarregamento / latitudeDescarregamento / longitudeDescarregamento (das Localidades)
  // - proprietarioDiferente / cnpjProprietario / cpfProprietario / nomeProprietario (do Veículo)
  // - pagamento / valesPedagio / responsavelTecnico / unidadesTransporte / unidadesCarga (complexos)

  autorizadosXml?: string[];

  // === STATUS (apenas para exibição - read-only) ===
  chaveAcesso?: string;
  protocolo?: string;
  statusSefaz?: string;

  // === CAMPOS REMOVIDOS (responsabilidade do backend) ===
  // - dataEmissao: Backend define automaticamente
  // - dataInicioViagem: Backend define automaticamente
  // - numeroMdfe: Backend gera automaticamente
  // - serie: Backend obtém do emitente
  // - modal: Backend obtém do emitente
  // - tipoTransportador: Backend obtém do emitente
  // - municipioIni/municipioFim: Backend obtém do emitente
  // - dhInicioViagem: Backend calcula automaticamente
  // - codigoMunicipioCarregamento/Descarregamento: Backend resolve
  // - nomeMunicipioCarregamento/Descarregamento: Backend resolve
  // - codigoMDF: Backend gera automaticamente
  // - localidadesCarregamento/Descarregamento: Backend processa
  // - rotaPercurso: Backend processa
}

export interface MensagemFeedback {
  id?: string;
  tipo: 'sucesso' | 'erro' | 'info' | 'aviso';
  titulo: string;
  mensagem: string;
  horario?: Date;
  detalhes?: string;
}

export interface ValidacaoEtapa {
  ehValida: boolean;
  erros: string[];
  avisos: string[];
}

export interface RespostaAPI {
  sucesso: boolean;
  mensagem: string;
  dados?: any;
  codigoErro?: string;
  detalhesValidacao?: Record<string, string[]>;
}

export interface MDFeResponseDto {
  id: number;
  numeroMdfe: number; // Padronizado
  chaveAcesso?: string; // Padronizado
  serie: number; // Mudou para number
  dataEmissao: Date;
  dataInicioViagem?: Date;

  // === CAMPOS CRÍTICOS PARA CONFORMIDADE MODELOINI.INI ===
  dhInicioViagem?: Date;
  codigoMunicipioCarregamento?: number;
  nomeMunicipioCarregamento?: string;
  codigoMunicipioDescarregamento?: number;
  nomeMunicipioDescarregamento?: string;
  codigoMDF?: string;
  ufIni: string;
  ufFim: string;
  municipioIni: string;
  municipioFim: string;
  pesoBrutoTotal?: number;
  valorTotal?: number;
  statusSefaz: string; // Padronizado
  infoAdicional?: string; // Padronizado
  protocolo?: string;
  dataAutorizacao?: Date;

  // Dados do Emitente (snapshot)
  emitenteRazaoSocial: string;
  emitenteCnpj?: string;
  emitenteUf?: string;

  // Dados do Veículo (snapshot)
  veiculoPlaca?: string;
  veiculoTara?: number;
  veiculoUf?: string;

  // Dados do Condutor (snapshot)
  condutorNome?: string;
  condutorCpf?: string;

  // IDs das entidades relacionadas
  emitenteId: number;
  veiculoId?: number;
  condutorId?: number;
  contratanteId?: number;
  seguradoraId?: number;

  // Controle
  transmitido: boolean;
  autorizado: boolean;
  encerrado: boolean;
  cancelado: boolean;
  dataCriacao: Date;
  dataUltimaAlteracao?: Date;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ReciboConciliacaoData {
  numeroRecibo: string;
}

// Interfaces para entidades cadastradas
export interface EmitenteCadastrado {
  id: number;
  cnpj?: string;
  cpf?: string;
  ie?: string;
  razaoSocial: string; // Mapeado do backend RazaoSocial
  nomeFantasia?: string; // Mapeado do backend NomeFantasia
  endereco?: string; // Mapeado do backend Endereco
  numero?: string; // Mapeado do backend Numero
  complemento?: string; // Mapeado do backend Complemento
  bairro?: string; // Mapeado do backend Bairro
  codigoMunicipio?: number; // Mapeado do backend CodMunicipio
  municipio?: string; // Mapeado do backend Municipio
  cep?: string; // Mapeado do backend Cep
  uf: string; // Mapeado do backend Uf
  telefone?: string; // Mapeado do backend Telefone
  email?: string; // Mapeado do backend Email
  ativo: boolean; // Mapeado do backend Ativo
  tipoEmitente: string; // Mapeado do backend TipoEmitente
  descricaoEmitente?: string; // Mapeado do backend DescricaoEmitente
  rntrc?: string; // Mapeado do backend Rntrc
}

export interface VeiculoCadastrado {
  id: number;
  placa: string; // Mapeado do backend Placa
  tara: number; // Mapeado do backend Tara
  tipoRodado?: string; // Mapeado do backend TipoRodado
  tipoCarroceria?: string; // Mapeado do backend TipoCarroceria
  uf: string; // Mapeado do backend Uf
  ativo: boolean; // Mapeado do backend Ativo
}

// NOVA ARQUITETURA SIMPLIFICADA
// Frontend envia APENAS dados essenciais
// Backend monta XML/INI completo internamente

// INTERFACES XML REMOVIDAS - COMPLEXIDADE DESNECESSÁRIA NO FRONTEND
// Backend será responsável por TODA lógica SEFAZ

// Interface para entidades disponíveis no combobox
export interface EntidadeOpcao {
  id: number;
  label: string;
  description?: string;
  data?: any; // Dados completos da entidade se disponível
}

export interface EntidadesCarregadas {
  emitentes?: EntidadeOpcao[];
  veiculos?: EntidadeOpcao[];
  condutores?: EntidadeOpcao[];
  contratantes?: EntidadeOpcao[];
  seguradoras?: EntidadeOpcao[];
}

export interface MdfeTransmissaoResponse {
  sucesso: boolean;
  numeroLote?: string;
  codigoStatus?: string;
  motivoStatus?: string;
  protocolo?: string;
  numeroRecibo?: string;
  dataRecebimento?: string;
  chaveMDFe?: string;
  versaoAplicativo?: string;
  xmlAutorizado?: string;
}

