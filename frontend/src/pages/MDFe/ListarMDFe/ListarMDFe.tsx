import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../ui';
import Pagination from '../../../components/UI/navigation/Pagination';
import { MDFeViewModal } from '../../../components/UI/feedback/MDFeViewModal';
import { formatPlaca } from '../../../utils/formatters';
import {
  FileCheck,
  FileText,
  Clock,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '../../../components/UI/card';

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
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-blue-500/30 overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-indigo-700 dark:from-blue-400 dark:via-indigo-500 dark:to-indigo-600" aria-hidden="true" />
                <span className="absolute inset-0 opacity-40 blur-lg bg-blue-500" aria-hidden="true" />
                <div className="relative h-full w-full flex items-center justify-center">
                  <Icon name="file-alt" className="!text-white text-2xl" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">Manifestos Eletrônicos (MDFe)</h1>
                <p className="text-muted-foreground text-lg">Gerencie os manifestos eletrônicos de transporte</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/mdfes/novo')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Icon name="plus" size="lg" />
              <span>Novo MDFe</span>
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {/* Card Autorizados */}
            <Card
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2"
              onClick={() => { setStatusFiltroTemp('Autorizado'); setStatusFiltro('Autorizado'); }}
            >
              <CardContent className="pt-8 px-8 pb-6">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                        Autorizados
                      </p>
                      <h3 className="text-4xl font-bold tracking-tight">
                        {mdfes.filter(m => m.status.toUpperCase() === 'AUTORIZADO').length}
                      </h3>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center shadow-sm">
                      <FileCheck className="h-7 w-7 text-green-600 dark:text-green-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="pt-5 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Documentos válidos
                      </span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {mdfes.filter(m => m.status.toUpperCase() === 'AUTORIZADO').length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Rascunhos */}
            <Card
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2"
              onClick={() => { setStatusFiltroTemp('Rascunho'); setStatusFiltro('Rascunho'); }}
            >
              <CardContent className="pt-8 px-8 pb-6">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                        Rascunhos
                      </p>
                      <h3 className="text-4xl font-bold tracking-tight">
                        {mdfes.filter(m => m.status.toUpperCase() === 'RASCUNHO').length}
                      </h3>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center shadow-sm">
                      <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="pt-5 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Aguardando envio
                      </span>
                      <span className="text-sm font-bold">
                        {mdfes.filter(m => m.status.toUpperCase() === 'RASCUNHO').length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Pendentes */}
            <Card
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2"
              onClick={() => { setStatusFiltroTemp('Pendente'); setStatusFiltro('Pendente'); }}
            >
              <CardContent className="pt-8 px-8 pb-6">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                        Pendentes
                      </p>
                      <h3 className="text-4xl font-bold tracking-tight">
                        {mdfes.filter(m => m.status.toUpperCase() === 'PENDENTE').length}
                      </h3>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 flex items-center justify-center shadow-sm">
                      <Clock className="h-7 w-7 text-yellow-600 dark:text-yellow-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="pt-5 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Em processamento
                      </span>
                      <span className="text-sm font-bold">
                        {mdfes.filter(m => m.status.toUpperCase() === 'PENDENTE').length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Rejeitados/Cancelados */}
            <Card
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2"
              onClick={() => { setStatusFiltroTemp('Rejeitado'); setStatusFiltro('Rejeitado'); }}
            >
              <CardContent className="pt-8 px-8 pb-6">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                        Rejeitados/Cancelados
                      </p>
                      <h3 className="text-4xl font-bold tracking-tight">
                        {mdfes.filter(m => m.status.toUpperCase() === 'REJEITADO' || m.status.toUpperCase() === 'CANCELADO').length}
                      </h3>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/20 flex items-center justify-center shadow-sm">
                      <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="pt-5 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Com problemas
                      </span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        {mdfes.filter(m => m.status.toUpperCase() === 'REJEITADO' || m.status.toUpperCase() === 'CANCELADO').length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtros */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-6">
          <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6">
            <div className="grid grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
                <input
                  type="text"
                  placeholder="Número, emitente ou veículo..."
                  value={filtroTemp}
                  onChange={(e) => setFiltroTemp(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (setFiltro(filtroTemp), setStatusFiltro(statusFiltroTemp))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  value={statusFiltroTemp}
                  onChange={(e) => setStatusFiltroTemp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="todos">Todos os status</option>
                  <option value="Autorizado">Autorizado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Rascunho">Rascunho</option>
                  <option value="Cancelado">Cancelado</option>
                  <option value="Rejeitado">Rejeitado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Itens por página</label>
                <select
                  value={itensPorPagina}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div>
                <button
                  onClick={() => { setFiltro(filtroTemp); setStatusFiltro(statusFiltroTemp); }}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Icon name="search" />
                  Filtrar
                </button>
              </div>

              <div>
                <button
                  onClick={() => { setFiltroTemp(''); setStatusFiltroTemp('todos'); setFiltro(''); setStatusFiltro('todos'); }}
                  className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!filtroTemp && statusFiltroTemp === 'todos'}
                >
                  <Icon name="times" />
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {/* Indicador de filtros ativos */}
          {(filtro || statusFiltro !== 'todos') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
              <div className="flex items-center gap-2">
                <Icon name="filter" className="text-blue-800 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Filtros ativos:
                  {filtro && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtro}</span>}
                  {statusFiltro !== 'todos' && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{statusFiltro}</span>}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Lista de MDFes */}
        <div className="mx-4 sm:mx-6 lg:mx-8">
          <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
            {itensAtuais.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Icon name="file-alt" className="text-2xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {(filtro || statusFiltro !== 'todos') ? 'Nenhum MDFe encontrado com os filtros aplicados' : 'Nenhum MDFe encontrado'}
                </h3>
                <p className="text-muted-foreground text-center mb-6">
                  {(filtro || statusFiltro !== 'todos') ? 'Tente ajustar os filtros ou limpar para ver todos os MDFes.' : 'Comece criando seu primeiro manifesto eletrônico.'}
                </p>
                {(!filtro && statusFiltro === 'todos') && (
                  <button
                    onClick={() => navigate('/mdfes/novo')}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 shadow-lg"
                  >
                    <Icon name="plus" />
                    Criar Primeiro MDFe
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-full table-auto border-collapse">
                    {/* Header da Tabela */}
                    <thead className="bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground w-36">
                          Número/Série
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Emitente
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground w-32">
                          Data
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground w-28">
                          Trajeto
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground w-32">
                          Veículo
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground w-40">
                          Valor Carga
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground w-36">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-foreground w-48">
                          Ações
                        </th>
                      </tr>
                    </thead>

                    {/* Linhas da Tabela */}
                    <tbody className="bg-card divide-y divide-gray-200 dark:divide-transparent">
                      {itensAtuais.map((mdfe) => (
                        <tr key={mdfe.id} className="border-b border-gray-200 dark:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-150">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-foreground">#{mdfe.numero}</div>
                            <div className="text-xs text-muted-foreground">Série {mdfe.serie}</div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-foreground">
                              {mdfe.emitenteNome || 'N/A'}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm text-muted-foreground">
                              {new Date(mdfe.dataEmissao).toLocaleDateString('pt-BR')}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground">
                              {mdfe.ufIni && mdfe.ufFim ? (
                                <span className="inline-flex items-center gap-1">
                                  {mdfe.ufIni}
                                  <Icon name="arrow-right" className="text-xs text-gray-400" />
                                  {mdfe.ufFim}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Não informado</span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-foreground">
                              {mdfe.veiculoPlaca ? formatPlaca(mdfe.veiculoPlaca) : 'N/A'}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                              R$ {mdfe.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>

                          <td className="px-6 py-4">
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

                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Ação principal por status */}
                              {(mdfe.status.toUpperCase() === 'RASCUNHO' || mdfe.status.toUpperCase() === 'REJEITADO') ? (
                                <button
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                  title={mdfe.status.toUpperCase() === 'REJEITADO' ? 'Corrigir & Editar' : 'Continuar Editando'}
                                  onClick={() => navigate(`/mdfes/editar/${mdfe.id}`)}
                                >
                                  <Icon name="edit" />
                                </button>
                              ) : (
                                <button
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="Ver Detalhes"
                                  onClick={() => navigate(`/mdfes/visualizar/${mdfe.id}`)}
                                >
                                  <Icon name="eye" />
                                </button>
                              )}

                              {/* Download PDF apenas para autorizados, encerrados e cancelados */}
                              {(mdfe.status.toUpperCase() === 'AUTORIZADO' || mdfe.status.toUpperCase() === 'ENCERRADO' || mdfe.status.toUpperCase() === 'CANCELADO') && (
                                <button
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Baixar PDF do DAMDFE"
                                  onClick={() => handleBaixarPDF(mdfe.id, mdfe.numero)}
                                  disabled={processando === mdfe.id}
                                >
                                  {processando === mdfe.id ? (
                                    <Icon name="spinner" className="animate-spin" />
                                  ) : (
                                    <Icon name="file-pdf" />
                                  )}
                                </button>
                              )}

                              {/* Transmitir rascunhos */}
                              {mdfe.status.toUpperCase() === 'RASCUNHO' && (
                                <button
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Transmitir MDFe"
                                  onClick={() => handleTransmitir(mdfe.id, mdfe.numero)}
                                  disabled={processando === mdfe.id}
                                >
                                  {processando === mdfe.id ? (
                                    <Icon name="spinner" className="animate-spin" />
                                  ) : (
                                    <Icon name="paper-plane" />
                                  )}
                                </button>
                              )}

                              {/* Duplicar sempre disponível (exceto cancelados) */}
                              {mdfe.status.toUpperCase() !== 'CANCELADO' && (
                                <button
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Duplicar MDFe"
                                  onClick={() => navigate(`/mdfes/duplicar/${mdfe.id}`)}
                                  disabled={processando === mdfe.id}
                                >
                                  <Icon name="copy" />
                                </button>
                              )}

                              {/* Excluir (apenas rascunhos e rejeitados) */}
                              {(mdfe.status.toUpperCase() === 'RASCUNHO' || mdfe.status.toUpperCase() === 'REJEITADO') && (
                                <button
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  title="Excluir MDFe"
                                  onClick={() => setMdfeParaExcluir({ id: mdfe.id, numero: mdfe.numero })}
                                >
                                  <Icon name="trash" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-0">
                    <Pagination
                      currentPage={paginaAtual}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
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