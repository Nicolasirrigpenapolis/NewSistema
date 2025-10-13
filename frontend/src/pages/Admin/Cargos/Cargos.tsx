import React, { useState, useEffect } from 'react';
import { ConfirmDeleteModal } from '../../../components/UI/feedback/ConfirmDeleteModal';
import { GenericFormModal } from '../../../components/UI/feedback/GenericFormModal';
import { cargosService, Cargo } from '../../../services/cargosService';
import { useAuth } from '../../../contexts/AuthContext';
import { ModernPermissionModal } from '../../../components/Admin/ModernPermissionModal';
import { cargoConfig, CargoFormData } from '../../../components/Admin/CargoConfig';
import { Icon } from '../../../ui';

export function Cargos() {
  const { user } = useAuth();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [filtroTemp, setFiltroTemp] = useState('');
  const [filtroStatusTemp, setFiltroStatusTemp] = useState('');
  const [filtroDescricaoTemp, setFiltroDescricaoTemp] = useState('');

  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDescricao, setFiltroDescricao] = useState('');

  // Estados para modais
  const [modalFormulario, setModalFormulario] = useState(false);
  const [cargoSelecionado, setCargoSelecionado] = useState<Cargo | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Estados do modal de exclusão
  const [modalExclusao, setModalExclusao] = useState(false);
  const [cargoExclusao, setCargoExclusao] = useState<Cargo | null>(null);
  const [excludindo, setExcluindo] = useState(false);

  // Estados do modal de permissões
  const [modalPermissoes, setModalPermissoes] = useState(false);
  const [cargoPermissoes, setCargoPermissoes] = useState<Cargo | null>(null);

  // Verificar se usuário é Programador
  const isProgramador = user?.cargoNome === 'Programador';

  useEffect(() => {
    carregarCargos();
  }, []);

  const carregarCargos = async () => {
    setCarregando(true);
    try {
      console.log('Cargos: Iniciando carregamento dos cargos...');
      const data = await cargosService.listarCargos();
      console.log('Cargos: Dados recebidos:', data);
      console.log('Cargos: Quantidade de cargos:', data.length);
      setCargos(data);
    } catch (error) {
      console.error('Cargos: Erro ao carregar cargos:', error);
    } finally {
      setCarregando(false);
    }
  };

  const cargosFiltrados = cargos.filter(cargo => {
    const matchNome = !filtro || cargo.nome.toLowerCase().includes(filtro.toLowerCase());
    const matchDescricao = !filtroDescricao || cargo.descricao?.toLowerCase().includes(filtroDescricao.toLowerCase());
    const matchStatus = !filtroStatus ||
      (filtroStatus === 'ativo' && cargo.ativo) ||
      (filtroStatus === 'inativo' && !cargo.ativo);

    return matchNome && matchDescricao && matchStatus;
  });

  const limparFiltros = () => {
    setFiltro('');
    setFiltroDescricao('');
    setFiltroStatus('');
  };

  const abrirModalCriar = () => {
    setCargoSelecionado(null);
    setModoEdicao(false);
    setModalFormulario(true);
  };

  const abrirModalEditar = (cargo: Cargo) => {
    setCargoSelecionado(cargo);
    setModoEdicao(true);
    setModalFormulario(true);
  };

  const fecharModalFormulario = () => {
    setModalFormulario(false);
    setCargoSelecionado(null);
    setModoEdicao(false);
  };

  const handleSalvar = async (dados: CargoFormData) => {
    try {
      if (modoEdicao && cargoSelecionado?.id) {
        await cargosService.atualizarCargo(cargoSelecionado.id, {
          nome: dados.nome,
          descricao: dados.descricao,
          ativo: dados.ativo ?? true
        });
      } else {
        await cargosService.criarCargo({
          nome: dados.nome,
          descricao: dados.descricao
        });
      }

      fecharModalFormulario();
      carregarCargos();
    } catch (error: any) {
      console.error('Erro ao salvar cargo:', error);
      alert(`Erro ao salvar cargo: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const abrirModalExclusao = (cargo: Cargo) => {
    setCargoExclusao(cargo);
    setModalExclusao(true);
  };

  const fecharModalExclusao = () => {
    setModalExclusao(false);
    setCargoExclusao(null);
    setExcluindo(false);
  };

  const abrirModalPermissoes = (cargo: Cargo) => {
    setCargoPermissoes(cargo);
    setModalPermissoes(true);
  };

  const fecharModalPermissoes = () => {
    setModalPermissoes(false);
    setCargoPermissoes(null);
  };

  const confirmarExclusao = async () => {
    if (!cargoExclusao?.id) return;

    try {
      setExcluindo(true);
      await cargosService.excluirCargo(cargoExclusao.id);
      fecharModalExclusao();
      carregarCargos();
    } catch (error: any) {
      alert(`Erro ao excluir cargo: ${error.message}`);
      setExcluindo(false);
    }
  };


  if (!isProgramador) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <Icon name="lock" className="text-gray-400 mx-auto mb-4" size="lg" />
          <h3 className="text-lg font-medium text-foreground mb-2">Acesso Restrito</h3>
          <p className="text-gray-500">
            Apenas usuários com cargo 'Programador' podem gerenciar cargos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-user-cog text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Cargos</h1>
              <p className="text-muted-foreground text-lg">Gerencie os cargos e permissões do sistema</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={abrirModalCriar}
          >
            <i className="fas fa-plus text-lg"></i>
            <span>Novo Cargo</span>
          </button>
        </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
        <div className="grid grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Buscar por Nome</label>
            <input
              type="text"
              placeholder="Nome do cargo..."
              value={filtroTemp}
              onChange={(e) => setFiltroTemp(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (setFiltro(filtroTemp), setFiltroDescricao(filtroDescricaoTemp), setFiltroStatus(filtroStatusTemp))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Buscar por Descrição</label>
            <input
              type="text"
              placeholder="Descrição do cargo..."
              value={filtroDescricaoTemp}
              onChange={(e) => setFiltroDescricaoTemp(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (setFiltro(filtroTemp), setFiltroDescricao(filtroDescricaoTemp), setFiltroStatus(filtroStatusTemp))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={filtroStatusTemp}
              onChange={(e) => setFiltroStatusTemp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => { setFiltro(filtroTemp); setFiltroDescricao(filtroDescricaoTemp); setFiltroStatus(filtroStatusTemp); }}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Icon name="search" />
              Filtrar
            </button>
          </div>

          <div>
            <button
              onClick={() => { setFiltroTemp(''); setFiltroDescricaoTemp(''); setFiltroStatusTemp(''); setFiltro(''); setFiltroDescricao(''); setFiltroStatus(''); }}
              className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!filtroTemp && !filtroDescricaoTemp && !filtroStatusTemp}
            >
              <Icon name="times" />
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de filtros ativos */}
      {(filtro || filtroDescricao || filtroStatus) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <Icon name="filter" className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Filtros ativos:
              {filtro && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">Nome: {filtro}</span>}
              {filtroDescricao && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">Descrição: {filtroDescricao}</span>}
              {filtroStatus && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
            </span>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm">
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando cargos...</span>
            </div>
          </div>
        ) : cargosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <Icon name="briefcase" className="text-gray-400 mx-auto mb-4" size="lg" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum cargo encontrado</h3>
            <p className="text-gray-500 mb-4">
              {filtro ? 'Nenhum cargo corresponde aos critérios de busca.' : 'Adicione um novo cargo para começar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-4 p-4 bg-muted border-b border-border font-semibold text-foreground">
              <div>Nome</div>
              <div>Descrição</div>
              <div>Usuários</div>
              <div>Status</div>
              <div>Permissões</div>
              <div>Ações</div>
            </div>
            {cargosFiltrados.map((cargo) => (
              <div key={cargo.id} className="grid grid-cols-6 gap-4 p-4 border-b border-border hover:bg-muted transition-colors duration-200">
                <div>
                  <strong className="text-foreground">{cargo.nome}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {cargo.descricao || '-'}
                  </span>
                </div>
                <div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-xs font-medium">
                    {cargo.quantidadeUsuarios} usuário(s)
                  </span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cargo.ativo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {cargo.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div>
                  <button
                    className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded text-xs font-medium hover:bg-purple-200 transition-colors duration-200"
                    onClick={() => abrirModalPermissoes(cargo)}
                    title="Gerenciar Permissões"
                  >
                    <Icon name="shield" size="sm" className="inline mr-1" />
                    Gerenciar
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                    onClick={() => abrirModalEditar(cargo)}
                    title="Editar"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    onClick={() => abrirModalExclusao(cargo)}
                    title="Excluir"
                    disabled={cargo.quantidadeUsuarios > 0}
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <GenericFormModal
        isOpen={modalFormulario}
        onClose={fecharModalFormulario}
        config={cargoConfig}
        data={cargoSelecionado}
        onSave={handleSalvar}
        isEditing={modoEdicao}
      />

      {/* Modal de Exclusão */}
      <ConfirmDeleteModal
        isOpen={modalExclusao}
        title="Excluir Cargo"
        message="Tem certeza de que deseja excluir este cargo?"
        itemName={cargoExclusao ? cargoExclusao.nome : ''}
        onConfirm={confirmarExclusao}
        onClose={fecharModalExclusao}
        loading={excludindo}
      />

      {/* Modal Moderno de Gerenciamento de Permissões */}
      <ModernPermissionModal
        cargoId={cargoPermissoes?.id || 0}
        cargoNome={cargoPermissoes?.nome || ''}
        isOpen={modalPermissoes}
        onClose={fecharModalPermissoes}
        onPermissionsChange={() => {
          // Recarregar dados se necessário
          console.log('Permissões atualizadas');
        }}
      />
      </div>
    </div>
  );
}