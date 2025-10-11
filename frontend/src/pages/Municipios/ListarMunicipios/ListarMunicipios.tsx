import React, { useState, useEffect } from 'react';
import { MunicipioCRUD } from '../../../components/Municipios/MunicipioCRUD';
import { ImportarIBGEModal } from '../../../components/Municipios/ImportarIBGEModal';
import Icon from '../../../components/UI/Icon';

interface Municipio {
  id?: number;
  codigo: number;
  nome: string;
  uf: string;
  ativo?: boolean;
}

interface PaginationData {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface FiltrosMunicipios {
  status: string;
  uf: string;
}

export function ListarMunicipios() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Estados temporários dos filtros (antes de aplicar)
  const [termoBuscaTemp, setTermoBuscaTemp] = useState('');
  const [filtrosTemp, setFiltrosTemp] = useState<FiltrosMunicipios>({
    status: '',
    uf: ''
  });

  // Estados dos filtros aplicados
  const [termoBusca, setTermoBusca] = useState('');
  const [filtros, setFiltros] = useState<FiltrosMunicipios>({
    status: '',
    uf: ''
  });

  // Estados da paginação
  const [paginacao, setPaginacao] = useState<PaginationData>({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // Estados dos modais CRUD
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMunicipio, setSelectedMunicipio] = useState<Municipio | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [importandoIBGE, setImportandoIBGE] = useState(false);

  // Estados do modal de importação
  const [modalImportacao, setModalImportacao] = useState(false);

  useEffect(() => {
    carregarMunicipios();
  }, [paginacao.current, paginacao.pageSize, filtros, termoBusca]);

  const carregarMunicipios = async () => {
    try {
      setCarregando(true);

      // Conectar à API real de municípios
      const params = new URLSearchParams({
        pageSize: paginacao.pageSize.toString(),
        page: paginacao.current.toString()
      });

      // API suporta apenas Search - então enviamos o termo de busca
      if (termoBusca) {
        params.append('search', termoBusca);
      }

      const url = `https://localhost:5001/api/municipios?${params.toString()}`;
      console.log('Carregando municípios de:', url);

      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao carregar municípios:', response.status, errorText);
        // Se não houver municípios cadastrados, mostrar lista vazia
        setMunicipios([]);
        setPaginacao(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
        return;
      }

      const data = await response.json();
      console.log('Dados recebidos da API:', data);

      // API retorna ResultadoPaginado<Municipio> com propriedades em inglês
      const municipiosArray = Array.isArray(data.items) ? data.items : [];
      console.log('Municípios encontrados:', municipiosArray.length);

      // Mapear dados da API para o formato esperado
      const municipiosFormatados = municipiosArray.map((municipio: any) => ({
        id: municipio.id,
        codigo: municipio.codigo,
        nome: municipio.nome,
        uf: municipio.uf,
        ativo: municipio.ativo
      }));

      // Aplicar filtros de status e UF no frontend
      let municipiosFiltrados = municipiosFormatados;

      if (filtros.status) {
        const ativo = filtros.status === 'ativo';
        municipiosFiltrados = municipiosFiltrados.filter(m => m.ativo === ativo);
      }

      if (filtros.uf) {
        municipiosFiltrados = municipiosFiltrados.filter(m => m.uf === filtros.uf);
      }

      setMunicipios(municipiosFiltrados);
      setPaginacao(prev => ({
        ...prev,
        total: data.totalItems || 0,
        totalPages: data.totalPages || Math.ceil((data.totalItems || 0) / prev.pageSize)
      }));
    } catch (error) {
      console.error('Erro ao carregar municípios:', error);
    } finally {
      setCarregando(false);
    }
  };



  const aplicarFiltros = () => {
    setFiltros(filtrosTemp);
    setTermoBusca(termoBuscaTemp);
    setPaginacao(prev => ({ ...prev, current: 1 }));
  };

  const limparFiltros = () => {
    setFiltrosTemp({
      status: '',
      uf: ''
    });
    setTermoBuscaTemp('');
    setFiltros({
      status: '',
      uf: ''
    });
    setTermoBusca('');
    setPaginacao(prev => ({ ...prev, current: 1 }));
  };

  const abrirModalNovo = () => {
    setSelectedMunicipio(null);
    setIsEdit(false);
    setFormModalOpen(true);
  };

  const abrirModalEdicao = (municipio: Municipio) => {
    setSelectedMunicipio(municipio);
    setIsEdit(true);
    setFormModalOpen(true);
  };

  const abrirModalVisualizacao = (municipio: Municipio) => {
    setSelectedMunicipio(municipio);
    setViewModalOpen(true);
  };

  const abrirModalExclusao = (municipio: Municipio) => {
    setSelectedMunicipio(municipio);
    setDeleteModalOpen(true);
  };

  const fecharModais = () => {
    setViewModalOpen(false);
    setFormModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedMunicipio(null);
    setIsEdit(false);
    setSaving(false);
    setDeleting(false);
  };

  const salvarMunicipio = async (data: Municipio) => {
    try {
      setSaving(true);

      const url = isEdit && data.id
        ? `https://localhost:5001/api/municipios/${data.id}`
        : 'https://localhost:5001/api/municipios';

      const method = isEdit && data.id ? 'PUT' : 'POST';

      console.log('Salvando município:', { url, method, data });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API:', errorText);
        throw new Error(`Erro ao salvar município: ${errorText}`);
      }

      fecharModais();
      await carregarMunicipios();
    } catch (error) {
      console.error('Erro ao salvar município:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const excluirMunicipio = async () => {
    if (!selectedMunicipio?.id) return;

    try {
      setDeleting(true);

      const response = await fetch(`https://localhost:5001/api/municipios/${selectedMunicipio.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir município');
      }

      fecharModais();
      carregarMunicipios();
    } catch (error) {
      console.error('Erro ao excluir município:', error);
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  const alterarPagina = (novaPagina: number) => {
    setPaginacao(prev => ({ ...prev, current: novaPagina }));
  };

  const alterarTamanhoPagina = (novoTamanho: number) => {
    setPaginacao(prev => ({
      ...prev,
      pageSize: novoTamanho,
      current: 1
    }));
  };

  const editarDoModal = (municipio: Municipio) => {
    setViewModalOpen(false);
    abrirModalEdicao(municipio);
  };

  const abrirModalImportacao = () => {
    setModalImportacao(true);
  };

  const fecharModalImportacao = () => {
    if (!importandoIBGE) {
      setModalImportacao(false);
    }
  };

  const confirmarImportacao = async () => {
    try {
      setImportandoIBGE(true);

      // Chamar a API do backend para importar municípios do IBGE
      const response = await fetch('https://localhost:5001/api/municipios/importar-todos-ibge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao importar municípios do IBGE');
      }

      const result = await response.json();

      alert(`${result.municipiosImportados || 'Todos os'} municípios importados com sucesso!`);
      carregarMunicipios();

      // Fechar modal
      setModalImportacao(false);
    } catch (error) {
      console.error('Erro ao importar municípios do IBGE:', error);
      alert('Erro ao importar municípios do IBGE. Tente novamente.');
    } finally {
      setImportandoIBGE(false);
    }
  };

  if (carregando) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Carregando municípios...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-map-marker-alt text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Municípios</h1>
              <p className="text-muted-foreground text-lg">Gerencie os municípios cadastrados no sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={abrirModalImportacao}
              disabled={importandoIBGE}
            >
              <i className={importandoIBGE ? "fas fa-spinner fa-spin text-lg" : "fas fa-download text-lg"}></i>
              <span>{importandoIBGE ? 'Importando...' : 'Importar IBGE'}</span>
            </button>
            <button
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={abrirModalNovo}
            >
              <i className="fas fa-plus text-lg"></i>
              <span>Novo Município</span>
            </button>
          </div>
        </div>

      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="grid grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={filtrosTemp.status}
              onChange={(e) => setFiltrosTemp({ ...filtrosTemp, status: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">UF</label>
            <select
              value={filtrosTemp.uf}
              onChange={(e) => setFiltrosTemp({ ...filtrosTemp, uf: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              <option value="PR">Paraná</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="SC">Santa Catarina</option>
              <option value="BA">Bahia</option>
              <option value="GO">Goiás</option>
              <option value="PE">Pernambuco</option>
              <option value="CE">Ceará</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por nome, código ou UF..."
              value={termoBuscaTemp}
              onChange={(e) => setTermoBuscaTemp(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aplicarFiltros()}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <button
              className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              onClick={aplicarFiltros}
            >
              <Icon name="search" />
              Filtrar
            </button>
          </div>

          <div>
            <button
              className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={limparFiltros}
              disabled={!filtrosTemp.status && !filtrosTemp.uf && !termoBuscaTemp}
            >
              <Icon name="times" />
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        {municipios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-map-marker-alt text-2xl text-muted-foreground"></i>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum município encontrado</h3>
            <p className="text-muted-foreground text-center">Adicione um novo município ou ajuste os filtros de busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-5 gap-4 p-4 bg-muted border-b border-border font-semibold text-foreground">
              <div className="text-center">Código IBGE</div>
              <div className="text-center">Nome</div>
              <div className="text-center">UF</div>
              <div className="text-center">Status</div>
              <div className="text-center">Ações</div>
            </div>

            {municipios.map((municipio) => (
              <div key={municipio.id} className="grid grid-cols-5 gap-4 p-4 border-b border-border hover:bg-card-hover transition-colors duration-200">
                <div className="text-center">
                  <span className="text-foreground">{municipio.codigo}</span>
                  <div className="text-sm text-muted-foreground">Código IBGE</div>
                </div>
                <div className="text-center">
                  <strong className="text-foreground">{municipio.nome}</strong>
                </div>
                <div className="text-center">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded text-xs font-medium">{municipio.uf}</span>
                </div>
                <div className="text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    municipio.ativo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {municipio.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                    onClick={() => abrirModalVisualizacao(municipio)}
                    title="Visualizar"
                  >
                    <Icon name="eye" />
                  </button>
                  <button
                    className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200"
                    onClick={() => abrirModalEdicao(municipio)}
                    title="Editar"
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    onClick={() => abrirModalExclusao(municipio)}
                    title="Excluir"
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginação - só mostra se houver registros */}
      {paginacao.total > 0 && (
        <div className="mt-6 bg-card border-t border-border p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-foreground">Itens por página:</label>
              <select
                className="px-3 py-1 border border-border rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={paginacao.pageSize}
                onChange={(e) => alterarTamanhoPagina(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={() => alterarPagina(paginacao.current - 1)}
                disabled={paginacao.current === 1}
              >
                Anterior
              </button>

              <span className="px-4 py-2 text-foreground">
                Página {paginacao.current} de {paginacao.totalPages}
              </span>

              <button
                className="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={() => alterarPagina(paginacao.current + 1)}
                disabled={paginacao.current === paginacao.totalPages}
              >
                Próxima
              </button>
            </div>

            <div className="text-sm text-muted-foreground">
              Mostrando {((paginacao.current - 1) * paginacao.pageSize) + 1} a {Math.min(paginacao.current * paginacao.pageSize, paginacao.total)} de {paginacao.total} municípios
            </div>
          </div>
        </div>
      )}

      {/* Componente de CRUD de Municípios */}
      <MunicipioCRUD
        viewModalOpen={viewModalOpen}
        formModalOpen={formModalOpen}
        deleteModalOpen={deleteModalOpen}
        selectedMunicipio={selectedMunicipio}
        isEdit={isEdit}
        onViewClose={() => setViewModalOpen(false)}
        onFormClose={() => setFormModalOpen(false)}
        onDeleteClose={() => setDeleteModalOpen(false)}
        onSave={salvarMunicipio}
        onEdit={editarDoModal}
        onDelete={excluirMunicipio}
        saving={saving}
        deleting={deleting}
      />

      {/* Modal de Importação IBGE */}
      <ImportarIBGEModal
        isOpen={modalImportacao}
        onClose={fecharModalImportacao}
        onConfirm={confirmarImportacao}
        isImporting={importandoIBGE}
      />
      </div>
    </div>
  );
}