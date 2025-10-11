import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import { cargosService, Cargo } from '../../../services/cargosService';
import { UsuarioCRUD } from '../../../components/Usuarios/UsuarioCRUD';
import Icon from '../../../components/UI/Icon';

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

export function Usuarios() {
  const { user: currentUser } = useAuth();
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
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const abrirModalNovo = () => {
    setSelectedUser(null);
    setIsEdit(false);
    setFormModalOpen(true);
  };

  const abrirModalEdicao = (user: User) => {
    setSelectedUser(user);
    setIsEdit(true);
    setFormModalOpen(true);
  };

  const abrirModalVisualizacao = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const abrirModalExclusao = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const fecharModais = () => {
    setViewModalOpen(false);
    setFormModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedUser(null);
    setIsEdit(false);
    setSaving(false);
    setDeleting(false);
  };

  const salvarUsuario = async (data: User) => {
    try {
      setSaving(true);

      if (isEdit && data.id) {
        // Editar usuário existente
        console.log('Editando usuário:', data.id, data);
        // TODO: Implementar API de edição quando estiver disponível
        setUsers(prev => prev.map(user =>
          user.id === data.id ? { ...user, ...data } : user
        ));
      } else {
        // Criar novo usuário
        const result = await authService.register({
          nome: data.nome,
          username: data.username,
          password: data.password || '',
          cargoId: data.cargoId
        });

        if (result.sucesso) {
          await loadData();
        } else {
          throw new Error(result.mensagem || 'Erro ao criar usuário');
        }
      }

      fecharModais();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const excluirUsuario = async () => {
    if (!selectedUser?.id) return;

    try {
      setDeleting(true);
      // TODO: Implementar API de exclusão quando estiver disponível
      console.log('Excluindo usuário:', selectedUser.id);
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      fecharModais();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  const editarDoModal = (user: User) => {
    setViewModalOpen(false);
    abrirModalEdicao(user);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-2 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-users text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Usuários</h1>
              <p className="text-muted-foreground text-lg">Gerencie os usuários com acesso ao sistema MDFe</p>
            </div>
          </div>
          <button
            onClick={abrirModalNovo}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-plus text-lg"></i>
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filtroStatusTemp}
                onChange={(e) => setFiltroStatusTemp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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
                className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="filter" className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Filtros ativos:
                {filtro && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">{filtro}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
                {filtroCargo && <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-xs">{cargos.find(c => c.id.toString() === filtroCargo)?.nome}</span>}
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
                <div className="text-center">Nome</div>
                <div className="text-center">Username</div>
                <div className="text-center">Cargo</div>
                <div className="text-center">Status</div>
                <div className="text-center">Ações</div>
              </div>

              {usuariosFiltrados.map((user) => (
                <div key={user.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-background dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{user.nome}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-foreground">{user.username || '-'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-foreground">{user.cargoNome || '-'}</div>
                  </div>
                  <div className="text-center flex justify-center">
                    <span className={`text-sm font-semibold ${
                      user.ativo
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="text-center flex justify-center gap-2">
                    <button
                      onClick={() => abrirModalVisualizacao(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                      title="Visualizar"
                    >
                      <Icon name="eye" size="sm" />
                    </button>
                    <button
                      onClick={() => abrirModalEdicao(user)}
                      className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors duration-200"
                      title="Editar"
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      onClick={() => abrirModalExclusao(user)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      title="Excluir"
                    >
                      <Icon name="trash" size="sm" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Componente de CRUD de Usuários */}
        <UsuarioCRUD
          viewModalOpen={viewModalOpen}
          formModalOpen={formModalOpen}
          deleteModalOpen={deleteModalOpen}
          selectedUsuario={selectedUser}
          isEdit={isEdit}
          cargos={cargos}
          onViewClose={() => setViewModalOpen(false)}
          onFormClose={() => setFormModalOpen(false)}
          onDeleteClose={() => setDeleteModalOpen(false)}
          onSave={salvarUsuario}
          onEdit={editarDoModal}
          onDelete={excluirUsuario}
          saving={saving}
          deleting={deleting}
        />
      </div>
    </div>
  );
}