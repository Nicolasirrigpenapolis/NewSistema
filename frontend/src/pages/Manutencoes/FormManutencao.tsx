import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { manutencoesService, Manutencao, ManutencaoPeca, UnidadesMedida } from '../../services/manutencoesService';
import { entitiesService } from '../../services/entitiesService';
import { fornecedoresService } from '../../services/fornecedoresService';
import { EntityOption } from '../../types/apiResponse';
import Icon from '../../components/UI/Icon';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/card';

export function FormManutencao() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [veiculos, setVeiculos] = useState<EntityOption[]>([]);
  const [fornecedores, setFornecedores] = useState<EntityOption[]>([]);

  // Estados do formulário principal
  const [manutencao, setManutencao] = useState<Manutencao>({
    veiculoId: 0,
    dataManutencao: new Date().toISOString().split('T')[0],
    descricao: '',
    fornecedorId: undefined,
    valorMaoObra: 0,
    kmAtual: undefined,
    proximaRevisaoKm: undefined,
    observacoes: '',
    pecas: []
  });

  // Estado para adicionar nova peça
  const [novaPeca, setNovaPeca] = useState<ManutencaoPeca>({
    descricaoPeca: '',
    quantidade: 1,
    valorUnitario: 0,
    valorTotal: 0,
    unidade: 'UN'
  });

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setCarregando(true);

      // Carregar veículos e fornecedores
      const [veiculosData, fornecedoresData] = await Promise.all([
        entitiesService.obterVeiculos(),
        fornecedoresService.obterFornecedoresOptions()
      ]);

      setVeiculos(veiculosData || []);
      setFornecedores(fornecedoresData || []);

      // Se for edição, carregar dados da manutenção
      if (isEdicao && id) {
        const response = await manutencoesService.obterPorId(parseInt(id));
        if (response.success && response.data) {
          setManutencao(response.data);
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

    if (!manutencao.veiculoId || manutencao.veiculoId === 0) {
      alert('Selecione um veículo');
      return;
    }

    if (!manutencao.descricao) {
      alert('Preencha a descrição da manutenção');
      return;
    }

    try {
      setSalvando(true);

      let response;
      if (isEdicao && id) {
        response = await manutencoesService.atualizar(parseInt(id), manutencao);
      } else {
        response = await manutencoesService.criar(manutencao);
      }

      if (response.success) {
        alert(response.message);
        navigate('/relatorios/manutencao');
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('Erro ao salvar manutenção:', error);
      alert('Erro ao salvar manutenção');
    } finally {
      setSalvando(false);
    }
  };

  const adicionarPeca = () => {
    if (!novaPeca.descricaoPeca || novaPeca.valorUnitario <= 0) {
      alert('Preencha a descrição e valor da peça');
      return;
    }

    const valorTotal = novaPeca.quantidade * novaPeca.valorUnitario;

    setManutencao({
      ...manutencao,
      pecas: [...manutencao.pecas, { ...novaPeca, valorTotal }]
    });

    // Resetar formulário de peça
    setNovaPeca({
      descricaoPeca: '',
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
      unidade: 'UN'
    });
  };

  const removerPeca = (index: number) => {
    setManutencao({
      ...manutencao,
      pecas: manutencao.pecas.filter((_, i) => i !== index)
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
              onClick={() => navigate('/relatorios/manutencao')}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Icon name="arrow-left" size="lg" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEdicao ? 'Editar Manutenção' : 'Nova Manutenção'}
              </h1>
              <p className="text-muted-foreground">
                {isEdicao ? 'Atualize as informações da manutenção' : 'Cadastre uma nova manutenção com peças e serviços'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/relatorios/manutencao')}
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
                  Salvar Manutenção
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Gerais da Manutenção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="wrench" />
                Dados da Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Veículo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={manutencao.veiculoId}
                    onChange={(e) => setManutencao({ ...manutencao, veiculoId: parseInt(e.target.value) })}
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
                    Data Manutenção <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={manutencao.dataManutencao}
                    onChange={(e) => setManutencao({ ...manutencao, dataManutencao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fornecedor
                  </label>
                  <select
                    value={manutencao.fornecedorId || 0}
                    onChange={(e) => setManutencao({ ...manutencao, fornecedorId: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                  >
                    <option value={0}>Selecione um fornecedor</option>
                    {fornecedores.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={manutencao.descricao}
                  onChange={(e) => setManutencao({ ...manutencao, descricao: e.target.value })}
                  placeholder="Descreva o serviço realizado"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Valor Mão de Obra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manutencao.valorMaoObra}
                    onChange={(e) => setManutencao({ ...manutencao, valorMaoObra: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    KM Atual
                  </label>
                  <input
                    type="number"
                    value={manutencao.kmAtual || ''}
                    onChange={(e) => setManutencao({ ...manutencao, kmAtual: parseInt(e.target.value) || undefined })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Próxima Revisão (KM)
                  </label>
                  <input
                    type="number"
                    value={manutencao.proximaRevisaoKm || ''}
                    onChange={(e) => setManutencao({ ...manutencao, proximaRevisaoKm: parseInt(e.target.value) || undefined })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Observações
                  </label>
                  <input
                    type="text"
                    value={manutencao.observacoes || ''}
                    onChange={(e) => setManutencao({ ...manutencao, observacoes: e.target.value })}
                    placeholder="Obs"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peças */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="cog" className="text-orange-500" />
                Peças Utilizadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulário para adicionar peça */}
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Adicionar Nova Peça</h3>
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Descrição da peça *"
                      value={novaPeca.descricaoPeca}
                      onChange={(e) => setNovaPeca({ ...novaPeca, descricaoPeca: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Qtd *"
                      min="1"
                      value={novaPeca.quantidade}
                      onChange={(e) => setNovaPeca({ ...novaPeca, quantidade: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Valor Unit. *"
                      step="0.01"
                      value={novaPeca.valorUnitario || ''}
                      onChange={(e) => setNovaPeca({ ...novaPeca, valorUnitario: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <select
                      value={novaPeca.unidade}
                      onChange={(e) => setNovaPeca({ ...novaPeca, unidade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-card text-foreground text-sm"
                    >
                      {UnidadesMedida.map((un) => (
                        <option key={un} value={un}>{un}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={adicionarPeca}
                      className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Icon name="plus" size="sm" />
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de peças */}
              {manutencao.pecas.length > 0 ? (
                <div className="space-y-2">
                  {manutencao.pecas.map((peca, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{peca.descricaoPeca}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Qtd: {peca.quantidade} {peca.unidade}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Unit: {formatarMoeda(peca.valorUnitario)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-orange-600">Total: {formatarMoeda(peca.quantidade * peca.valorUnitario)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerPeca(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Icon name="trash" size="sm" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhuma peça adicionada</p>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
