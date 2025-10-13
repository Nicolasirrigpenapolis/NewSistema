import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { viagensService, Viagem, DespesaViagem, ReceitaViagem, TodosTiposDespesa } from '../../services/viagensService';
import { entitiesService } from '../../services/entitiesService';
import { EntityOption } from '../../types/apiResponse';
import { Icon, Card, CardContent, CardHeader, CardTitle } from '../../ui';

export function FormViagem() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [veiculos, setVeiculos] = useState<EntityOption[]>([]);
  const [condutores, setCondutores] = useState<EntityOption[]>([]);

  // Estados do formulário principal
  const [viagem, setViagem] = useState<Viagem>({
    veiculoId: 0,
    condutorId: undefined,
    dataInicio: '',
    dataFim: '',
    origemDestino: '',
    kmInicial: undefined,
    kmFinal: undefined,
    observacoes: '',
    despesas: [],
    receitas: []
  });

  // Estados para adicionar nova despesa
  const [novaDespesa, setNovaDespesa] = useState<DespesaViagem>({
    tipoDespesa: TodosTiposDespesa[0],
    descricao: '',
    valor: 0,
    dataDespesa: new Date().toISOString().split('T')[0],
    local: '',
    observacoes: ''
  });

  // Estados para adicionar nova receita
  const [novaReceita, setNovaReceita] = useState<ReceitaViagem>({
    descricao: '',
    valor: 0,
    dataReceita: new Date().toISOString().split('T')[0],
    origem: '',
    observacoes: ''
  });

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setCarregando(true);

      // Carregar veículos
      const veiculosData = await entitiesService.obterVeiculos();
      setVeiculos(veiculosData || []);

      // Se for edição, carregar dados da viagem
      if (isEdicao && id) {
        const response = await viagensService.obterPorId(parseInt(id));
        if (response.success && response.data) {
          setViagem(response.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!viagem.veiculoId || viagem.veiculoId === 0) {
      alert('Selecione um veículo');
      return;
    }

    if (!viagem.dataInicio || !viagem.dataFim) {
      alert('Preencha as datas de início e fim');
      return;
    }

    if (new Date(viagem.dataFim) < new Date(viagem.dataInicio)) {
      alert('Data fim deve ser maior que data início');
      return;
    }

    try {
      setSalvando(true);

      let response;
      if (isEdicao && id) {
        response = await viagensService.atualizar(parseInt(id), viagem);
      } else {
        response = await viagensService.criar(viagem);
      }

      if (response.success) {
        alert(response.message);
        navigate('/relatorios/despesas');
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('Erro ao salvar viagem:', error);
      alert('Erro ao salvar viagem');
    } finally {
      setSalvando(false);
    }
  };

  const adicionarDespesa = () => {
    if (!novaDespesa.descricao || novaDespesa.valor <= 0) {
      alert('Preencha a descrição e valor da despesa');
      return;
    }

    setViagem({
      ...viagem,
      despesas: [...viagem.despesas, { ...novaDespesa }]
    });

    // Resetar formulário de despesa
    setNovaDespesa({
      tipoDespesa: TodosTiposDespesa[0],
      descricao: '',
      valor: 0,
      dataDespesa: new Date().toISOString().split('T')[0],
      local: '',
      observacoes: ''
    });
  };

  const removerDespesa = (index: number) => {
    setViagem({
      ...viagem,
      despesas: viagem.despesas.filter((_, i) => i !== index)
    });
  };

  const adicionarReceita = () => {
    if (!novaReceita.descricao || novaReceita.valor <= 0) {
      alert('Preencha a descrição e valor da receita');
      return;
    }

    setViagem({
      ...viagem,
      receitas: [...viagem.receitas, { ...novaReceita }]
    });

    // Resetar formulário de receita
    setNovaReceita({
      descricao: '',
      valor: 0,
      dataReceita: new Date().toISOString().split('T')[0],
      origem: '',
      observacoes: ''
    });
  };

  const removerReceita = (index: number) => {
    setViagem({
      ...viagem,
      receitas: viagem.receitas.filter((_, i) => i !== index)
    });
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/relatorios/despesas')}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Icon name="arrow-left" size="lg" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEdicao ? 'Editar Viagem' : 'Nova Viagem'}
              </h1>
              <p className="text-muted-foreground">
                {isEdicao ? 'Atualize as informações da viagem' : 'Cadastre uma nova viagem com receitas e despesas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/relatorios/despesas')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={salvando}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Icon name="save" />
                  Salvar Viagem
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Gerais da Viagem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="truck" />
                Dados da Viagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Veículo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={viagem.veiculoId}
                    onChange={(e) => setViagem({ ...viagem, veiculoId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                    required
                  >
                    <option value={0}>Selecione um veículo</option>
                    {veiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Data Início <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={viagem.dataInicio}
                    onChange={(e) => setViagem({ ...viagem, dataInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Data Fim <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={viagem.dataFim}
                    onChange={(e) => setViagem({ ...viagem, dataFim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Origem/Destino
                  </label>
                  <input
                    type="text"
                    value={viagem.origemDestino || ''}
                    onChange={(e) => setViagem({ ...viagem, origemDestino: e.target.value })}
                    placeholder="Ex: São Paulo - Rio de Janeiro"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    KM Inicial
                  </label>
                  <input
                    type="number"
                    value={viagem.kmInicial || ''}
                    onChange={(e) => setViagem({ ...viagem, kmInicial: parseFloat(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    KM Final
                  </label>
                  <input
                    type="number"
                    value={viagem.kmFinal || ''}
                    onChange={(e) => setViagem({ ...viagem, kmFinal: parseFloat(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nome do Motorista
                  </label>
                  <input
                    type="text"
                    value={viagem.motoristaNome || ''}
                    onChange={(e) => setViagem({ ...viagem, motoristaNome: e.target.value })}
                    placeholder="Nome do motorista"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Observações
                  </label>
                  <input
                    type="text"
                    value={viagem.observacoes || ''}
                    onChange={(e) => setViagem({ ...viagem, observacoes: e.target.value })}
                    placeholder="Observações gerais"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receitas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="trending-up" className="text-green-500" />
                Receitas da Viagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulário para adicionar receita */}
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Adicionar Nova Receita</h3>
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Descrição *"
                      value={novaReceita.descricao}
                      onChange={(e) => setNovaReceita({ ...novaReceita, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Valor *"
                      step="0.01"
                      value={novaReceita.valor || ''}
                      onChange={(e) => setNovaReceita({ ...novaReceita, valor: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={novaReceita.dataReceita}
                      onChange={(e) => setNovaReceita({ ...novaReceita, dataReceita: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Origem"
                      value={novaReceita.origem || ''}
                      onChange={(e) => setNovaReceita({ ...novaReceita, origem: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={adicionarReceita}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Icon name="plus" size="sm" />
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de receitas */}
              {viagem.receitas.length > 0 ? (
                <div className="space-y-2">
                  {viagem.receitas.map((receita, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{receita.descricao}</p>
                          {receita.origem && (
                            <p className="text-xs text-muted-foreground">Origem: {receita.origem}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-600">{formatarMoeda(receita.valor)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(receita.dataReceita).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerReceita(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Icon name="trash" size="sm" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhuma receita adicionada</p>
              )}
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="trending-down" className="text-red-500" />
                Despesas da Viagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulário para adicionar despesa */}
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Adicionar Nova Despesa</h3>
                <div className="grid grid-cols-7 gap-3">
                  <div>
                    <select
                      value={novaDespesa.tipoDespesa}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, tipoDespesa: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    >
                      {TodosTiposDespesa.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Descrição *"
                      value={novaDespesa.descricao}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, descricao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Valor *"
                      step="0.01"
                      value={novaDespesa.valor || ''}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, valor: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={novaDespesa.dataDespesa}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, dataDespesa: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Local"
                      value={novaDespesa.local || ''}
                      onChange={(e) => setNovaDespesa({ ...novaDespesa, local: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={adicionarDespesa}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Icon name="plus" size="sm" />
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de despesas */}
              {viagem.despesas.length > 0 ? (
                <div className="space-y-2">
                  {viagem.despesas.map((despesa, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1 grid grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">{despesa.tipoDespesa}</p>
                          <p className="text-sm font-medium text-foreground">{despesa.descricao}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-red-600">{formatarMoeda(despesa.valor)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(despesa.dataDespesa).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          {despesa.local && (
                            <p className="text-xs text-muted-foreground">Local: {despesa.local}</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerDespesa(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Icon name="trash" size="sm" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhuma despesa adicionada</p>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
