import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import { permissoesService } from '../../../services/permissoesService';
import { Icon } from '../../../ui';

interface Permission {
  id: number;
  nome: string;
  descricao?: string;
  modulo: string;
  ativo: boolean;
  codigo: string;
}

interface PermissionWithChildren extends Permission {
  children?: PermissionWithChildren[];
  isChild?: boolean;
  parentId?: number;
  tipo?: 'view' | 'action';
}

interface PermissionGroup {
  modulo: string;
  moduloLabel: string;
  icon: string;
  color: string;
  permissoes: PermissionWithChildren[];
}

interface LocationState {
  cargo?: {
    id: number;
    nome: string;
  };
}

// Palavra-chave que identifica a permissão PAI (guia principal)
const PALAVRAS_PAI = ['listar', 'relatório', 'relatorio'];

// Palavras que identificam AÇÕES/CRUD (permissões filhas)
const PALAVRAS_CRUD = ['visualizar', 'criar', 'editar', 'desativar', 'excluir', 'deletar', 'atualizar', 'gerenciar', 'enviar', 'aprovar', 'cancelar', 'consultar'];

function extrairContexto(nome: string): string {
  const todasPalavras = [...PALAVRAS_PAI, ...PALAVRAS_CRUD];
  const nomeNormalizado = todasPalavras.reduce((acc, palavra) => acc.replace(palavra, ''), nome.toLowerCase());
  return nomeNormalizado.trim();
}

function determinarTipo(permissao: Permission): 'view' | 'action' {
  const nome = permissao.nome.toLowerCase();
  const codigoParte = permissao.codigo.split('.')[1] ?? '';

  // Se contém "listar" ou "relatório", é a permissão PAI (view principal)
  if (PALAVRAS_PAI.some(p => nome.includes(p) || codigoParte.includes(p))) {
    return 'view';
  }

  // Caso contrário, é uma ação (CRUD)
  if (PALAVRAS_CRUD.some(p => nome.includes(p) || codigoParte.includes(p))) {
    return 'action';
  }

  // Fallback: se não identificar, trata como action
  return 'action';
}

function criarHierarquiaPermissoes(perms: Permission[]): PermissionWithChildren[] {
  const mapa = new Map<number, PermissionWithChildren>();
  const contextoPais = new Map<string, PermissionWithChildren>();
  const resultado: PermissionWithChildren[] = [];

  const getContexto = (permissao: Permission) => {
    if (permissao.codigo.includes('.')) {
      return permissao.codigo.split('.')[0];
    }
    return extrairContexto(permissao.nome);
  };

  perms.forEach(p => {
    mapa.set(p.id, { ...p, children: [], tipo: determinarTipo(p) });
  });

  perms.forEach(permissao => {
    const perm = mapa.get(permissao.id)!;
    const contexto = getContexto(permissao);

    if (perm.tipo === 'view') {
      if (!contextoPais.has(contexto)) {
        contextoPais.set(contexto, perm);
      }
    }
  });

  perms.forEach(permissao => {
    const perm = mapa.get(permissao.id)!;
    if (perm.tipo !== 'action') return;

    const contexto = getContexto(permissao);
    const parent = contextoPais.get(contexto);

    if (parent) {
      perm.isChild = true;
      perm.parentId = parent.id;
      parent.children?.push(perm);
    }
  });

  mapa.forEach(perm => {
    if (!perm.isChild) {
      if (perm.children && perm.children.length > 0) {
        const idsUnicos = new Set<number>();
        perm.children = perm.children.filter(child => {
          if (idsUnicos.has(child.id)) return false;
          idsUnicos.add(child.id);
          return true;
        });
      }

      resultado.push(perm);
    }
  });

  return resultado;
}

export function FormPermissoes() {
  const { cargoId } = useParams<{ cargoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [cargoNome, setCargoNome] = useState<string>(state?.cargo?.nome || 'Cargo');
  const [permissoes, setPermissoes] = useState<Permission[]>([]);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroModulo, setFiltroModulo] = useState<string>('');
  const [filtroAtivas, setFiltroAtivas] = useState<'todas' | 'marcadas' | 'desmarcadas'>('todas');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const permissoesHierarquizadas = useMemo(() => criarHierarquiaPermissoes(permissoes), [permissoes]);

  const mapaPermissoesCompleto = useMemo(() => {
    const mapa = new Map<number, PermissionWithChildren>();

    const percorrer = (lista: PermissionWithChildren[]) => {
      lista.forEach(perm => {
        mapa.set(perm.id, perm);
        if (perm.children && perm.children.length > 0) {
          percorrer(perm.children);
        }
      });
    };

    percorrer(permissoesHierarquizadas);
    return mapa;
  }, [permissoesHierarquizadas]);

  useEffect(() => {
    carregarDados();
  }, [cargoId]);

  useEffect(() => {
    // Expandir todos os módulos por padrão
    if (permissoesHierarquizadas.length > 0) {
      const modulos = new Set(permissoesHierarquizadas.map(p => p.modulo || 'Outros'));
      setExpandedModules(modulos);
    }
  }, [permissoesHierarquizadas]);

  const carregarDados = async () => {
    if (!cargoId) return;

    setLoading(true);
    setError(null);

    try {
      // Carregar todas as permissões
      const todasPermissoes = await permissoesService.getAllPermissoes();
      setPermissoes(todasPermissoes || []);

      // Carregar permissões do cargo
      const permissoesCargo = await permissoesService.getPermissoesByCargo(Number(cargoId));
      const idsPermissoes = permissoesCargo.map((p) => p.id);
      setPermissoesSelecionadas(idsPermissoes);
    } catch (err: any) {
      console.error('Erro ao carregar permissões:', err);
      setError(err.message || 'Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (permissionId: number) => {
    const permissaoCompleta = mapaPermissoesCompleto.get(permissionId);

    setPermissoesSelecionadas(prev => {
      const isAtualmenteSelecionada = prev.includes(permissionId);
      const filhosIds = permissaoCompleta?.children?.map(child => child.id) ?? [];

      if (isAtualmenteSelecionada) {
        // Desmarcando: remover essa permissão e todas as suas filhas
        const idsParaRemover = [permissionId, ...filhosIds];
        return prev.filter(id => !idsParaRemover.includes(id));
      } else {
        // Marcando: adicionar essa permissão
        let novosIds = [...prev, permissionId];

        // Se for uma permissão PAI (principal), marcar TODAS as filhas automaticamente
        if (permissaoCompleta?.children && permissaoCompleta.children.length > 0) {
          novosIds = [...novosIds, ...filhosIds];
        }

        // Se for uma permissão filha, garantir que o pai está marcado
        if (permissaoCompleta?.isChild && permissaoCompleta.parentId) {
          if (!novosIds.includes(permissaoCompleta.parentId)) {
            novosIds.push(permissaoCompleta.parentId);
          }
        }
        
        return Array.from(new Set(novosIds)); // Remove duplicatas
      }
    });
  };

  const handleSalvar = async () => {
    if (!cargoId) return;

    setSaving(true);
    setError(null);

    try {
      await permissoesService.atualizarPermissoesCargo(Number(cargoId), permissoesSelecionadas);
      navigate('/admin/cargos');
    } catch (err: any) {
      console.error('Erro ao salvar permissões:', err);
      setError(err.message || 'Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    navigate('/admin/cargos');
  };

  const getModuloConfig = (modulo: string) => {
    const configs: Record<string, { label: string; icon: string; color: string }> = {
      'Operacoes': { label: 'Operações', icon: 'truck', color: 'blue' },
      'Documentos': { label: 'Documentos Fiscais', icon: 'file-invoice', color: 'green' },
      'Cadastros': { label: 'Cadastros', icon: 'address-book', color: 'yellow' },
      'Manutencoes': { label: 'Manutenções', icon: 'tools', color: 'orange' },
      'Inteligencia': { label: 'Relatórios', icon: 'chart-line', color: 'purple' },
      'Administracao': { label: 'Administração', icon: 'cog', color: 'red' }
    };
    return configs[modulo] || { label: modulo, icon: 'folder', color: 'gray' };
  };

  const agruparPorModulo = (lista: PermissionWithChildren[]): PermissionGroup[] => {
    const grupos = new Map<string, PermissionWithChildren[]>();

    lista.forEach(p => {
      if (!p.ativo || p.isChild) return;

      const modulo = p.modulo || 'Outros';
      if (!grupos.has(modulo)) {
        grupos.set(modulo, []);
      }
      grupos.get(modulo)!.push(p);
    });

    return Array.from(grupos.entries()).map(([modulo, perms]) => {
      const config = getModuloConfig(modulo);
      return {
        modulo,
        moduloLabel: config.label,
        icon: config.icon,
        color: config.color,
        permissoes: perms.sort((a, b) => a.nome.localeCompare(b.nome))
      };
    }).sort((a, b) => a.moduloLabel.localeCompare(b.moduloLabel));
  };

  const getPermissoesFiltradas = (lista: PermissionWithChildren[]) => {
    let grupos = agruparPorModulo(lista);

    const normalizar = (valor: string | undefined) => valor?.toLowerCase() ?? '';
    const termoBusca = normalizar(searchTerm);

    const filtrarPermissao = (permissao: PermissionWithChildren): PermissionWithChildren | null => {
      const nomeMatch = normalizar(permissao.nome).includes(termoBusca);
      const descricaoMatch = normalizar(permissao.descricao).includes(termoBusca);

      let filhosFiltrados = permissao.children ?? [];

      if (termoBusca) {
        filhosFiltrados = (permissao.children ?? []).filter(child =>
          normalizar(child.nome).includes(termoBusca) || normalizar(child.descricao).includes(termoBusca)
        );
      }

      const filhoMarcado = filhosFiltrados.length > 0;

      if (termoBusca && !nomeMatch && !descricaoMatch && !filhoMarcado) {
        return null;
      }

      return {
        ...permissao,
        children: filhosFiltrados
      };
    };

    // Filtro de módulo
    if (filtroModulo) {
      grupos = grupos.filter(g => g.modulo === filtroModulo);
    }

    // Filtro de busca
    if (termoBusca) {
      grupos = grupos.map(g => {
        const permissoesFiltradas = g.permissoes
          .map(filtrarPermissao)
          .filter((p): p is PermissionWithChildren => p !== null);

        return {
          ...g,
          permissoes: permissoesFiltradas
        };
      }).filter(g => g.permissoes.length > 0);
    }

    // Filtro de marcadas/desmarcadas
    if (filtroAtivas !== 'todas') {
      grupos = grupos.map(g => {
        const permissoesFiltradas = g.permissoes
          .map(permissao => {
            const ids = [permissao.id, ...(permissao.children?.map(c => c.id) ?? [])];
            const possuiMarcadas = ids.some(id => permissoesSelecionadas.includes(id));
            const possuiDesmarcadas = ids.some(id => !permissoesSelecionadas.includes(id));

            if (filtroAtivas === 'marcadas' && !possuiMarcadas) return null;
            if (filtroAtivas === 'desmarcadas' && !possuiDesmarcadas) return null;

            if (filtroAtivas === 'marcadas') {
              const filhosMarcados = (permissao.children ?? []).filter(child => permissoesSelecionadas.includes(child.id));
              return {
                ...permissao,
                children: filhosMarcados
              };
            }

            if (filtroAtivas === 'desmarcadas') {
              const filhosDesmarcados = (permissao.children ?? []).filter(child => !permissoesSelecionadas.includes(child.id));
              return {
                ...permissao,
                children: filhosDesmarcados
              };
            }

            return permissao;
          })
          .filter((p): p is PermissionWithChildren => p !== null);

        return {
          ...g,
          permissoes: permissoesFiltradas
        };
      }).filter(g => g.permissoes.length > 0);
    }

    return grupos;
  };

  const gruposPermissoes = getPermissoesFiltradas(permissoesHierarquizadas);
  const totalSelecionadas = permissoesSelecionadas.length;
  const totalDisponiveis = permissoes.filter(p => p.ativo).length;

  const toggleModule = (modulo: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(modulo)) {
      newExpanded.delete(modulo);
    } else {
      newExpanded.add(modulo);
    }
    setExpandedModules(newExpanded);
  };

  const toggleModuleAll = (grupo: PermissionGroup) => {
    const todosIds = grupo.permissoes.flatMap(p => [p.id, ...(p.children?.map(c => c.id) ?? [])]);
    const todosMarcados = todosIds.every(id => permissoesSelecionadas.includes(id));

    if (todosMarcados) {
      setPermissoesSelecionadas(prev => prev.filter(id => !todosIds.includes(id)));
    } else {
      const novosIds = Array.from(new Set([...permissoesSelecionadas, ...todosIds]));
      setPermissoesSelecionadas(novosIds);
    }
  };

  return (
    <FormPageLayout
      title={`Permissões do Cargo: ${cargoNome}`}
      subtitle="Gerencie as permissões atribuídas a este cargo"
      iconName="shield-alt"
      headerColor="#8b5cf6"
      onBack={handleCancelar}
      isLoading={loading}
      loadingMessage="Carregando permissões..."
      error={error}
    >
      <div className="space-y-4">
        {/* Filtros e busca */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Buscar Permissão
              </label>
              <div className="relative">
                <Icon 
                  name="search" 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome ou descrição..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Filtrar por Módulo
              </label>
              <select
                value={filtroModulo}
                onChange={(e) => setFiltroModulo(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">Todos os Módulos</option>
                {agruparPorModulo(permissoesHierarquizadas).map(g => (
                  <option key={g.modulo} value={g.modulo}>{g.moduloLabel}</option>
                ))}
              </select>
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Filtrar por Status
              </label>
              <select
                value={filtroAtivas}
                onChange={(e) => setFiltroAtivas(e.target.value as any)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="todas">Todas</option>
                <option value="marcadas">Apenas Marcadas</option>
                <option value="desmarcadas">Apenas Desmarcadas</option>
              </select>
            </div>

            <div className="col-span-2 flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFiltroModulo('');
                  setFiltroAtivas('todas');
                }}
                disabled={!searchTerm && !filtroModulo && filtroAtivas === 'todas'}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Icon name="times" size="sm" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de permissões agrupadas por módulo */}
        <div className="space-y-4">
          {gruposPermissoes.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Icon name="search" className="text-2xl text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma permissão encontrada
                </h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || filtroModulo || filtroAtivas !== 'todas'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Não há permissões disponíveis no momento.'}
                </p>
              </div>
            </div>
          ) : (
            gruposPermissoes.map((grupo) => {
              const isExpanded = expandedModules.has(grupo.modulo);
              const totalPermissoesModulo = grupo.permissoes.reduce((acc, p) => acc + 1 + (p.children?.length ?? 0), 0);
              const totalMarcadas = grupo.permissoes.reduce((acc, p) => {
                const marcadas = permissoesSelecionadas.includes(p.id) ? 1 : 0;
                const marcadasFilhos = p.children?.filter(child => permissoesSelecionadas.includes(child.id)).length ?? 0;
                return acc + marcadas + marcadasFilhos;
              }, 0);
              const todosMarcados = grupo.permissoes
                .flatMap(p => [p.id, ...(p.children?.map(c => c.id) ?? [])])
                .every(id => permissoesSelecionadas.includes(id));

              const getColorClasses = (color: string) => {
                const colors: Record<string, { bg: string; border: string; text: string; icon: string; badge: string }> = {
                  blue: { 
                    bg: 'bg-blue-50 dark:bg-blue-900/20', 
                    border: 'border-blue-200 dark:border-blue-800',
                    text: 'text-blue-900 dark:text-blue-100',
                    icon: 'bg-blue-500 text-white',
                    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  },
                  green: { 
                    bg: 'bg-green-50 dark:bg-green-900/20', 
                    border: 'border-green-200 dark:border-green-800',
                    text: 'text-green-900 dark:text-green-100',
                    icon: 'bg-green-500 text-white',
                    badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  },
                  yellow: { 
                    bg: 'bg-yellow-50 dark:bg-yellow-900/20', 
                    border: 'border-yellow-200 dark:border-yellow-800',
                    text: 'text-yellow-900 dark:text-yellow-100',
                    icon: 'bg-yellow-500 text-white',
                    badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  },
                  orange: { 
                    bg: 'bg-orange-50 dark:bg-orange-900/20', 
                    border: 'border-orange-200 dark:border-orange-800',
                    text: 'text-orange-900 dark:text-orange-100',
                    icon: 'bg-orange-500 text-white',
                    badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                  },
                  purple: { 
                    bg: 'bg-purple-50 dark:bg-purple-900/20', 
                    border: 'border-purple-200 dark:border-purple-800',
                    text: 'text-purple-900 dark:text-purple-100',
                    icon: 'bg-purple-500 text-white',
                    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  },
                  red: { 
                    bg: 'bg-red-50 dark:bg-red-900/20', 
                    border: 'border-red-200 dark:border-red-800',
                    text: 'text-red-900 dark:text-red-100',
                    icon: 'bg-red-500 text-white',
                    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }
                };
                return colors[color] || colors.blue;
              };

              const colors = getColorClasses(grupo.color);

              return (
                <div key={grupo.modulo} className="bg-card rounded-xl shadow-sm overflow-hidden">
                  {/* Cabeçalho do Módulo */}
                  <div className={`${colors.bg} px-4 py-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon name={grupo.icon} className="text-lg" />
                        </div>
                        <div>
                          <h3 className={`font-bold ${colors.text} flex items-center gap-2`}>
                            {grupo.moduloLabel}
                            <span className={`px-2 py-0.5 ${colors.badge} rounded-full text-xs font-medium`}>
                              {totalMarcadas}/{totalPermissoesModulo}
                            </span>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {totalPermissoesModulo} {totalPermissoesModulo === 1 ? 'permissão' : 'permissões'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleModuleAll(grupo)}
                          className={`px-3 py-1.5 ${colors.badge} rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity`}
                          title={todosMarcados ? 'Desmarcar todas' : 'Marcar todas'}
                        >
                          <Icon name={todosMarcados ? 'times' : 'check-double'} size="sm" className="inline mr-1" />
                          {todosMarcados ? 'Desmarcar' : 'Marcar'} todas
                        </button>
                        <button
                          onClick={() => toggleModule(grupo.modulo)}
                          className={`p-2 ${colors.badge} rounded-lg hover:opacity-80 transition-all`}
                        >
                          <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo do Módulo */}
                  {isExpanded && (
                    <div className="p-4 space-y-3">
                      {/* Layout Organizado: Nome da permissão → Ações que pode fazer */}
                      {grupo.permissoes.map((permissao) => {
                        const isSelecionada = permissoesSelecionadas.includes(permissao.id);
                        const isPrincipal = permissao.nome.toLowerCase().includes('listar') || 
                                           permissao.nome.toLowerCase().includes('relatório') ||
                                           permissao.nome.toLowerCase().includes('relatorio');
                        const hasChildren = permissao.children && permissao.children.length > 0;
                        
                        return (
                          <div key={permissao.id} className="space-y-2">
                            {/* Permissão Principal */}
                            <div 
                              className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                                isSelecionada
                                  ? 'bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                  : 'bg-background hover:bg-accent/40 shadow-none'
                              }`}
                            >
                              {/* Checkbox */}
                              <div className="flex items-center h-6 mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={isSelecionada}
                                  onChange={() => handleToggle(permissao.id)}
                                  className="w-5 h-5 text-blue-600 bg-background border-border rounded focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer"
                                />
                              </div>

                              {/* Ícone do tipo de permissão */}
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isPrincipal 
                                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                                  : 'bg-green-100 dark:bg-green-900/30'
                              }`}>
                                <Icon 
                                  name={isPrincipal ? 'list' : 'edit'} 
                                  className={isPrincipal ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'} 
                                />
                              </div>

                              {/* Conteúdo da permissão */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  {/* Nome e Descrição */}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-semibold text-foreground text-base">
                                        {permissao.nome}
                                      </h5>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        isPrincipal 
                                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      }`}>
                                        {isPrincipal ? 'Guia Principal' : 'Ação'}
                                      </span>
                                      {hasChildren && (
                                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                          {permissao.children!.length} {permissao.children!.length === 1 ? 'ação' : 'ações'}
                                        </span>
                                      )}
                                    </div>
                                    {permissao.descricao && (
                                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                                        <Icon name="arrow-right" size="sm" className="inline mr-1 text-blue-500" />
                                        {permissao.descricao}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Sub-permissões (Ações: Visualizar modal, Criar, Editar, Desativar) */}
                            {hasChildren && isSelecionada && (
                              <div className="ml-16 space-y-2 pl-4">
                                {permissao.children!.map((child) => {
                                  const isChildSelecionada = permissoesSelecionadas.includes(child.id);
                                  
                                  return (
                                    <div
                                      key={child.id}
                                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                                        isChildSelecionada
                                          ? 'bg-green-50 dark:bg-green-900/15 shadow-sm'
                                          : 'bg-background hover:bg-accent/40'
                                      }`}
                                    >
                                      {/* Checkbox */}
                                      <div className="flex items-center h-5 mt-0.5">
                                        <input
                                          type="checkbox"
                                          checked={isChildSelecionada}
                                          onChange={() => handleToggle(child.id)}
                                          className="w-4 h-4 text-green-600 bg-background border-border rounded focus:ring-2 focus:ring-green-500/20 transition-colors cursor-pointer"
                                        />
                                      </div>

                                      {/* Ícone da ação */}
                                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <Icon 
                                          name="check" 
                                          className="text-green-600 dark:text-green-400 text-sm" 
                                        />
                                      </div>

                                      {/* Conteúdo */}
                                      <div className="flex-1 min-w-0">
                                        <h6 className="font-medium text-foreground text-sm mb-0.5">
                                          {child.nome}
                                        </h6>
                                        {child.descricao && (
                                          <p className="text-xs text-muted-foreground leading-relaxed">
                                            {child.descricao}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-end gap-3 bg-card rounded-xl border border-border p-4">
          <button
            type="button"
            onClick={handleCancelar}
            disabled={saving}
            className="px-6 py-2.5 border-2 border-border rounded-xl text-foreground font-semibold hover:bg-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <Icon name="save" size="sm" />
                Salvar Permissões
              </>
            )}
          </button>
        </div>
      </div>
    </FormPageLayout>
  );
}
