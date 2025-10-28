import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { cargosService, Cargo } from '../../../services/cargosService';
import { GenericViewModal } from '../../../components/UI/feedback/GenericViewModal';
import { ConfirmDeleteModal } from '../../../components/UI/feedback/ConfirmDeleteModal';
import { createUsuarioConfigWithCargos } from '../../../components/Usuarios/UsuarioConfigWithCargos';
import Icon from '../../../components/UI/Icon';
import { Icon as ThemedIcon } from '../../../ui';

interface User {
  id: number;
  nome: string;
  username?: string;
  cargoId?: number;
  cargoNome?: string;
  ativo: boolean;
  dataCriacao: string;
  ultimoLogin?: string;
  password?: string;
}

export function ListarUsuarios() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtro temporários
  const [filtroTemp, setFiltroTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');
  const [filtroCargoTemp, setFilterCargoTemp] = useState('');

  // Estados de filtro aplicados
  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');

  // Estados dos modais CRUD
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const usuarioConfig = useMemo(() => {
    const cargosOptions = cargos
      .filter(c => c.ativo)
      .map(c => ({ value: c.id, label: c.nome }));
    return createUsuarioConfigWithCargos(cargosOptions);
  }, [cargos]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar cargos
      const cargosData = await cargosService.listarCargos();
      setCargos(cargosData);

      // Carregar usuários reais
      const usersResult = await authService.getUsers();
      if (usersResult.sucesso && usersResult.data) {
        setUsers(usersResult.data);
      } else {
        console.error('Erro ao carregar usuários:', usersResult.mensagem);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirNovo = () => {
    navigate('/admin/usuarios/novo');
  };

  const abrirEdicao = (user: User) => {
    navigate(`/admin/usuarios/${user.id}/editar`, { state: { user } });
  };

  const abrirVisualizacao = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const abrirExclusao = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const fecharModalVisualizacao = () => {
    setViewModalOpen(false);
    setSelectedUser(null);
  };

  const fecharModalExclusao = () => {
    setDeleteModalOpen(false);
    setSelectedUser(null);
    setDeleting(false);
  };

  const excluirUsuario = async () => {
    if (!selectedUser?.id) return;

    try {
      setDeleting(true);
      const result = await authService.deleteUser(selectedUser.id);
      
      if (result.sucesso) {
        setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
        fecharModalExclusao();
      } else {
        console.error('Erro ao desativar usuário:', result.mensagem);
        throw new Error(result.mensagem || 'Erro ao desativar usuário');
      }
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  const limparFiltros = () => {
    setFiltro('');
    setFiltroStatus('');
    setFiltroCargo('');
  };

  // Aplicar filtros
  const usuariosFiltrados = users.filter(user => {
    const matchFiltro = !filtro ||
      user.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(filtro.toLowerCase()));

    const matchStatus = !filtroStatus ||
      (filtroStatus === 'ativo' && user.ativo) ||
      (filtroStatus === 'inativo' && !user.ativo);

    const matchCargo = !filtroCargo ||
      (user.cargoId && user.cargoId.toString() === filtroCargo);

    return matchFiltro && matchStatus && matchCargo;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando usuários...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-indigo-600/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-500 dark:from-indigo-600 dark:via-indigo-500 dark:to-indigo-400" aria-hidden="true" />
              <span className="absolute inset-0 opacity-40 blur-lg bg-indigo-600" aria-hidden="true" />
              <div className="relative h-full w-full flex items-center justify-center">
                <ThemedIcon name="users" className="!text-white text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Usuários</h1>
              <p className="text-muted-foreground text-lg">Gerencie os usuários cadastrados no sistema</p>
            </div>
          </div>
          <button
            onClick={abrirNovo}
            className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Icon name="plus" size="lg" />
            <span>Novo Usuário</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="grid grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Nome ou username..."
                value={filtroTemp}
                onChange={(e) => setFiltroTemp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (setFiltro(filtroTemp), setFiltroStatus(filtroStatusTemp), setFiltroCargo(filtroCargoTemp))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filtroStatusTemp}
                onChange={(e) => setFiltroStatusTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cargo</label>
              <select
                value={filtroCargoTemp}
                onChange={(e) => setFilterCargoTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              >
                <option value="">Todos os cargos</option>
                {cargos.map(cargo => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={() => { setFiltro(filtroTemp); setFiltroStatus(filtroStatusTemp); setFiltroCargo(filtroCargoTemp); }}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Icon name="search" />
                Filtrar
              </button>
            </div>

            <div>
              <button
                onClick={() => { setFiltroTemp(''); setFiltroStatusTemp(''); setFilterCargoTemp(''); setFiltro(''); setFiltroStatus(''); setFiltroCargo(''); }}
                className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!filtroTemp && !filtroStatusTemp && !filtroCargoTemp}
              >
                <Icon name="times" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Indicador de filtros ativos */}
        {(filtro || filtroStatus || filtroCargo) && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-indigo-800 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                Filtros ativos:
                {filtro && <span className="ml-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-800 rounded text-xs">{filtro}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
                {filtroCargo && <span className="ml-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-800 rounded text-xs">{cargos.find(c => c.id.toString() === filtroCargo)?.nome}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {usuariosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="users" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtro || filtroStatus || filtroCargo) ? 'Nenhum usuário encontrado com os filtros aplicados' : 'Nenhum usuário encontrado'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtro || filtroStatus || filtroCargo) ? 'Tente ajustar os filtros ou limpar para ver todos os usuários.' : 'Adicione um novo usuário para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div>Nome</div>
                <div>Username</div>
                <div>Cargo</div>
                <div>Status</div>
                <div className="text-center">Ações</div>
              </div>

              {usuariosFiltrados.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-150 items-center"
                >
                  <div className="text-foreground font-semibold">{user.nome}</div>
                  <div className="text-muted-foreground">{user.username || '-'}</div>
                  <div className="text-muted-foreground">{user.cargoNome || '-'}</div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.ativo
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                    >
                      <Icon name={user.ativo ? 'check-circle' : 'times-circle'} />
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Visualizar"
                      onClick={() => abrirVisualizacao(user)}
                    >
                      <Icon name="eye" />
                    </button>
                    {user.username !== 'programador' && (
                      <>
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          title="Editar"
                          onClick={() => abrirEdicao(user)}
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Desativar"
                          onClick={() => abrirExclusao(user)}
                        >
                          <Icon name="trash" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Modal de visualização */}
        <GenericViewModal
          isOpen={viewModalOpen}
          onClose={fecharModalVisualizacao}
          item={selectedUser}
          title={usuarioConfig.view.title}
          subtitle={usuarioConfig.view.subtitle}
          headerIcon={usuarioConfig.view.headerIcon}
          headerColor={usuarioConfig.view.headerColor}
          sections={selectedUser ? usuarioConfig.view.getSections(selectedUser) : []}
          actions={selectedUser && selectedUser.username !== 'programador' ? [{
            label: 'Editar',
            icon: 'edit',
            variant: 'warning' as const,
            onClick: () => {
              fecharModalVisualizacao();
              abrirEdicao(selectedUser);
            }
          }] : []}
        />

        {/* Modal de desativação */}
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={fecharModalExclusao}
          onConfirm={excluirUsuario}
          title="Desativar Usuário"
          message={selectedUser ? `Tem certeza que deseja desativar o usuário "${selectedUser.nome}"?` : 'Tem certeza que deseja desativar este usuário?'}
          itemName={selectedUser?.nome || 'usuário'}
          loading={deleting}
        />
      </div>
    </div>
  );
}
