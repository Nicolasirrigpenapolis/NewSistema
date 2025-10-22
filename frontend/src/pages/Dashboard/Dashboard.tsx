import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { entitiesService } from '../../services/entitiesService';
import { manutencoesService, ManutencaoListItem } from '../../services/manutencoesService';
import { viagensService, Viagem, ViagensPagedResponse } from '../../services/viagensService';
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
  Briefcase,
  Zap,
  BarChart3,
  Navigation2
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
        fornecedoresService.getFornecedores({ pageSize: 100 }),
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

      const viagensLista: Viagem[] =
        viagensRes.status === 'fulfilled' &&
        viagensRes.value.success &&
        viagensRes.value.data
          ? viagensRes.value.data.items
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Painel de Gestão</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe rapidamente a saúde operacional, financeira e de cadastros da empresa.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {/* Card Frota */}
        <Card
          className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2"
          onClick={() => handleNavigate('/veiculos')}
        >
          <CardContent className="pt-8 px-8 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                    Frota Total
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    {stats.totalVeiculos}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center shadow-sm">
                  <Truck className="h-7 w-7 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                </div>
              </div>
              <div className="pt-5 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Em operação
                  </span>
                  <span className="text-sm font-bold">
                    {stats.veiculosAtivos}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Motoristas */}
        <Card
          className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2"
          onClick={() => handleNavigate('/condutores')}
        >
          <CardContent className="pt-8 px-8 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                    Motoristas
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    {stats.totalCondutores}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center shadow-sm">
                  <Users className="h-7 w-7 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
                </div>
              </div>
              <div className="pt-5 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Ativos agora
                  </span>
                  <span className="text-sm font-bold">
                    {stats.condutoresAtivos}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Operações */}
        <Card
          className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2"
          onClick={() => handleNavigate('/viagens')}
        >
          <CardContent className="pt-8 px-8 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                    Operações
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    {stats.totalViagens}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center shadow-sm">
                  <Navigation2 className="h-7 w-7 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
                </div>
              </div>
              <div className="pt-5 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Em andamento
                  </span>
                  <span className="text-sm font-bold">
                    {stats.viagensEmAndamento}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Manutenções */}
        <Card
          className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2"
          onClick={() => handleNavigate('/manutencoes')}
        >
          <CardContent className="pt-8 px-8 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
                    Manutenções
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    {stats.totalManutencoes}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/20 flex items-center justify-center shadow-sm">
                  <Wrench className="h-7 w-7 text-orange-600 dark:text-orange-400 fill-orange-600 dark:fill-orange-400" />
                </div>
              </div>
              <div className="pt-5 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Agendadas
                  </span>
                  <span className="text-sm font-bold">
                    {stats.manutencoesAgendadas}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
              onClick={() => handleNavigate('/relatorios/manutencoes-veiculos')}
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
    </div>
  );
}
