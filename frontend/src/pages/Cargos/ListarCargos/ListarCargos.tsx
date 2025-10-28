import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDeleteModal } from '../../../components/UI/feedback/ConfirmDeleteModal';
import { GenericFormModal } from '../../../components/UI/feedback/GenericFormModal';
import { cargosService, Cargo } from '../../../services/cargosService';
import { useAuth } from '../../../contexts/AuthContext';
import { cargoConfig, CargoFormData } from '../../../components/Admin/CargoConfig';
import Icon from '../../../components/UI/Icon';
import { Icon as ThemedIcon } from '../../../ui';

export function ListarCargos() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      console.log('[CARGOS] Salvando cargo:', dados);
      
      if (modoEdicao && cargoSelecionado?.id) {
        console.log('[CARGOS] Modo edição - ID:', cargoSelecionado.id);
        await cargosService.atualizarCargo(cargoSelecionado.id, {
          nome: dados.nome,
          descricao: dados.descricao,
          ativo: dados.ativo ?? true
        });
      } else {
        console.log('[CARGOS] Modo criação');
        const resultado = await cargosService.criarCargo({
          nome: dados.nome,
          descricao: dados.descricao
        });
        console.log('[CARGOS] Cargo criado com sucesso:', resultado);
      }

      console.log('[CARGOS] Fechando modal e recarregando lista');
      fecharModalFormulario();
      await carregarCargos();
      console.log('[CARGOS] Operação concluída com sucesso');
    } catch (error: any) {
      console.error('[CARGOS] Erro ao salvar cargo:', error);
      alert(`Erro ao salvar cargo: ${error.message || 'Erro desconhecido'}`);
      throw error; // Re-throw para o GenericFormModal capturar
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

  const abrirFormPermissoes = (cargo: Cargo) => {
    navigate(`/admin/cargos/${cargo.id}/permissoes`, {
      state: { cargo: { id: cargo.id, nome: cargo.nome } }
    });
  };

  const confirmarExclusao = async () => {
    if (!cargoExclusao?.id) return;

    try {
      setExcluindo(true);
      await cargosService.excluirCargo(cargoExclusao.id);
      fecharModalExclusao();
      carregarCargos();
    } catch (error: any) {
      alert(`Erro ao desativar cargo: ${error.message}`);
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

  if (carregando) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Carregando cargos...</span>
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
            <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-blue-500/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 dark:from-blue-500 dark:via-blue-400 dark:to-blue-300" aria-hidden="true" />
              <span className="absolute inset-0 opacity-40 blur-lg bg-blue-500" aria-hidden="true" />
              <div className="relative h-full w-full flex items-center justify-center">
                <ThemedIcon name="user-cog" className="!text-white text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Cargos</h1>
              <p className="text-muted-foreground text-lg">Gerencie os cargos cadastrados no sistema</p>
            </div>
          </div>
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={abrirModalCriar}
          >
            <Icon name="plus" size="lg" />
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
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
              <Icon name="filter" className="text-blue-800 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Filtros ativos:
                {filtro && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtro}</span>}
                {filtroDescricao && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtroDescricao}</span>}
                {filtroStatus && <span className="ml-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-xs">{filtroStatus === 'ativo' ? 'Ativo' : 'Inativo'}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 shadow-sm">
          {cargosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="briefcase" className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {(filtro || filtroDescricao || filtroStatus) ? 'Nenhum cargo encontrado com os filtros aplicados' : 'Nenhum cargo encontrado'}
              </h3>
              <p className="text-muted-foreground text-center">
                {(filtro || filtroDescricao || filtroStatus) ? 'Tente ajustar os filtros ou limpar para ver todos os cargos.' : 'Adicione um novo cargo para começar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-6 gap-4 p-4 bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-0 font-semibold text-foreground">
                <div>Nome</div>
                <div>Descrição</div>
                <div>Usuários</div>
                <div>Status</div>
                <div>Permissões</div>
                <div className="text-center">Ações</div>
              </div>

              {cargosFiltrados.map((cargo) => (
                <div
                  key={cargo.id}
                  className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 dark:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-150 items-center"
                >
                  <div className="text-foreground font-semibold">{cargo.nome}</div>
                  <div className="text-muted-foreground text-sm">{cargo.descricao || '-'}</div>
                  <div className="text-muted-foreground">{cargo.quantidadeUsuarios} usuário(s)</div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${cargo.ativo
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                    >
                      <Icon name={cargo.ativo ? 'check-circle' : 'times-circle'} />
                      {cargo.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div>
                    <button
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors duration-200"
                      onClick={() => abrirFormPermissoes(cargo)}
                      title="Gerenciar Permissões"
                    >
                      <Icon name="shield" className="inline mr-1" />
                      Gerenciar
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      title="Editar"
                      onClick={() => abrirModalEditar(cargo)}
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-150 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={cargo.quantidadeUsuarios > 0 ? 'Não é possível desativar cargo com usuários' : 'Desativar'}
                      onClick={() => abrirModalExclusao(cargo)}
                      disabled={cargo.quantidadeUsuarios > 0}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
              ))}
            </>
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

      {/* Modal de Desativação */}
      <ConfirmDeleteModal
        isOpen={modalExclusao}
        title="Desativar Cargo"
        message="Tem certeza de que deseja desativar este cargo?"
        itemName={cargoExclusao ? cargoExclusao.nome : ''}
        onConfirm={confirmarExclusao}
        onClose={fecharModalExclusao}
        loading={excludindo}
      />
      </div>
    </div>
  );
}