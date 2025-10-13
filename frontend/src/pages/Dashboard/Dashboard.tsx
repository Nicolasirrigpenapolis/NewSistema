import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { entitiesService } from '../../services/entitiesService';
import { manutencoesService, ManutencaoListItem } from '../../services/manutencoesService';
import { viagensService, Viagem } from '../../services/viagensService';
import { fornecedoresService } from '../../services/fornecedoresService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../components/UI/card';
import {
  TrendingUp,
  Truck,
  Users,
  ClipboardList,
  Wrench,
  Calendar,
  Building2,
  Briefcase,
  Zap,
  BarChart3,
  Navigation2,
  LineChart
} from 'lucide-react';

interface DashboardStats {
  totalVeiculos: number;
  veiculosAtivos: number;
  totalCondutores: number;
  condutoresAtivos: number;
  totalViagens: number;
  viagensEmAndamento: number;
  totalManutencoes: number;
  manutencoesAgendadas: number;
  totalContratantes: number;
  totalSeguradoras: number;
  totalEmitentes: number;
  emitentesAtivos: number;
  totalFornecedores: number;
}

interface AtividadeRecente {
  id: string;
  tipo: 'Viagem' | 'Manutenção';
  titulo: string;
  descricao?: string;
  dataReferencia: string;
  status?: string;
}

const initialStats: DashboardStats = {
  totalVeiculos: 0,
  veiculosAtivos: 0,
  totalCondutores: 0,
  condutoresAtivos: 0,
  totalViagens: 0,
  viagensEmAndamento: 0,
  totalManutencoes: 0,
  manutencoesAgendadas: 0,
  totalContratantes: 0,
  totalSeguradoras: 0,
  totalEmitentes: 0,
  emitentesAtivos: 0,
  totalFornecedores: 0
};

export function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [carregando, setCarregando] = useState(false);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [manutencoes, setManutencoes] = useState<ManutencaoListItem[]>([]);

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
        fornecedoresRes,
        manutencoesRes,
        viagensRes
      ] = await Promise.allSettled([
        entitiesService.obterEmitentes(),
        entitiesService.obterVeiculos(),
        entitiesService.obterCondutores(),
        entitiesService.obterContratantes(),
        entitiesService.obterSeguradoras(),
        fornecedoresService.getFornecedores({ pageSize: 1000 }),
        manutencoesService.getManutencoes({ pageSize: 100, page: 1, sortBy: 'dataManutencao', sortDirection: 'desc' }),
        viagensService.listar()
      ]);

      const emitentes = emitentesRes.status === 'fulfilled' ? emitentesRes.value ?? [] : [];
      const veiculos = veiculosRes.status === 'fulfilled' ? veiculosRes.value ?? [] : [];
      const condutores = condutoresRes.status === 'fulfilled' ? condutoresRes.value ?? [] : [];
      const contratantes = contratantesRes.status === 'fulfilled' ? contratantesRes.value ?? [] : [];
      const seguradoras = seguradorasRes.status === 'fulfilled' ? seguradorasRes.value ?? [] : [];

      const fornecedoresData =
        fornecedoresRes.status === 'fulfilled' && fornecedoresRes.value.success
          ? fornecedoresRes.value.data
          : null;

      const fornecedoresTotal = fornecedoresData
        ? fornecedoresData.totalItems ??
          (fornecedoresData as any).totalItens ??
          fornecedoresData.items?.length ??
          (fornecedoresData as any).itens?.length ??
          0
        : 0;

      const manutencoesData =
        manutencoesRes.status === 'fulfilled' && manutencoesRes.value.success
          ? manutencoesRes.value.data
          : null;

      const manutencoesLista: ManutencaoListItem[] = manutencoesData
        ? manutencoesData.items ??
          (manutencoesData as any).Itens ??
          (manutencoesData as any).items ??
          []
        : [];

      const viagensLista =
        viagensRes.status === 'fulfilled' &&
        viagensRes.value.success &&
        viagensRes.value.data
          ? viagensRes.value.data
          : [];

      setManutencoes(manutencoesLista);
      setViagens(viagensLista);

      const agora = new Date();

      const veiculosAtivos = veiculos.filter((v: any) => v.ativo !== false).length;
      const condutoresAtivos = condutores.filter((c: any) => c.ativo !== false).length;
      const emitentesAtivos = emitentes.filter((e: any) => e.ativo !== false).length;

      const viagensEmAndamento = viagensLista.filter((viagem) => {
        if (!viagem) return false;
        if (!viagem.dataFim) return true;
        return new Date(viagem.dataFim) > agora;
      }).length;

      const manutencoesAgendadas = manutencoesLista.filter((manutencao) => {
        if (!manutencao?.dataManutencao) return false;
        return new Date(manutencao.dataManutencao) >= agora;
      }).length;

      setStats({
        totalVeiculos: veiculos.length,
        veiculosAtivos,
        totalCondutores: condutores.length,
        condutoresAtivos,
        totalViagens: viagensLista.length,
        viagensEmAndamento,
        totalManutencoes: manutencoesLista.length,
        manutencoesAgendadas,
        totalContratantes: contratantes.length,
        totalSeguradoras: seguradoras.length,
        totalEmitentes: emitentes.length,
        emitentesAtivos,
        totalFornecedores: fornecedoresTotal
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const formatCurrency = (value: number | undefined | null) => {
    const safeValue = typeof value === 'number' ? value : 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(safeValue);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Sem data';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const veiculosAtivosPercent = useMemo(() => {
    if (!stats.totalVeiculos) return 0;
    return Math.round((stats.veiculosAtivos / stats.totalVeiculos) * 100);
  }, [stats.totalVeiculos, stats.veiculosAtivos]);

  const condutoresAtivosPercent = useMemo(() => {
    if (!stats.totalCondutores) return 0;
    return Math.round((stats.condutoresAtivos / stats.totalCondutores) * 100);
  }, [stats.totalCondutores, stats.condutoresAtivos]);

  const proximasManutencoes = useMemo(() => {
    const agora = new Date();
    return manutencoes
      .filter((manutencao) => {
        if (!manutencao?.dataManutencao) return false;
        return new Date(manutencao.dataManutencao) >= agora;
      })
      .sort((a, b) => new Date(a.dataManutencao).getTime() - new Date(b.dataManutencao).getTime())
      .slice(0, 5);
  }, [manutencoes]);

  const viagensRecentes = useMemo(() => {
    return [...viagens]
      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
      .slice(0, 5);
  }, [viagens]);

  const viagensEmAndamentoLista = useMemo(() => {
    const agora = new Date();
    return viagens
      .filter((viagem) => {
        if (!viagem) return false;
        if (!viagem.dataFim) return true;
        return new Date(viagem.dataFim) > agora;
      })
      .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
      .slice(0, 5);
  }, [viagens]);

  const atividadesRecentes: AtividadeRecente[] = useMemo(() => {
    const atividades: AtividadeRecente[] = [
      ...viagensRecentes.map((viagem) => ({
        id: `viagem-${viagem.id}`,
        tipo: 'Viagem' as const,
        titulo: viagem.veiculoPlaca
          ? `Viagem com ${viagem.veiculoPlaca}`
          : `Viagem #${viagem.id ?? '-'}`,
        descricao: viagem.motoristaNome || viagem.condutorNome || 'Sem motorista definido',
        dataReferencia: viagem.dataInicio,
        status: viagem.dataFim ? 'Finalizada' : 'Em andamento'
      })),
      ...manutencoes
        .slice(0, 10)
        .map((manutencao) => ({
          id: `manutencao-${manutencao.id}`,
          tipo: 'Manutenção' as const,
          titulo: manutencao.veiculoPlaca
            ? `Manutenção em ${manutencao.veiculoPlaca}`
            : `Manutenção #${manutencao.id}`,
          descricao: manutencao.descricao,
          dataReferencia: manutencao.dataManutencao,
          status: new Date(manutencao.dataManutencao) >= new Date()
            ? 'Programada'
            : 'Concluída'
        }))
    ];

    return atividades
      .sort((a, b) => new Date(b.dataReferencia).getTime() - new Date(a.dataReferencia).getTime())
      .slice(0, 8);
  }, [viagensRecentes, manutencoes]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Painel de Gestão</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe rapidamente a saúde operacional, financeira e de cadastros da empresa.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={() => handleNavigate('/viagens/nova')}
        >
          <Zap className="w-4 h-4" />
          Criar planejamento
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="hover:shadow-lg transition-all hover:scale-[1.01] border-l-4 border-l-orange-500 cursor-pointer" onClick={() => handleNavigate('/veiculos')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frota</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
              <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVeiculos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.veiculosAtivos} em operação ({veiculosAtivosPercent}% ativos)
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-[1.01] border-l-4 border-l-blue-500 cursor-pointer" onClick={() => handleNavigate('/condutores')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motoristas</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCondutores}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.condutoresAtivos} ativos ({condutoresAtivosPercent}%)
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-[1.01] border-l-4 border-l-emerald-500 cursor-pointer" onClick={() => handleNavigate('/viagens')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operações</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <Navigation2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViagens}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.viagensEmAndamento} viagens em andamento
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:scale-[1.01] border-l-4 border-l-purple-500 cursor-pointer" onClick={() => handleNavigate('/manutencoes')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalManutencoes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.manutencoesAgendadas} agendadas nos próximos dias
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Atividades recentes</CardTitle>
                <CardDescription>Monitoramento de viagens e manutenções registradas.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {atividadesRecentes.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                Nenhuma atividade registrada recentemente.
              </div>
            ) : (
              atividadesRecentes.map((atividade) => (
                <div
                  key={atividade.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {atividade.tipo === 'Viagem' ? (
                        <TrendingUp className="w-5 h-5 text-primary" />
                      ) : (
                        <Wrench className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{atividade.titulo}</p>
                      {atividade.descricao && (
                        <p className="text-xs text-muted-foreground">{atividade.descricao}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:text-right">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(atividade.dataReferencia)}
                    </span>
                    {atividade.status && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {atividade.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Indicadores de operação</CardTitle>
                <CardDescription>Nível de utilização dos recursos principais.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Frota ativa</span>
                <span className="font-semibold">{veiculosAtivosPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-orange-500 transition-all"
                  style={{ width: `${veiculosAtivosPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.veiculosAtivos} de {stats.totalVeiculos} veículos disponíveis
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Equipe em atividade</span>
                <span className="font-semibold">{condutoresAtivosPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${condutoresAtivosPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.condutoresAtivos} de {stats.totalCondutores} motoristas disponíveis
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Agenda de manutenção</span>
                <span className="font-semibold">
                  {stats.totalManutencoes ? Math.round((stats.manutencoesAgendadas / Math.max(stats.totalManutencoes, 1)) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-purple-500 transition-all"
                  style={{
                    width: stats.totalManutencoes
                      ? `${Math.round((stats.manutencoesAgendadas / Math.max(stats.totalManutencoes, 1)) * 100)}%`
                      : '0%'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.manutencoesAgendadas} manutenções programadas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Agenda de manutenção</CardTitle>
                <CardDescription>Próximas inspeções e serviços programados.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximasManutencoes.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                Nenhuma manutenção agendada.
              </div>
            ) : (
              proximasManutencoes.map((manutencao) => (
                <div
                  key={manutencao.id}
                  className="rounded-lg border p-3 hover:bg-accent/50 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{manutencao.veiculoPlaca || `Veículo #${manutencao.veiculoId}`}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {formatDate(manutencao.dataManutencao)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{manutencao.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    Valor previsto: {formatCurrency(manutencao.valorTotal)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Navigation2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Viagens em andamento</CardTitle>
                <CardDescription>Operações que ainda não foram encerradas.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {viagensEmAndamentoLista.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                Nenhuma viagem em andamento no momento.
              </div>
            ) : (
              viagensEmAndamentoLista.map((viagem) => (
                <div
                  key={viagem.id}
                  className="rounded-lg border p-3 hover:bg-accent/50 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{viagem.veiculoPlaca || `Viagem #${viagem.id}`}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Início: {formatDate(viagem.dataInicio)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Motorista: {viagem.motoristaNome || viagem.condutorNome || 'Não informado'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {viagem.dataFim ? `Prev. término: ${formatDate(viagem.dataFim)}` : 'Sem previsão de término'}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Ações rápidas</CardTitle>
                <CardDescription>Atividades frequentes para acelerar o dia a dia.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
              onClick={() => handleNavigate('/viagens/nova')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Registrar nova viagem</div>
                  <div className="text-xs text-muted-foreground">Planejar rota e custos</div>
                </div>
              </div>
              <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </button>

            <button
              className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
              onClick={() => handleNavigate('/manutencoes/nova')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Registrar manutenção</div>
                  <div className="text-xs text-muted-foreground">Controle de serviços da frota</div>
                </div>
              </div>
              <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </button>

            <button
              className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
              onClick={() => handleNavigate('/fornecedores/novo')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Adicionar fornecedor</div>
                  <div className="text-xs text-muted-foreground">Controle da rede de apoio</div>
                </div>
              </div>
              <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </button>

            <button
              className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
              onClick={() => handleNavigate('/relatorios/manutencao')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Abrir relatórios</div>
                  <div className="text-xs text-muted-foreground">Análises financeiras e operacionais</div>
                </div>
              </div>
              <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Cadastros estratégicos</CardTitle>
                <CardDescription>Visão dos principais parceiros e empresas envolvidas.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Empresas emitentes</span>
              <span className="font-semibold">
                {stats.totalEmitentes} ({stats.emitentesAtivos} ativas)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Clientes / contratantes</span>
              <span className="font-semibold">{stats.totalContratantes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Seguradoras</span>
              <span className="font-semibold">{stats.totalSeguradoras}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fornecedores</span>
              <span className="font-semibold">{stats.totalFornecedores}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Planejamento integrado</CardTitle>
                <CardDescription>Centralize todas as frentes da operação em um só lugar.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              O dashboard reúne as principais frentes do negócio: frota, pessoas, viagens, manutenção,
              cadastros e parceiros. Use os atalhos e indicadores para antecipar demandas e tomar decisões rápidas.
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Monitoramento operacional em tempo real</li>
              <li>Agenda única para serviços e deslocamentos</li>
              <li>Visão consolidada de parceiros e fornecedores</li>
              <li>Integração com relatórios financeiros e de compliance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
