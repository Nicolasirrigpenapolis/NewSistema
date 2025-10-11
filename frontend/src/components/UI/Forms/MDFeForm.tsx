import React, { useState, useEffect } from 'react';
import { Card } from '../card';
import { Button } from '../button';
import Icon from '../Icon';
import { MDFeData, EntidadesCarregadas, LocalidadeInput } from '../../../types/mdfe';
import { Input } from '../input';
import { Label } from '../label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { localidadeService, Municipio } from '../../../services/localidadeService';

interface MDFeFormProps {
  dados?: Partial<MDFeData>;
  mdfeData?: any;
  entidades?: any;
  entidadesCarregadas?: EntidadesCarregadas | null;
  onDadosChange?: (dados: Partial<MDFeData>) => void;
  onSubmit?: (data: any) => void;
  onSalvar?: () => void;
  onSalvarRascunho?: () => void;
  onCancelar?: () => void;
  onCancel?: () => void;
  onTransmitir?: () => void;
  salvando?: boolean;
  transmitindo?: boolean;
  isSubmitting?: boolean;
  isEdicao?: boolean;
  carregandoDados?: boolean;
}

const UFS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function MDFeForm({
  dados = {},
  entidadesCarregadas,
  onDadosChange,
  onSalvar,
  onSalvarRascunho,
  onCancelar,
  onCancel,
  onTransmitir,
  salvando = false,
  transmitindo = false,
  isEdicao = false,
  carregandoDados = false
}: MDFeFormProps) {
  const [abaSelecionada, setAbaSelecionada] = useState<'basico' | 'documentos' | 'localidades' | 'avancado'>('basico');
  const [novoDocCTe, setNovoDocCTe] = useState('');
  const [novoDocNFe, setNovoDocNFe] = useState('');

  // Estados para localidades de carregamento
  const [novaLocalidadeCarregamento, setNovaLocalidadeCarregamento] = useState<LocalidadeInput>({
    uf: '',
    municipio: '',
    codigoIBGE: 0
  });

  // Estados para localidades de descarregamento
  const [novaLocalidadeDescarregamento, setNovaLocalidadeDescarregamento] = useState<LocalidadeInput>({
    uf: '',
    municipio: '',
    codigoIBGE: 0
  });

  // Estados para municípios carregados do backend
  const [municipiosCarregamento, setMunicipiosCarregamento] = useState<Municipio[]>([]);
  const [municipiosDescarregamento, setMunicipiosDescarregamento] = useState<Municipio[]>([]);
  const [carregandoMunicipiosCarregamento, setCarregandoMunicipiosCarregamento] = useState(false);
  const [carregandoMunicipiosDescarregamento, setCarregandoMunicipiosDescarregamento] = useState(false);

  // Detectar automaticamente entrega única (locação)
  // Quando tiver apenas 1 CT-e = entrega única/locação
  useEffect(() => {
    const qtdCTe = dados.documentosCTe?.length || 0;
    const isEntregaUnica = qtdCTe === 1;

    // Atualizar o flag entregaUnica automaticamente
    if (dados.entregaUnica !== isEntregaUnica) {
      atualizarDados('entregaUnica', isEntregaUnica);
    }
  }, [dados.documentosCTe]);

  // Carregar municípios quando UF de carregamento mudar
  useEffect(() => {
    const carregarMunicipiosCarregamento = async () => {
      if (novaLocalidadeCarregamento.uf && novaLocalidadeCarregamento.uf.length === 2) {
        setCarregandoMunicipiosCarregamento(true);
        try {
          const municipios = await localidadeService.obterMunicipiosPorEstado(novaLocalidadeCarregamento.uf);
          setMunicipiosCarregamento(municipios);
        } catch (error) {
          console.error('Erro ao carregar municípios de carregamento:', error);
          setMunicipiosCarregamento([]);
        } finally {
          setCarregandoMunicipiosCarregamento(false);
        }
      } else {
        setMunicipiosCarregamento([]);
      }
    };

    carregarMunicipiosCarregamento();
  }, [novaLocalidadeCarregamento.uf]);

  // Carregar municípios quando UF de descarregamento mudar
  useEffect(() => {
    const carregarMunicipiosDescarregamento = async () => {
      if (novaLocalidadeDescarregamento.uf && novaLocalidadeDescarregamento.uf.length === 2) {
        setCarregandoMunicipiosDescarregamento(true);
        try {
          const municipios = await localidadeService.obterMunicipiosPorEstado(novaLocalidadeDescarregamento.uf);
          setMunicipiosDescarregamento(municipios);
        } catch (error) {
          console.error('Erro ao carregar municípios de descarregamento:', error);
          setMunicipiosDescarregamento([]);
        } finally {
          setCarregandoMunicipiosDescarregamento(false);
        }
      } else {
        setMunicipiosDescarregamento([]);
      }
    };

    carregarMunicipiosDescarregamento();
  }, [novaLocalidadeDescarregamento.uf]);

  const atualizarDados = (campo: string, valor: any) => {
    if (onDadosChange) {
      onDadosChange({ ...dados, [campo]: valor });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSalvar) {
      onSalvar();
    }
  };

  // Handlers para documentos
  const adicionarDocCTe = () => {
    if (novoDocCTe.trim()) {
      const docs = dados.documentosCTe || [];
      atualizarDados('documentosCTe', [...docs, novoDocCTe.trim()]);
      setNovoDocCTe('');
    }
  };

  const removerDocCTe = (index: number) => {
    const docs = dados.documentosCTe || [];
    atualizarDados('documentosCTe', docs.filter((_, i) => i !== index));
  };

  const adicionarDocNFe = () => {
    if (novoDocNFe.trim()) {
      const docs = dados.documentosNFe || [];
      atualizarDados('documentosNFe', [...docs, novoDocNFe.trim()]);
      setNovoDocNFe('');
    }
  };

  const removerDocNFe = (index: number) => {
    const docs = dados.documentosNFe || [];
    atualizarDados('documentosNFe', docs.filter((_, i) => i !== index));
  };

  // Handlers para localidades de carregamento
  const handleMunicipioCarregamentoChange = (codigoIBGE: string) => {
    const municipio = municipiosCarregamento.find(m => m.codigo.toString() === codigoIBGE);
    if (municipio) {
      setNovaLocalidadeCarregamento({
        uf: municipio.uf,
        municipio: municipio.nome,
        codigoIBGE: municipio.codigo
      });
    }
  };

  const adicionarLocalidadeCarregamento = () => {
    if (novaLocalidadeCarregamento.uf && novaLocalidadeCarregamento.municipio && novaLocalidadeCarregamento.codigoIBGE) {
      const localidades = dados.localidadesCarregamento || [];
      atualizarDados('localidadesCarregamento', [...localidades, novaLocalidadeCarregamento]);
      setNovaLocalidadeCarregamento({ uf: '', municipio: '', codigoIBGE: 0 });
      setMunicipiosCarregamento([]);
    }
  };

  const removerLocalidadeCarregamento = (index: number) => {
    const localidades = dados.localidadesCarregamento || [];
    atualizarDados('localidadesCarregamento', localidades.filter((_, i) => i !== index));
  };

  // Handlers para localidades de descarregamento
  const handleMunicipioDescarregamentoChange = (codigoIBGE: string) => {
    const municipio = municipiosDescarregamento.find(m => m.codigo.toString() === codigoIBGE);
    if (municipio) {
      setNovaLocalidadeDescarregamento({
        uf: municipio.uf,
        municipio: municipio.nome,
        codigoIBGE: municipio.codigo
      });
    }
  };

  const adicionarLocalidadeDescarregamento = () => {
    if (novaLocalidadeDescarregamento.uf && novaLocalidadeDescarregamento.municipio && novaLocalidadeDescarregamento.codigoIBGE) {
      const localidades = dados.localidadesDescarregamento || [];
      atualizarDados('localidadesDescarregamento', [...localidades, novaLocalidadeDescarregamento]);
      setNovaLocalidadeDescarregamento({ uf: '', municipio: '', codigoIBGE: 0 });
      setMunicipiosDescarregamento([]);
    }
  };

  const removerLocalidadeDescarregamento = (index: number) => {
    const localidades = dados.localidadesDescarregamento || [];
    atualizarDados('localidadesDescarregamento', localidades.filter((_, i) => i !== index));
  };

  if (carregandoDados) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Carregando dados do formulário...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="file-alt" className="text-white" size="xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEdicao ? 'Editar MDFe' : 'Novo MDFe'}
              </h1>
              <p className="text-muted-foreground text-lg">
                Manifesto Eletrônico de Documentos Fiscais
              </p>
            </div>
          </div>
        </div>

        {/* Status do MDFe (se editando) */}
        {isEdicao && dados.statusSefaz && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  dados.statusSefaz === 'Autorizado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  dados.statusSefaz === 'Rejeitado' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {dados.statusSefaz}
                </span>
              </div>
              {dados.chaveAcesso && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Chave:</span>
                  <span className="text-sm font-mono text-foreground">{dados.chaveAcesso}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Navegação por abas */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setAbaSelecionada('basico')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                  abaSelecionada === 'basico'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon name="info-circle" className="inline mr-2" size="sm" />
                Dados Básicos
              </button>
              <button
                type="button"
                onClick={() => setAbaSelecionada('documentos')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                  abaSelecionada === 'documentos'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon name="file-invoice" className="inline mr-2" size="sm" />
                Documentos
              </button>
              <button
                type="button"
                onClick={() => setAbaSelecionada('localidades')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                  abaSelecionada === 'localidades'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon name="map-marker-alt" className="inline mr-2" size="sm" />
                Localidades & Percurso
              </button>
              <button
                type="button"
                onClick={() => setAbaSelecionada('avancado')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                  abaSelecionada === 'avancado'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon name="cog" className="inline mr-2" size="sm" />
                Avançado
              </button>
            </div>

            <div className="p-6">
              {/* ABA: Dados Básicos */}
              {abaSelecionada === 'basico' && (
                <div className="space-y-6">
                  {/* Seção: Emitente */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="building" className="text-blue-500" />
                      Emitente
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="emitenteId">Emitente *</Label>
                        <Select
                          value={dados.emitenteId?.toString() || ''}
                          onValueChange={(value) => atualizarDados('emitenteId', parseInt(value))}
                        >
                          <SelectTrigger id="emitenteId">
                            <SelectValue placeholder="Selecione o emitente..." />
                          </SelectTrigger>
                          <SelectContent>
                            {entidadesCarregadas?.emitentes?.map((emitente) => (
                              <SelectItem key={emitente.id} value={emitente.id.toString()}>
                                {emitente.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Seção: Veículo e Condutor */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="truck" className="text-green-500" />
                      Veículo e Condutor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="veiculoId">Veículo</Label>
                        <Select
                          value={dados.veiculoId?.toString() || ''}
                          onValueChange={(value) => atualizarDados('veiculoId', value ? parseInt(value) : undefined)}
                        >
                          <SelectTrigger id="veiculoId">
                            <SelectValue placeholder="Selecione o veículo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {entidadesCarregadas?.veiculos?.map((veiculo) => (
                              <SelectItem key={veiculo.id} value={veiculo.id.toString()}>
                                {veiculo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="condutorId">Condutor/Motorista</Label>
                        <Select
                          value={dados.condutorId?.toString() || ''}
                          onValueChange={(value) => atualizarDados('condutorId', value ? parseInt(value) : undefined)}
                        >
                          <SelectTrigger id="condutorId">
                            <SelectValue placeholder="Selecione o condutor..." />
                          </SelectTrigger>
                          <SelectContent>
                            {entidadesCarregadas?.condutores?.map((condutor) => (
                              <SelectItem key={condutor.id} value={condutor.id.toString()}>
                                {condutor.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Seção: Valores e Pesos */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="dollar-sign" className="text-orange-500" />
                      Valores e Carga
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valorTotal">Valor Total (R$)</Label>
                        <Input
                          id="valorTotal"
                          type="number"
                          step="0.01"
                          value={dados.valorTotal || ''}
                          onChange={(e) => atualizarDados('valorTotal', parseFloat(e.target.value) || 0)}
                          placeholder="0,00"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pesoBrutoTotal">Peso Bruto Total (kg)</Label>
                        <Input
                          id="pesoBrutoTotal"
                          type="number"
                          step="0.001"
                          value={dados.pesoBrutoTotal || ''}
                          onChange={(e) => atualizarDados('pesoBrutoTotal', parseFloat(e.target.value) || 0)}
                          placeholder="0,000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção: Contratante e Seguradora */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="handshake" className="text-indigo-500" />
                      Contratante e Seguradora
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contratanteId">Contratante</Label>
                        <Select
                          value={dados.contratanteId?.toString() || ''}
                          onValueChange={(value) => atualizarDados('contratanteId', value ? parseInt(value) : undefined)}
                        >
                          <SelectTrigger id="contratanteId">
                            <SelectValue placeholder="Selecione o contratante..." />
                          </SelectTrigger>
                          <SelectContent>
                            {entidadesCarregadas?.contratantes?.map((contratante) => (
                              <SelectItem key={contratante.id} value={contratante.id.toString()}>
                                {contratante.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="seguradoraId">Seguradora</Label>
                        <Select
                          value={dados.seguradoraId?.toString() || ''}
                          onValueChange={(value) => atualizarDados('seguradoraId', value ? parseInt(value) : undefined)}
                        >
                          <SelectTrigger id="seguradoraId">
                            <SelectValue placeholder="Selecione a seguradora..." />
                          </SelectTrigger>
                          <SelectContent>
                            {entidadesCarregadas?.seguradoras?.map((seguradora) => (
                              <SelectItem key={seguradora.id} value={seguradora.id.toString()}>
                                {seguradora.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA: Documentos */}
              {abaSelecionada === 'documentos' && (
                <div className="space-y-6">
                  {/* CTe */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="file-invoice" className="text-blue-500" />
                      Documentos CT-e
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={novoDocCTe}
                          onChange={(e) => setNovoDocCTe(e.target.value)}
                          placeholder="Chave de acesso do CT-e (44 dígitos)"
                          maxLength={44}
                        />
                        <Button type="button" onClick={adicionarDocCTe} variant="outline">
                          <Icon name="plus" size="sm" />
                        </Button>
                      </div>

                      {dados.documentosCTe && dados.documentosCTe.length > 0 ? (
                        <div className="space-y-2">
                          {dados.documentosCTe.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                              <span className="font-mono text-sm">{doc}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removerDocCTe(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Icon name="trash" size="sm" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhum CT-e adicionado</p>
                      )}
                    </div>
                  </div>

                  {/* Entrega Única / Locação - Aparece quando há apenas 1 CT-e */}
                  {dados.entregaUnica && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="info-circle" className="text-purple-600" />
                          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                            Entrega Única / Locação Detectada
                          </h3>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-400">
                          Como há apenas <strong>1 CT-e</strong>, este MDFe é considerado <strong>entrega única/locação</strong>.
                          É necessário informar o NCM e o valor do serviço de locação.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ncmEntregaUnica">NCM do Serviço *</Label>
                          <Input
                            id="ncmEntregaUnica"
                            value={dados.ncmEntregaUnica || ''}
                            onChange={(e) => atualizarDados('ncmEntregaUnica', e.target.value)}
                            placeholder="Ex: 49019900"
                            maxLength={8}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Código NCM do serviço de locação (8 dígitos)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="valorEntregaUnica">Valor da Locação (R$) *</Label>
                          <Input
                            id="valorEntregaUnica"
                            type="number"
                            step="0.01"
                            value={dados.valorEntregaUnica || ''}
                            onChange={(e) => atualizarDados('valorEntregaUnica', parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Valor do serviço de locação/entrega única
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aviso quando NÃO é entrega única (múltiplos CT-e) */}
                  {!dados.entregaUnica && dados.documentosCTe && dados.documentosCTe.length > 1 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Icon name="info-circle" className="text-blue-600" />
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Múltiplos CT-e detectados ({dados.documentosCTe.length} documentos)</strong> -
                          Não é considerado entrega única/locação. NCM e valor da locação não são necessários.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* NFe */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="file-invoice" className="text-green-500" />
                      Documentos NF-e
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={novoDocNFe}
                          onChange={(e) => setNovoDocNFe(e.target.value)}
                          placeholder="Chave de acesso da NF-e (44 dígitos)"
                          maxLength={44}
                        />
                        <Button type="button" onClick={adicionarDocNFe} variant="outline">
                          <Icon name="plus" size="sm" />
                        </Button>
                      </div>

                      {dados.documentosNFe && dados.documentosNFe.length > 0 ? (
                        <div className="space-y-2">
                          {dados.documentosNFe.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                              <span className="font-mono text-sm">{doc}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removerDocNFe(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Icon name="trash" size="sm" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhuma NF-e adicionada</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA: Localidades e Percurso */}
              {abaSelecionada === 'localidades' && (
                <div className="space-y-6">
                  {/* Seção: Origem e Destino */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="route" className="text-purple-500" />
                      Origem e Destino
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ufIni">UF Início</Label>
                        <Select
                          value={dados.ufIni || ''}
                          onValueChange={(value) => atualizarDados('ufIni', value)}
                        >
                          <SelectTrigger id="ufIni">
                            <SelectValue placeholder="Selecione a UF de início..." />
                          </SelectTrigger>
                          <SelectContent>
                            {UFS_BRASIL.map((uf) => (
                              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="ufFim">UF Fim</Label>
                        <Select
                          value={dados.ufFim || ''}
                          onValueChange={(value) => atualizarDados('ufFim', value)}
                        >
                          <SelectTrigger id="ufFim">
                            <SelectValue placeholder="Selecione a UF de fim..." />
                          </SelectTrigger>
                          <SelectContent>
                            {UFS_BRASIL.map((uf) => (
                              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Localidades de Carregamento */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="arrow-up" className="text-green-500" />
                      Localidades de Carregamento
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Select
                          value={novaLocalidadeCarregamento.uf}
                          onValueChange={(value) => setNovaLocalidadeCarregamento({uf: value, municipio: '', codigoIBGE: 0})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {UFS_BRASIL.map((uf) => (
                              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={novaLocalidadeCarregamento.codigoIBGE?.toString() || ''}
                          onValueChange={handleMunicipioCarregamentoChange}
                          disabled={!novaLocalidadeCarregamento.uf || carregandoMunicipiosCarregamento}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              carregandoMunicipiosCarregamento
                                ? "Carregando municípios..."
                                : !novaLocalidadeCarregamento.uf
                                  ? "Selecione uma UF primeiro"
                                  : "Selecione o município"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {municipiosCarregamento.map((municipio) => (
                              <SelectItem key={municipio.codigo} value={municipio.codigo.toString()}>
                                {municipio.nome} (IBGE: {municipio.codigo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          onClick={adicionarLocalidadeCarregamento}
                          variant="outline"
                          className="w-full"
                          disabled={!novaLocalidadeCarregamento.codigoIBGE}
                        >
                          <Icon name="plus" size="sm" className="mr-2" />
                          Adicionar
                        </Button>
                      </div>

                      {dados.localidadesCarregamento && dados.localidadesCarregamento.length > 0 ? (
                        <div className="space-y-2">
                          {dados.localidadesCarregamento.map((localidade, index) => (
                            <div key={index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Icon name="map-marker-alt" className="text-green-600" />
                                <div>
                                  <span className="font-semibold text-foreground">{localidade.municipio}/{localidade.uf}</span>
                                  <span className="text-sm text-muted-foreground ml-2">IBGE: {localidade.codigoIBGE}</span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removerLocalidadeCarregamento(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Icon name="trash" size="sm" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhuma localidade de carregamento adicionada</p>
                      )}
                    </div>
                  </div>

                  {/* Localidades de Descarregamento */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="arrow-down" className="text-red-500" />
                      Localidades de Descarregamento
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Select
                          value={novaLocalidadeDescarregamento.uf}
                          onValueChange={(value) => setNovaLocalidadeDescarregamento({uf: value, municipio: '', codigoIBGE: 0})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {UFS_BRASIL.map((uf) => (
                              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={novaLocalidadeDescarregamento.codigoIBGE?.toString() || ''}
                          onValueChange={handleMunicipioDescarregamentoChange}
                          disabled={!novaLocalidadeDescarregamento.uf || carregandoMunicipiosDescarregamento}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              carregandoMunicipiosDescarregamento
                                ? "Carregando municípios..."
                                : !novaLocalidadeDescarregamento.uf
                                  ? "Selecione uma UF primeiro"
                                  : "Selecione o município"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {municipiosDescarregamento.map((municipio) => (
                              <SelectItem key={municipio.codigo} value={municipio.codigo.toString()}>
                                {municipio.nome} (IBGE: {municipio.codigo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          onClick={adicionarLocalidadeDescarregamento}
                          variant="outline"
                          className="w-full"
                          disabled={!novaLocalidadeDescarregamento.codigoIBGE}
                        >
                          <Icon name="plus" size="sm" className="mr-2" />
                          Adicionar
                        </Button>
                      </div>

                      {dados.localidadesDescarregamento && dados.localidadesDescarregamento.length > 0 ? (
                        <div className="space-y-2">
                          {dados.localidadesDescarregamento.map((localidade, index) => (
                            <div key={index} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Icon name="map-marker-alt" className="text-red-600" />
                                <div>
                                  <span className="font-semibold text-foreground">{localidade.municipio}/{localidade.uf}</span>
                                  <span className="text-sm text-muted-foreground ml-2">IBGE: {localidade.codigoIBGE}</span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removerLocalidadeDescarregamento(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Icon name="trash" size="sm" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhuma localidade de descarregamento adicionada</p>
                      )}
                    </div>
                  </div>

                  {/* Percurso - GERADO AUTOMATICAMENTE */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="route" className="text-purple-500" />
                      Percurso (UFs) - Gerado Automaticamente
                    </h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="space-y-2">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">
                          <Icon name="exclamation-triangle" className="inline mr-2" size="sm" />
                          O percurso (UFs) é calculado automaticamente pelo backend!
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          <strong>Como funciona:</strong>
                        </p>
                        <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-300 ml-6 space-y-1">
                          <li>O backend analisa as <strong>localidades de carregamento e descarregamento</strong></li>
                          <li>Calcula automaticamente as <strong>UFs intermediárias</strong> do percurso</li>
                          <li>Você <strong>não precisa</strong> informar manualmente as UFs do percurso</li>
                        </ul>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-3 font-medium">
                          ✅ Basta adicionar as localidades de carregamento e descarregamento acima!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <Icon name="info-circle" className="inline mr-2" size="sm" />
                      <strong>Resumo:</strong> Adicione as localidades de carregamento (origem da carga) e descarregamento (destino da carga).
                      O backend calculará automaticamente a UF Início, UF Fim e o percurso completo.
                    </p>
                  </div>
                </div>
              )}

              {/* ABA: Avançado */}
              {abaSelecionada === 'avancado' && (
                <div className="space-y-6">
                  {/* Seção: Produto Predominante e Carga */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="box" className="text-amber-500" />
                      Produto e Carga
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="produtoPredominante">Produto Predominante</Label>
                        <Input
                          id="produtoPredominante"
                          value={dados.produtoPredominante || ''}
                          onChange={(e) => atualizarDados('produtoPredominante', e.target.value)}
                          placeholder="Ex: Carga Geral"
                          maxLength={200}
                        />
                      </div>

                      <div>
                        <Label htmlFor="tipoCarga">Tipo de Carga</Label>
                        <Select
                          value={dados.tipoCarga || ''}
                          onValueChange={(value) => atualizarDados('tipoCarga', value)}
                        >
                          <SelectTrigger id="tipoCarga">
                            <SelectValue placeholder="Selecione o tipo..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="01">Granel Sólido</SelectItem>
                            <SelectItem value="02">Granel Líquido</SelectItem>
                            <SelectItem value="03">Frigorificada</SelectItem>
                            <SelectItem value="04">Conteinerizada</SelectItem>
                            <SelectItem value="05">Carga Geral</SelectItem>
                            <SelectItem value="06">Neogranel</SelectItem>
                            <SelectItem value="07">Perigosa (Granel Sólido)</SelectItem>
                            <SelectItem value="08">Perigosa (Granel Líquido)</SelectItem>
                            <SelectItem value="09">Perigosa (Carga Frigorificada)</SelectItem>
                            <SelectItem value="10">Perigosa (Conteinerizada)</SelectItem>
                            <SelectItem value="11">Perigosa (Carga Geral)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="descricaoProduto">Descrição do Produto</Label>
                        <Input
                          id="descricaoProduto"
                          value={dados.descricaoProduto || ''}
                          onChange={(e) => atualizarDados('descricaoProduto', e.target.value)}
                          placeholder="Descrição detalhada da carga"
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção: Informações Adicionais */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="file-text" className="text-gray-500" />
                      Informações Adicionais
                    </h3>
                    <div>
                      <Label htmlFor="infoAdicional">Observações</Label>
                      <textarea
                        id="infoAdicional"
                        value={dados.infoAdicional || ''}
                        onChange={(e) => atualizarDados('infoAdicional', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Informações complementares sobre o manifesto..."
                        maxLength={500}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <Icon name="info-circle" className="inline mr-2" size="sm" />
                      <strong>Campos resolvidos automaticamente pelo backend:</strong> CEPs, Coordenadas GPS, Seguro, CIOT, Proprietário do Veículo, Vale Pedágio, Unidades de Transporte e Responsável Técnico são extraídos automaticamente das entidades selecionadas (Emitente, Veículo, Condutor, Contratante, Seguradora).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 bg-card border border-border rounded-lg p-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelar || onCancel}
              disabled={salvando || transmitindo}
            >
              <Icon name="times" size="sm" className="mr-2" />
              Cancelar
            </Button>

            {onSalvarRascunho && !isEdicao && (
              <Button
                type="button"
                variant="outline"
                onClick={onSalvarRascunho}
                disabled={salvando || transmitindo}
              >
                {salvando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Icon name="save" size="sm" className="mr-2" />
                    Salvar Rascunho
                  </>
                )}
              </Button>
            )}

            <Button
              type="submit"
              disabled={salvando || transmitindo}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {salvando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Icon name="save" size="sm" className="mr-2" />
                  {isEdicao ? 'Atualizar MDFe' : 'Salvar MDFe'}
                </>
              )}
            </Button>

            {onTransmitir && isEdicao && (
              <Button
                type="button"
                onClick={onTransmitir}
                disabled={salvando || transmitindo}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {transmitindo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Transmitindo...
                  </>
                ) : (
                  <>
                    <Icon name="paper-plane" size="sm" className="mr-2" />
                    Transmitir para SEFAZ
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
