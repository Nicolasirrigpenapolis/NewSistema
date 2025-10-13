import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../ui';
import Pagination from '../../../components/UI/navigation/Pagination';
import { MDFeViewModal } from '../../../components/UI/feedback/MDFeViewModal';
import { formatPlaca } from '../../../utils/formatters';

interface MDFe {
  id: number;
  numero: string;
  serie: string;
  dataEmissao: string;
  ufIni: string | null;
  ufFim: string | null;
  valorTotal: number;
  status: 'Autorizado' | 'Pendente' | 'Cancelado' | 'Rejeitado' | 'Rascunho';
  chave: string;
  emitenteNome?: string;
  veiculoPlaca?: string;
}

export function ListarMDFe() {
  const navigate = useNavigate();
  const [mdfes, setMDFes] = useState<MDFe[]>([]);

  const [filtroTemp, setFiltroTemp] = useState('');
  const [statusFiltroTemp, setStatusFiltroTemp] = useState('todos');

  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [selectedMDFe, setSelectedMDFe] = useState<MDFe | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [processando, setProcessando] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [mdfeParaExcluir, setMdfeParaExcluir] = useState<{ id: number; numero: string } | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarMDFes();
  }, []);

  const carregarMDFes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe?pagina=1&tamanhoPagina=50`);

      if (!response.ok) {
        throw new Error('Erro ao carregar MDF-es');
      }

      const data = await response.json();

      // Mapear os dados da API para o formato esperado pelo componente
      const mdfesMapeados: MDFe[] = data.items?.map((item: any) => ({
        id: item.id,
        numero: item.numeroMdfe?.toString() || '',
        serie: item.serie?.toString() || '0',
        dataEmissao: item.dataEmissao || new Date().toISOString(),
        ufIni: item.ufIni || null,
        ufFim: item.ufFim || null,
        valorTotal: item.valorTotal || 0,
        status: item.status || 'Rascunho',
        chave: item.chave || '',
        emitenteNome: item.emitenteRazaoSocial || 'Empresa',
        veiculoPlaca: item.veiculoPlaca || ''
      })) || [];

      setMDFes(mdfesMapeados);
    } catch (error) {
      console.error('Erro ao carregar MDFes:', error);
      setMDFes([]);
    }
  };

  const exibirMensagem = (tipo: 'sucesso' | 'erro', texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 5000);
  };

  // Função para excluir MDFe
  const handleExcluir = async () => {
    if (!mdfeParaExcluir) return;

    setExcluindo(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe/${mdfeParaExcluir.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        exibirMensagem('sucesso', `MDFe ${mdfeParaExcluir.numero} excluído com sucesso!`);
        setMdfeParaExcluir(null);
        carregarMDFes(); // Recarregar lista
      } else {
        const resultado = await response.json();
        exibirMensagem('erro', resultado.mensagem || `Erro ao excluir MDFe ${mdfeParaExcluir.numero}`);
      }
    } catch (error) {
      console.error('Erro ao excluir MDFe:', error);
      exibirMensagem('erro', `Erro ao excluir MDFe ${mdfeParaExcluir.numero}`);
    } finally {
      setExcluindo(false);
    }
  };

  // Função para gerar MDFe (backend endpoint disponível)
  const handleGerarMDFe = async (mdfeId: number, numero: string) => {
    try {
      setProcessando(mdfeId);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe/${mdfeId}/gerar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const resultado = await response.json();

      if (response.ok) {
        exibirMensagem('sucesso', `MDFe ${numero} gerado com sucesso!`);
      } else {
        exibirMensagem('erro', resultado.mensagem || `Erro ao gerar MDFe ${numero}`);
      }
    } catch (error) {
      console.error('Erro ao gerar MDFe:', error);
      exibirMensagem('erro', `Erro ao gerar MDFe ${numero}`);
    } finally {
      setProcessando(null);
    }
  };

  // Função para transmitir MDFe (backend endpoint disponível)
  const handleTransmitir = async (mdfeId: number, numero: string) => {
    if (!window.confirm(`Deseja transmitir o MDFe ${numero} para a SEFAZ?`)) {
      return;
    }

    try {
      setProcessando(mdfeId);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe/${mdfeId}/transmitir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const resultado = await response.json();

      if (response.ok) {
        exibirMensagem('sucesso', `MDFe ${numero} transmitido com sucesso!`);
        setTimeout(() => {
          carregarMDFes(); // Recarregar lista para atualizar status
        }, 1500);
      } else {
        exibirMensagem('erro', resultado.mensagem || `Erro ao transmitir MDFe ${numero}`);
      }
    } catch (error) {
      console.error('Erro ao transmitir MDFe:', error);
      exibirMensagem('erro', `Erro ao transmitir MDFe ${numero}`);
    } finally {
      setProcessando(null);
    }
  };

  // Função para baixar PDF do DAMDFE
  const handleBaixarPDF = async (mdfeId: number, numero: string) => {
    try {
      setProcessando(mdfeId);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe/${mdfeId}/pdf`, {
        method: 'GET'
      });

      if (response.ok) {
        // Criar um blob do PDF
        const blob = await response.blob();

        // Criar um link temporário para download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DAMDFE_${numero}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();

        // Limpar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        exibirMensagem('sucesso', `PDF do MDFe ${numero} baixado com sucesso!`);
      } else {
        const resultado = await response.json();
        exibirMensagem('erro', resultado.mensagem || `Erro ao gerar PDF do MDFe ${numero}`);
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      exibirMensagem('erro', `Erro ao baixar PDF do MDFe ${numero}`);
    } finally {
      setProcessando(null);
    }
  };

  // Filtrar MDFes
  const mdfesFiltrados = mdfes.filter(mdfe => {
    const passaFiltroTexto = filtro === '' ||
      mdfe.numero.toLowerCase().includes(filtro.toLowerCase()) ||
      mdfe.emitenteNome?.toLowerCase().includes(filtro.toLowerCase()) ||
      mdfe.veiculoPlaca?.toLowerCase().includes(filtro.toLowerCase());

    const passaFiltroStatus = statusFiltro === 'todos' || mdfe.status === statusFiltro;

    return passaFiltroTexto && passaFiltroStatus;
  });

  // Paginação
  const totalItems = mdfesFiltrados.length;
  const totalPages = Math.ceil(totalItems / itensPorPagina);
  const startIndex = (paginaAtual - 1) * itensPorPagina;
  const endIndex = startIndex + itensPorPagina;
  const itensAtuais = mdfesFiltrados.slice(startIndex, endIndex);

  const handlePageChange = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
  };

  const handleItemsPerPageChange = (novoTamanho: number) => {
    setItensPorPagina(novoTamanho);
    setPaginaAtual(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full py-8">
        {/* Mensagem de Feedback */}
        {mensagem && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mb-6">
            <div className={`p-4 rounded-lg border flex items-center justify-between ${
              mensagem.tipo === 'sucesso'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}>
              <div className="flex items-center gap-3">
                <i className={`fas ${
                  mensagem.tipo === 'sucesso' ? 'fa-check-circle' : 'fa-exclamation-circle'
                }`}></i>
                <span>{mensagem.texto}</span>
              </div>
              <button
                className="text-current hover:opacity-70 transition-opacity duration-200"
                onClick={() => setMensagem(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-file-alt text-white text-xl"></i>
                </div>
                Manifestos Eletrônicos (MDFe)
              </h1>
              <p className="text-muted-foreground dark:text-gray-300 mt-2">
                Gerencie seus manifestos eletrônicos de transporte
              </p>
            </div>
            <button
              onClick={() => navigate('/mdfes/novo')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-plus"></i>
              Novo MDFe
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <i className="fas fa-check-circle text-green-600 dark:text-green-400 text-xl"></i>
                </div>
                <div className="text-green-600 dark:text-green-400">
                  <i className="fas fa-arrow-up"></i>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{mdfes.filter(m => m.status.toUpperCase() === 'AUTORIZADO').length}</div>
                <div className="text-muted-foreground">Autorizados</div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <i className="fas fa-file-alt text-blue-600 dark:text-blue-400 text-xl"></i>
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  <i className="fas fa-minus"></i>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{mdfes.filter(m => m.status.toUpperCase() === 'RASCUNHO').length}</div>
                <div className="text-muted-foreground">Rascunhos</div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <i className="fas fa-clock text-yellow-600 dark:text-yellow-400 text-xl"></i>
                </div>
                <div className="text-yellow-600 dark:text-yellow-400">
                  <i className="fas fa-arrow-up"></i>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{mdfes.filter(m => m.status.toUpperCase() === 'PENDENTE').length}</div>
                <div className="text-muted-foreground">Pendentes</div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <i className="fas fa-times-circle text-red-600 dark:text-red-400 text-xl"></i>
                </div>
                <div className="text-red-600 dark:text-red-400">
                  <i className="fas fa-arrow-down"></i>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{mdfes.filter(m => m.status.toUpperCase() === 'REJEITADO' || m.status.toUpperCase() === 'CANCELADO').length}</div>
                <div className="text-muted-foreground">Rejeitados/Cancelados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Buscar por número, emitente ou veículo..."
                  value={filtroTemp}
                  onChange={(e) => setFiltroTemp(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (setFiltro(filtroTemp), setStatusFiltro(statusFiltroTemp))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <select
                  value={statusFiltroTemp}
                  onChange={(e) => setStatusFiltroTemp(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="Autorizado">Autorizado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Rascunho">Rascunho</option>
                  <option value="Cancelado">Cancelado</option>
                  <option value="Rejeitado">Rejeitado</option>
                </select>
              </div>

              <div className="space-y-2">
                <select
                  value={itensPorPagina}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>

              <div>
                <button
                  onClick={() => { setFiltro(filtroTemp); setStatusFiltro(statusFiltroTemp); }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <i className="fas fa-search"></i>
                  Filtrar
                </button>
              </div>

              <div>
                <button
                  onClick={() => { setFiltroTemp(''); setStatusFiltroTemp('todos'); setFiltro(''); setStatusFiltro('todos'); }}
                  className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  disabled={!filtroTemp && statusFiltroTemp === 'todos'}
                >
                  <i className="fas fa-times"></i>
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de MDFes */}
        <div className="bg-card shadow-sm">
          {totalItems > 0 && (
            <div className="px-6 py-3 border-b border-border bg-muted">
              <span className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} MDFes
              </span>
            </div>
          )}

          {itensAtuais.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-file-alt text-2xl text-muted-foreground"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum MDFe encontrado</h3>
              <p className="text-muted-foreground text-center mb-6">
                {filtro || statusFiltro !== 'todos'
                  ? 'Tente ajustar os filtros para encontrar o que procura.'
                  : 'Comece criando seu primeiro manifesto eletrônico.'
                }
              </p>
              {(!filtro && statusFiltro === 'todos') && (
                <button
                  onClick={() => navigate('/mdfes/novo')}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Criar Primeiro MDFe
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-full table-auto border-collapse">
                {/* Header da Tabela */}
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-100 w-36">
                      Número/Série
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-100">
                      Emitente
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-100 w-32">
                      Data
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-100 w-28">
                      Trajeto
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-100 w-32">
                      Veículo
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-100 w-40">
                      Valor Carga
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-100 w-36">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground dark:text-gray-100 w-48">
                      Ações
                    </th>
                  </tr>
                </thead>

                {/* Linhas da Tabela */}
                <tbody className="bg-card dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {itensAtuais.map((mdfe) => (
                    <tr key={mdfe.id} className="hover:bg-background dark:hover:bg-gray-800 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm">
                          <div className="font-semibold text-foreground dark:text-gray-100">#{mdfe.numero}</div>
                          <div className="text-gray-500 dark:text-gray-400">Série {mdfe.serie}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="text-sm font-medium text-foreground dark:text-gray-100">
                          {mdfe.emitenteNome || 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-foreground dark:text-gray-100">
                          {new Date(mdfe.dataEmissao).toLocaleDateString('pt-BR')}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-foreground dark:text-gray-100">
                          {mdfe.ufIni && mdfe.ufFim ? (
                            <span className="inline-flex items-center gap-1">
                              {mdfe.ufIni}
                              <i className="fas fa-arrow-right text-xs text-gray-400"></i>
                              {mdfe.ufFim}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Não informado</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-foreground dark:text-gray-100">
                          {mdfe.veiculoPlaca ? formatPlaca(mdfe.veiculoPlaca) : 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                          R$ {mdfe.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          mdfe.status.toUpperCase() === 'AUTORIZADO'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          mdfe.status.toUpperCase() === 'RASCUNHO' || mdfe.status.toUpperCase() === 'PENDENTE'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                          {mdfe.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center gap-1 justify-center">
                          {/* Ação principal por status */}
                          {(mdfe.status.toUpperCase() === 'RASCUNHO' || mdfe.status.toUpperCase() === 'REJEITADO') ? (
                            <button
                              className="w-8 h-8 flex items-center justify-center text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                              title={mdfe.status.toUpperCase() === 'REJEITADO' ? 'Corrigir & Editar' : 'Continuar Editando'}
                              onClick={() => navigate(`/mdfes/editar/${mdfe.id}`)}
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </button>
                          ) : (
                            <button
                              className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Ver Detalhes"
                              onClick={() => navigate(`/mdfes/visualizar/${mdfe.id}`)}
                            >
                              <i className="fas fa-eye text-sm"></i>
                            </button>
                          )}

                          {/* Download PDF apenas para autorizados, encerrados e cancelados */}
                          {(mdfe.status.toUpperCase() === 'AUTORIZADO' || mdfe.status.toUpperCase() === 'ENCERRADO' || mdfe.status.toUpperCase() === 'CANCELADO') && (
                            <button
                              className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              title="Baixar PDF do DAMDFE"
                              onClick={() => handleBaixarPDF(mdfe.id, mdfe.numero)}
                              disabled={processando === mdfe.id}
                            >
                              {processando === mdfe.id ? (
                                <i className="fas fa-spinner fa-spin text-sm"></i>
                              ) : (
                                <i className="fas fa-file-pdf text-sm"></i>
                              )}
                            </button>
                          )}

                          {/* Transmitir rascunhos */}
                          {mdfe.status.toUpperCase() === 'RASCUNHO' && (
                            <button
                              className="w-8 h-8 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              title="Transmitir MDFe"
                              onClick={() => handleTransmitir(mdfe.id, mdfe.numero)}
                              disabled={processando === mdfe.id}
                            >
                              {processando === mdfe.id ? (
                                <i className="fas fa-spinner fa-spin text-sm"></i>
                              ) : (
                                <i className="fas fa-paper-plane text-sm"></i>
                              )}
                            </button>
                          )}

                          {/* Duplicar sempre disponível (exceto cancelados) */}
                          {mdfe.status.toUpperCase() !== 'CANCELADO' && (
                            <button
                              className="w-8 h-8 flex items-center justify-center text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              title="Duplicar MDFe"
                              onClick={() => {
                                // Implementar lógica de duplicação
                                navigate(`/mdfes/duplicar/${mdfe.id}`);
                              }}
                              disabled={processando === mdfe.id}
                            >
                              <i className="fas fa-copy text-sm"></i>
                            </button>
                          )}

                          {/* Excluir (apenas rascunhos e rejeitados) */}
                          {(mdfe.status.toUpperCase() === 'RASCUNHO' || mdfe.status.toUpperCase() === 'REJEITADO') && (
                            <button
                              className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Excluir MDFe"
                              onClick={() => setMdfeParaExcluir({ id: mdfe.id, numero: mdfe.numero })}
                            >
                              <i className="fas fa-trash text-sm"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={paginaAtual}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Modal de Visualização */}
        {selectedMDFe && (
          <MDFeViewModal
            mdfe={selectedMDFe}
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedMDFe(null);
            }}
          />
        )}

        {/* Modal de Confirmação de Exclusão */}
        {mdfeParaExcluir && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <i className="fas fa-trash-alt text-red-600 text-lg"></i>
                </div>
                <h3 className="text-white font-bold text-lg">Confirmar Exclusão</h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-foreground mb-4 text-base leading-relaxed">
                  Tem certeza que deseja excluir o <strong>MDFe #{mdfeParaExcluir.numero}</strong>?
                </p>
                <p className="text-muted-foreground text-sm">
                  Esta ação <strong>não pode ser desfeita</strong>. O documento será permanentemente removido do sistema.
                </p>
              </div>

              {/* Actions */}
              <div className="bg-muted px-6 py-4 flex gap-3 justify-end border-t border-border">
                <button
                  onClick={() => setMdfeParaExcluir(null)}
                  disabled={excluindo}
                  className="px-6 py-2.5 bg-card hover:bg-background border-2 border-border text-foreground rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancelar
                </button>
                <button
                  onClick={handleExcluir}
                  disabled={excluindo}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {excluindo ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash mr-2"></i>
                      Confirmar Exclusão
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};