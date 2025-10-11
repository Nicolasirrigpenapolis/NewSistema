import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { entitiesService } from '../../services/entitiesService';
import { mdfeService } from '../../services/mdfeService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/UI/card';
import { TrendingUp, FileText, CheckCircle2, Clock, Building2, Truck, Users, AlertCircle, ChevronRight, Zap, BarChart3, Activity } from 'lucide-react';

interface DashboardStats {
  totalMDFes: number;
  mdfesPendentes: number;
  mdfesAutorizados: number;
  totalVeiculos: number;
  veiculosAtivos: number;
  totalCondutores: number;
  condutoresAtivos: number;
  totalEmitentes: number;
  emitentesAtivos: number;
  totalContratantes: number;
  totalSeguradoras: number;
  totalMunicipios: number;
}

interface RecentMDFe {
  id: number;
  numero: string;
  serie: string;
  dataEmissao: string;
  status: string;
  emitenteNome?: string;
  valorTotal?: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalMDFes: 0,
    mdfesPendentes: 0,
    mdfesAutorizados: 0,
    totalVeiculos: 0,
    veiculosAtivos: 0,
    totalCondutores: 0,
    condutoresAtivos: 0,
    totalEmitentes: 0,
    emitentesAtivos: 0,
    totalContratantes: 0,
    totalSeguradoras: 0,
    totalMunicipios: 0,
  });
  const [recentMDFes, setRecentMDFes] = useState<RecentMDFe[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    try {
      setCarregando(true);

      const [
        emitentesRes,
        veiculosRes,
        condutoresRes,
        contratantesRes,
        seguradorasRes,
        municipiosRes,
        mdfesRes
      ] = await Promise.allSettled([
        entitiesService.obterEmitentes(),
        entitiesService.obterVeiculos(),
        entitiesService.obterCondutores(),
        entitiesService.obterContratantes(),
        entitiesService.obterSeguradoras(),
        fetch('https://localhost:5001/api/municipios?tamanhoPagina=1&pagina=1').then(res => res.json()),
        mdfeService.listarMDFes({ tamanhoPagina: 1000 })
      ]);

      let emitentes: any[] = [];
      if (emitentesRes.status === 'fulfilled') {
        emitentes = emitentesRes.value || [];
      }

      let veiculos: any[] = [];
      if (veiculosRes.status === 'fulfilled') {
        veiculos = veiculosRes.value || [];
      }

      let condutores: any[] = [];
      if (condutoresRes.status === 'fulfilled') {
        condutores = condutoresRes.value || [];
      }

      let contratantes: any[] = [];
      if (contratantesRes.status === 'fulfilled') {
        contratantes = contratantesRes.value || [];
      }

      let seguradoras: any[] = [];
      if (seguradorasRes.status === 'fulfilled') {
        seguradoras = seguradorasRes.value || [];
      }

      let totalMunicipios = 0;
      if (municipiosRes.status === 'fulfilled') {
        const municipiosData = municipiosRes.value;
        totalMunicipios = municipiosData?.totalItens || 0;
      }

      let mdfes: any[] = [];
      if (mdfesRes.status === 'fulfilled' && mdfesRes.value.sucesso && mdfesRes.value.dados) {
        const dados = mdfesRes.value.dados;
        mdfes = dados.Itens || dados.Items || dados.itens || dados.items || dados || [];
      }

      setStats({
        totalMDFes: mdfes.length,
        mdfesPendentes: mdfes.filter((m: any) => m.status === 'Pendente').length,
        mdfesAutorizados: mdfes.filter((m: any) => m.status === 'Autorizado').length,
        totalVeiculos: veiculos.length,
        veiculosAtivos: veiculos.filter((v: any) => v.ativo).length,
        totalCondutores: condutores.length,
        condutoresAtivos: condutores.filter((c: any) => c.ativo).length,
        totalEmitentes: emitentes.length,
        emitentesAtivos: emitentes.filter((e: any) => e.ativo).length,
        totalContratantes: contratantes.length,
        totalSeguradoras: seguradoras.length,
        totalMunicipios: totalMunicipios,
      });

      const mdfesRecentes = mdfes
        .sort((a: any, b: any) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime())
        .slice(0, 5);
      setRecentMDFes(mdfesRecentes);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Autorizado':
        return {
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
        };
      case 'Pendente':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
        };
      case 'Cancelado':
      case 'Rejeitado':
        return {
          variant: 'destructive' as const,
          icon: AlertCircle,
          className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: FileText,
          className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        };
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Visão geral do sistema de gestão</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={() => navigate('/veiculos')}
        >
          <Zap className="w-4 h-4" />
          Ações Rápidas
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-orange-500" onClick={() => handleNavigate('veiculos')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
              <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVeiculos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.veiculosAtivos} em operação
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-blue-500" onClick={() => handleNavigate('condutores')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motoristas</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCondutores}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.condutoresAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-emerald-500" onClick={() => handleNavigate('contratantes')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContratantes}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Activity className="w-3 h-3" />
              Cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-purple-500" onClick={() => handleNavigate('fornecedores')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSeguradoras + stats.totalMunicipios}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Parceiros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <CardTitle>Atividade Recente</CardTitle>
              </div>
              <button
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                onClick={() => handleNavigate('mdfes')}
              >
                Ver todos
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <CardDescription>Últimos MDF-es emitidos no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMDFes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum MDF-e emitido</h3>
                <p className="text-muted-foreground mb-6">Comece emitindo seu primeiro manifesto eletrônico</p>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handleNavigate('mdfe-editor')}
                >
                  <Zap className="w-4 h-4" />
                  Emitir primeiro MDF-e
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMDFes.map((mdfe) => {
                  const statusConfig = getStatusConfig(mdfe.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div key={mdfe.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium mb-1">
                          MDF-e Nº {mdfe.numero}/{mdfe.serie}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>{mdfe.emitenteNome}</span>
                          <span>{formatDate(mdfe.dataEmissao)}</span>
                          {mdfe.valorTotal && <span>{formatCurrency(mdfe.valorTotal)}</span>}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {mdfe.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <CardTitle>Ações Rápidas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                onClick={() => handleNavigate('mdfe-editor')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Novo MDF-e</div>
                    <div className="text-xs text-muted-foreground">Emitir manifesto</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <button
                className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                onClick={() => handleNavigate('veiculos')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Veículos</div>
                    <div className="text-xs text-muted-foreground">Gerenciar frota</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <button
                className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                onClick={() => handleNavigate('condutores')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Condutores</div>
                    <div className="text-xs text-muted-foreground">Motoristas</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <button
                className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                onClick={() => handleNavigate('emitentes')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Emitentes</div>
                    <div className="text-xs text-muted-foreground">Empresas</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </CardContent>
          </Card>

          {/* System Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <CardTitle>Resumo do Sistema</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contratantes</span>
                <span className="font-semibold">{stats.totalContratantes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Seguradoras</span>
                <span className="font-semibold">{stats.totalSeguradoras}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Municípios</span>
                <span className="font-semibold">{stats.totalMunicipios}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
