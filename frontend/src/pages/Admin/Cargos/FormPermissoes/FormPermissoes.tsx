import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FormPageLayout } from '../../../../components/UI/layout/FormPageLayout';
import { permissoesService } from '../../../../services/permissoesService';
import { Icon } from '../../../../ui';

interface Permission {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface LocationState {
  cargo?: {
    id: number;
    nome: string;
  };
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
  const [filtroAtivas, setFiltroAtivas] = useState<'todas' | 'marcadas' | 'desmarcadas'>('todas');

  useEffect(() => {
    carregarDados();
  }, [cargoId]);

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
    setPermissoesSelecionadas(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleToggleAll = () => {
    const permissoesFiltradas = getPermissoesFiltradas();
    const todosIds = permissoesFiltradas.map(p => p.id);
    const todosMarcados = todosIds.every(id => permissoesSelecionadas.includes(id));

    if (todosMarcados) {
      // Desmarcar todos os filtrados
      setPermissoesSelecionadas(prev => prev.filter(id => !todosIds.includes(id)));
    } else {
      // Marcar todos os filtrados
      const novosIds = Array.from(new Set([...permissoesSelecionadas, ...todosIds]));
      setPermissoesSelecionadas(novosIds);
    }
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

  const getPermissoesFiltradas = () => {
    let filtradas = permissoes.filter(p => p.ativo);

    // Filtro de busca
    if (searchTerm) {
      filtradas = filtradas.filter(
        p =>
          p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de marcadas/desmarcadas
    if (filtroAtivas === 'marcadas') {
      filtradas = filtradas.filter(p => permissoesSelecionadas.includes(p.id));
    } else if (filtroAtivas === 'desmarcadas') {
      filtradas = filtradas.filter(p => !permissoesSelecionadas.includes(p.id));
    }

    return filtradas;
  };

  const permissoesFiltradas = getPermissoesFiltradas();
  const totalSelecionadas = permissoesSelecionadas.length;
  const totalDisponiveis = permissoes.filter(p => p.ativo).length;

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
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Card de informações */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="info-circle" className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-1">
                Sobre Permissões
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                As permissões controlam o acesso dos usuários às diferentes funcionalidades do sistema. 
                Selecione as permissões que deseja atribuir ao cargo <strong>{cargoNome}</strong>.
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-purple-700 dark:text-purple-300">
                <span className="flex items-center gap-1">
                  <Icon name="check-circle" size="sm" />
                  <strong>{totalSelecionadas}</strong> selecionadas
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="list" size="sm" />
                  <strong>{totalDisponiveis}</strong> disponíveis
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e busca */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6">
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

            <div className="col-span-4">
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
                onClick={handleToggleAll}
                disabled={permissoesFiltradas.length === 0}
                className="w-full px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-lg font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                title={permissoesFiltradas.every(p => permissoesSelecionadas.includes(p.id)) ? 'Desmarcar Todos' : 'Marcar Todos'}
              >
                <Icon name={permissoesFiltradas.every(p => permissoesSelecionadas.includes(p.id)) ? 'times' : 'check'} size="sm" />
                {permissoesFiltradas.every(p => permissoesSelecionadas.includes(p.id)) ? 'Desmarcar' : 'Marcar'}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de permissões */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 px-6 py-3 border-b border-border">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Icon name="list-check" />
              Permissões Disponíveis
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {permissoesFiltradas.length} encontrada(s)
              </span>
            </h3>
          </div>

          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {permissoesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Icon name="search" className="text-2xl text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma permissão encontrada
                </h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || filtroAtivas !== 'todas'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Não há permissões disponíveis no momento.'}
                </p>
              </div>
            ) : (
              permissoesFiltradas.map((permissao) => {
                const isSelecionada = permissoesSelecionadas.includes(permissao.id);

                return (
                  <label
                    key={permissao.id}
                    className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                      isSelecionada ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''
                    }`}
                  >
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelecionada}
                        onChange={() => handleToggle(permissao.id)}
                        className="w-5 h-5 text-purple-600 bg-background border-border rounded focus:ring-2 focus:ring-purple-500/20 transition-colors"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {permissao.nome}
                        </h4>
                        {isSelecionada && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                            <Icon name="check" size="sm" />
                            Ativa
                          </span>
                        )}
                      </div>
                      {permissao.descricao && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {permissao.descricao}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
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
