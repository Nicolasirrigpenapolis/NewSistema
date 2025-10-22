import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button } from '../../../ui';
import { mdfeService } from '../../../services/mdfeService';
import { useEmitente } from '../../../contexts/EmitenteContext';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Trash2,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/UI/card';

interface MDFeListItem {
  id: number;
  numero: number;
  serie: number;
  chave?: string;
  status: string;
  dataEmissao?: string;
  emitenteNome?: string;
  valorTotal?: number;
  ufInicio?: string;
  ufFim?: string;
}

export function MdfeVisaoGeral() {
  const navigate = useNavigate();
  const { emitente } = useEmitente();
  const [loading, setLoading] = useState(true);
  const [mdfes, setMdfes] = useState<MDFeListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [criandoNovo, setCriandoNovo] = useState(false);

  const carregar = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mdfeService.listarMDFes({
        emitenteId: emitente?.id || undefined,
        pagina,
        tamanhoPagina: 20
      });

      if (response.sucesso && response.dados) {
        const items = response.dados.items || response.dados.data || response.dados || [];
        setMdfes(Array.isArray(items) ? items : []);
        
        if (response.dados.totalPages) {
          setTotalPaginas(response.dados.totalPages);
        }
      } else {
        setError(response.mensagem || 'Erro ao carregar MDF-e');
      }
    } catch (err) {
      console.error('Erro ao carregar MDF-e:', err);
      setError('Erro inesperado ao carregar os manifestos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, emitente?.id]);

  const handleNovoMDFe = async () => {
    try {
      setCriandoNovo(true);
      setError(null);

      const response = await mdfeService.novoMDFe();

      if (response.sucesso && response.dados?.id) {
        // Redirecionar para edição do MDF-e criado
        navigate(`/mdfe/${response.dados.id}/editar`);
      } else {
        setError(response.mensagem || 'Erro ao criar novo MDF-e');
      }
    } catch (err) {
      console.error('Erro ao criar MDF-e:', err);
      setError('Erro inesperado ao criar novo MDF-e');
    } finally {
      setCriandoNovo(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este MDF-e?')) return;
    
    try {
      const response = await mdfeService.excluirMDFe(id);
      
      if (response.sucesso) {
        await carregar();
      } else {
        alert(response.mensagem || 'Erro ao excluir MDF-e');
      }
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Erro inesperado ao excluir');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
      'Autorizado': {
        label: 'Autorizado',
        icon: <CheckCircle2 className="w-4 h-4" />,
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      },
      'Cancelado': {
        label: 'Cancelado',
        icon: <XCircle className="w-4 h-4" />,
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      },
      'Rascunho': {
        label: 'Rascunho',
        icon: <Clock className="w-4 h-4" />,
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      },
      'Processando': {
        label: 'Processando',
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      },
      'Rejeitado': {
        label: 'Rejeitado',
        icon: <AlertCircle className="w-4 h-4" />,
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      }
    };

    const config = statusMap[status] || statusMap['Rascunho'];

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Estatísticas calculadas
  const estatisticas = useMemo(() => {
    const total = mdfes.length;
    const autorizados = mdfes.filter(m => m.status === 'Autorizado').length;
    const rascunhos = mdfes.filter(m => m.status === 'Rascunho').length;
    const cancelados = mdfes.filter(m => m.status === 'Cancelado').length;
    const valorTotal = mdfes.reduce((sum, m) => sum + (m.valorTotal || 0), 0);
    
    return {
      total,
      autorizados,
      rascunhos,
      cancelados,
      valorTotal,
      percentualAutorizado: total > 0 ? Math.round((autorizados / total) * 100) : 0
    };
  }, [mdfes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando manifestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">MDF-e</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os Manifestos Eletrônicos de Documentos Fiscais
            </p>
          </div>
        </div>

        <Button 
          onClick={handleNovoMDFe} 
          disabled={criandoNovo}
          className="flex items-center gap-2"
        >
          {criandoNovo ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Novo MDF-e
            </>
          )}
        </Button>
      </header>

      {/* Cards de Estatísticas - Estilo Dashboard */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Card Total de MDF-e */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2">
          <CardContent className="pt-8 px-8 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                    Total de MDF-e
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    {estatisticas.total}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center shadow-sm">
                  <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
              </div>
              <div className="pt-5 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Autorizados
                  </span>
                  <span className="text-sm font-bold flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    {estatisticas.percentualAutorizado}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Autorizados */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2">
          <CardContent className="pt-8 px-8 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                    Autorizados
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    {estatisticas.autorizados}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" strokeWidth={2} />
                </div>
              </div>
              <div className="pt-5 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Documentos válidos
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {estatisticas.autorizados}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Rascunhos */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2">
          <CardContent className="pt-8 px-8 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                    Rascunhos
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    {estatisticas.rascunhos}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 flex items-center justify-center shadow-sm">
                  <Clock className="h-7 w-7 text-yellow-600 dark:text-yellow-400" strokeWidth={2} />
                </div>
              </div>
              <div className="pt-5 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Aguardando envio
                  </span>
                  <span className="text-sm font-bold">
                    {estatisticas.rascunhos}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Valor Total */}
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2">
          <CardContent className="pt-8 px-8 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                    Valor Total
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    {formatCurrency(estatisticas.valorTotal).replace('R$', '').trim()}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center shadow-sm">
                  <DollarSign className="h-7 w-7 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                </div>
              </div>
              <div className="pt-5 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Em manifestos
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {estatisticas.total}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        {mdfes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum MDF-e encontrado
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Comece criando seu primeiro manifesto eletrônico
            </p>
            <Button onClick={() => navigate('/mdfe/novo')}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro MDF-e
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Número/Série
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Data Emissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Percurso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mdfes.map((mdfe) => (
                    <tr 
                      key={mdfe.id} 
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {mdfe.numero || '-'} / {mdfe.serie || '-'}
                        </div>
                        {mdfe.chave && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {mdfe.chave.substring(0, 20)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(mdfe.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(mdfe.dataEmissao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {mdfe.ufInicio && mdfe.ufFim ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium">{mdfe.ufInicio}</span>
                            <span>→</span>
                            <span className="font-medium">{mdfe.ufFim}</span>
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                        {formatCurrency(mdfe.valorTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/mdfe/${mdfe.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {mdfe.status === 'Rascunho' && (
                            <button
                              onClick={() => handleExcluir(mdfe.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Página {pagina} de {totalPaginas}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
