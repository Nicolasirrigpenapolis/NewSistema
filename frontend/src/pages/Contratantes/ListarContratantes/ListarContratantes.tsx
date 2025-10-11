import React, { useState, useEffect } from 'react';
import { ContratanteCRUD } from '../../../components/Contratantes/ContratanteCRUD';
import { formatCNPJ, formatCPF, cleanNumericString } from '../../../utils/formatters';
import { entitiesService } from '../../../services/entitiesService';
import Icon from '../../../components/UI/Icon';

interface Contratante {
  id?: number;
  cnpj?: string;
  cpf?: string;
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
}

interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startItem: number;
  endItem: number;
}

export function ListarContratantes() {
  const [contratantes, setContratantes] = useState<Contratante[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [filtroTemp, setFiltroTemp] = useState('');
  const [filtroTipoTemp, setFiltroTipoTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');
  const [filtroUfTemp, setFiltroUfTemp] = useState('');

  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroUf, setFiltroUf] = useState('');

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);

  // Estados para modais
  const [modalVisualizacao, setModalVisualizacao] = useState(false);
  const [modalEdicao, setModalEdicao] = useState(false);
  const [contratanteSelecionado, setContratanteSelecionado] = useState<Contratante | null>(null);
  const [dadosFormulario, setDadosFormulario] = useState<Partial<Contratante>>({});
  const [salvando, setSalvando] = useState(false);

  // Estados do modal de exclusão
  const [modalExclusao, setModalExclusao] = useState(false);
  const [contratanteExclusao, setContratanteExclusao] = useState<Contratante | null>(null);
  const [excludindo, setExcluindo] = useState(false);


  useEffect(() => {
    carregarContratantes();
  }, [paginaAtual, tamanhoPagina, filtro, filtroTipo, filtroStatus, filtroUf]);

  const carregarContratantes = async () => {
    setCarregando(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';
      const params = new URLSearchParams({
        pagina: paginaAtual.toString(),
        tamanhoPagina: tamanhoPagina.toString()
      });

      if (filtro.trim()) {
        params.append('busca', filtro.trim());
      }

      const response = await fetch(`${API_BASE_URL}/contratantes?${params}`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const contratantesMapeados: Contratante[] = (data.itens || data.items || data.Itens || []).map((contratante: any) => ({
        id: contratante.id || contratante.Id,
        cnpj: contratante.cnpj || contratante.Cnpj,
        cpf: contratante.cpf || contratante.Cpf,
        razaoSocial: contratante.razaoSocial || contratante.RazaoSocial,
        nomeFantasia: contratante.nomeFantasia || contratante.NomeFantasia,
        endereco: contratante.endereco || contratante.Endereco,
        numero: contratante.numero || contratante.Numero,
        complemento: contratante.complemento || contratante.Complemento,
        bairro: contratante.bairro || contratante.Bairro,
        codMunicipio: contratante.codMunicipio || contratante.CodMunicipio,
        municipio: contratante.municipio || contratante.Municipio,
        cep: contratante.cep || contratante.Cep,
        uf: contratante.uf || contratante.Uf,
        ativo: contratante.ativo !== undefined ? contratante.ativo : (contratante.Ativo !== undefined ? contratante.Ativo : true)
      }));

      setContratantes(contratantesMapeados);
      setPaginacao({
        totalItems: data.totalItens || data.totalItems || data.TotalItens || contratantesMapeados.length,
        totalPages: data.totalPaginas || data.totalPages || data.TotalPaginas || 1,
        currentPage: data.pagina || data.currentPage || data.Pagina || 1,
        pageSize: data.tamanhoPagina || data.pageSize || data.TamanhoPagina || 10,
        hasNextPage: data.temProximaPagina || data.hasNextPage || data.TemProxima || false,
        hasPreviousPage: data.temPaginaAnterior || data.hasPreviousPage || data.TemAnterior || false,
        startItem: data.startItem || 1,
        endItem: data.endItem || contratantesMapeados.length
      });
    } catch (error) {
      console.error('Erro ao carregar contratantes:', error);
      setContratantes([]);
      setPaginacao({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        hasNextPage: false,
        hasPreviousPage: false,
        startItem: 0,
        endItem: 0
      });
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalVisualizacao = (contratante: Contratante) => {
    setContratanteSelecionado(contratante);
    setModalVisualizacao(true);
  };

  const abrirModalEdicao = (contratante?: Contratante) => {
    if (contratante) {
      setContratanteSelecionado(contratante);
      // Adicionar o campo virtual tipoDocumento baseado no que existe
      const tipoDocumento = contratante.cnpj ? 'cnpj' : contratante.cpf ? 'cpf' : undefined;
      setDadosFormulario({
        ...contratante,
        tipoDocumento
      } as any);
    } else {
      setContratanteSelecionado(null);
      setDadosFormulario({
        tipoDocumento: 'cnpj', // Default para CNPJ
        ativo: true,
        codMunicipio: 0,
        municipio: ''
      } as any);
    }
    setModalEdicao(true);
  };

  const fecharModais = () => {
    setModalVisualizacao(false);
    setModalEdicao(false);
    setContratanteSelecionado(null);
    setDadosFormulario({});
  };


  const salvarContratante = async (dados: Partial<Contratante>) => {
    setSalvando(true);
    try {
      const dadosParaSalvar = {
        cnpj: dados.cnpj ? cleanNumericString(dados.cnpj) : undefined,
        cpf: dados.cpf ? cleanNumericString(dados.cpf) : undefined,
        razaoSocial: dados.razaoSocial?.trim(),
        nomeFantasia: dados.nomeFantasia?.trim(),
        endereco: dados.endereco?.trim(),
        numero: dados.numero?.trim(),
        complemento: dados.complemento?.trim(),
        bairro: dados.bairro?.trim(),
        codMunicipio: dados.codMunicipio,
        municipio: dados.municipio?.trim(),
        cep: dados.cep ? cleanNumericString(dados.cep) : undefined,
        uf: dados.uf?.toUpperCase(),
        ativo: dados.ativo !== false
      };

      let resposta;
      if (contratanteSelecionado?.id) {
        resposta = await entitiesService.atualizarContratante(contratanteSelecionado.id, dadosParaSalvar);
      } else {
        resposta = await entitiesService.criarContratante(dadosParaSalvar);
      }

      if (resposta.sucesso) {
        fecharModais();
        carregarContratantes();
      } else {
        alert(`Erro ao salvar contratante: ${resposta.mensagem}`);
      }
    } catch (error) {
      console.error('Erro ao salvar contratante:', error);
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalExclusao = (contratante: Contratante) => {
    setContratanteExclusao(contratante);
    setModalExclusao(true);
  };

  const fecharModalExclusao = () => {
    setModalExclusao(false);
    setContratanteExclusao(null);
    setExcluindo(false);
  };

  const confirmarExclusao = async () => {
    if (!contratanteExclusao?.id) return;

    try {
      setExcluindo(true);
      const resposta = await entitiesService.excluirContratante(contratanteExclusao.id);

      if (resposta.sucesso) {
        fecharModalExclusao();
        carregarContratantes();
      } else {
        alert(`Erro ao excluir contratante: ${resposta.mensagem}`);
        setExcluindo(false);
      }
    } catch (error) {
      console.error('Erro ao excluir contratante:', error);
      alert('Erro inesperado ao excluir contratante. Tente novamente.');
      setExcluindo(false);
    }
  };

  const aplicarFiltros = () => {
    setFiltro(filtroTemp);
    setFiltroTipo(filtroTipoTemp);
    setFiltroStatus(filtroStatusTemp);
    setFiltroUf(filtroUfTemp);
    setPaginaAtual(1);
  };

  const limparFiltros = () => {
    setFiltroTemp('');
    setFiltroTipoTemp('');
    setFiltroStatusTemp('');
    setFiltroUfTemp('');
    setFiltro('');
    setFiltroTipo('');
    setFiltroStatus('');
    setFiltroUf('');
    setPaginaAtual(1);
  };

  const atualizarCampo = (campo: string, valor: any) => {
    setDadosFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Callback para preencher dados automaticamente ao consultar CNPJ
  const handleCNPJDataFetch = (data: any) => {
    console.log('Dados recebidos da API CNPJ:', data);

    // Mapear os dados da API para o formato do formulário
    const dadosMapeados: Partial<Contratante> = {
      razaoSocial: data.razaoSocial || data.nome || '',
      nomeFantasia: data.nomeFantasia || data.fantasia || '',
      cep: data.cep || '',
      endereco: data.logradouro || data.endereco || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      municipio: data.municipio || '',
      uf: data.uf || '',
      codMunicipio: data.codMunicipio || 0
    };

    console.log('Dados mapeados para o formulário:', dadosMapeados);

    return dadosMapeados;
  };

  const tipoContratante = (contratante: Contratante) => {
    return contratante.cnpj ? 'PJ' : 'PF';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-handshake text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Contratantes</h1>
              <p className="text-muted-foreground text-lg">Gerencie os contratantes dos serviços de transporte</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => abrirModalEdicao()}
          >
            <i className="fas fa-plus text-lg"></i>
            <span>Novo Contratante</span>
          </button>
        </div>

      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="grid grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Buscar por razão social, CNPJ, CPF..."
              value={filtroTemp}
              onChange={(e) => setFiltroTemp(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
            <select
              value={filtroTipoTemp}
              onChange={(e) => setFiltroTipoTemp(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todos</option>
              <option value="PJ">Pessoa Jurídica</option>
              <option value="PF">Pessoa Física</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={filtroStatusTemp}
              onChange={(e) => setFiltroStatusTemp(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">UF</label>
            <select
              value={filtroUfTemp}
              onChange={(e) => setFiltroUfTemp(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todas</option>
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AP">AP</option>
              <option value="AM">AM</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MT">MT</option>
              <option value="MS">MS</option>
              <option value="MG">MG</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RS">RS</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="SC">SC</option>
              <option value="SP">SP</option>
              <option value="SE">SE</option>
              <option value="TO">TO</option>
            </select>
          </div>

          <div>
            <button
              onClick={aplicarFiltros}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Icon name="search" />
              Filtrar
            </button>
          </div>

          <div>
            <button
              className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={limparFiltros}
              disabled={!filtroTemp && !filtroTipoTemp && !filtroStatusTemp && !filtroUfTemp}
            >
              <Icon name="times" />
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando contratantes...</span>
            </div>
          </div>
        ) : contratantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <h3>Nenhum contratante encontrado</h3>
            <p>Adicione um novo contratante para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-4 p-4 bg-muted border-b border-border font-semibold text-foreground">
              <div className="text-center">CNPJ/CPF</div>
              <div className="text-center">Razão Social</div>
              <div className="text-center">Tipo</div>
              <div className="text-center">Localização</div>
              <div className="text-center">Status</div>
              <div className="text-center">Ações</div>
            </div>
            {contratantes.map((contratante) => (
              <div key={contratante.id} className="grid grid-cols-6 gap-4 p-4 border-b border-border hover:bg-muted transition-colors duration-200">
                <div className="text-center">
                  <strong>
                    {contratante.cnpj ? formatCNPJ(contratante.cnpj) : formatCPF(contratante.cpf || '')}
                  </strong>
                </div>
                <div className="text-center">
                  <strong>{contratante.razaoSocial}</strong>
                  {contratante.nomeFantasia && <div className="text-sm text-muted-foreground">{contratante.nomeFantasia}</div>}
                </div>
                <div className="text-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-xs font-medium">{tipoContratante(contratante)}</span>
                </div>
                <div className="text-center">
                  <strong>{contratante.municipio}/{contratante.uf}</strong>
                </div>
                <div className="text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    contratante.ativo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {contratante.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => abrirModalVisualizacao(contratante)}
                  >
                    Visualizar
                  </button>
                  <button
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                    onClick={() => abrirModalEdicao(contratante)}
                  >
                    Editar
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    onClick={() => abrirModalExclusao(contratante)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {paginacao && paginacao.totalItems > 0 && (
        <div className="mt-6 bg-card border-t border-border p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {((paginacao.currentPage - 1) * paginacao.pageSize) + 1} até {Math.min(paginacao.currentPage * paginacao.pageSize, paginacao.totalItems)} de {paginacao.totalItems} contratantes
            </div>

            {paginacao.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaginaAtual(paginacao.currentPage - 1)}
                  disabled={!paginacao.hasPreviousPage}
                  className="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  ← Anterior
                </button>

                <span className="px-4 py-2 text-foreground">
                  Página {paginacao.currentPage} de {paginacao.totalPages}
                </span>

                <button
                  onClick={() => setPaginaAtual(paginacao.currentPage + 1)}
                  disabled={!paginacao.hasNextPage}
                  className="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Próxima →
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="text-sm text-foreground">Itens por página:</label>
              <select
                value={tamanhoPagina}
                onChange={(e) => {
                  setTamanhoPagina(Number(e.target.value));
                  setPaginaAtual(1);
                }}
                className="px-3 py-1 border border-border rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <ContratanteCRUD
        viewModalOpen={modalVisualizacao}
        formModalOpen={modalEdicao}
        deleteModalOpen={modalExclusao}
        selectedContratante={contratanteSelecionado}
        isEdit={!!contratanteSelecionado}
        onViewClose={fecharModais}
        onFormClose={fecharModais}
        onDeleteClose={fecharModalExclusao}
        onSave={salvarContratante}
        onEdit={(contratante) => abrirModalEdicao(contratante)}
        onDelete={confirmarExclusao}
        onCNPJDataFetch={handleCNPJDataFetch}
        onFieldChange={atualizarCampo}
        formData={dadosFormulario}
        saving={salvando}
        deleting={excludindo}
      />
      </div>
    </div>
  );
}