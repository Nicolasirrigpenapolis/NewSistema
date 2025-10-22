import React, { Dispatch, SetStateAction, useState } from 'react';
import { EntidadesCarregadas } from '../../../types/mdfe';
import { Icon } from '../../../ui';

interface MDFeFormProps {
  dados: any;
  onDadosChange: Dispatch<SetStateAction<any>>;
  onSalvar: () => Promise<void>;
  onSalvarRascunho?: () => Promise<void>;
  onCancelar?: () => void;
  onTransmitir?: () => Promise<void>;
  salvando?: boolean;
  transmitindo?: boolean;
  isEdicao?: boolean;
  carregandoDados?: boolean;
  entidadesCarregadas?: EntidadesCarregadas | null;
}

export function MDFeForm({ 
  dados, 
  onDadosChange, 
  onSalvar, 
  onSalvarRascunho,
  onCancelar,
  onTransmitir,
  salvando = false,
  transmitindo = false,
  isEdicao = false,
  carregandoDados = false,
  entidadesCarregadas = null
}: MDFeFormProps) {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});

  const updateDados = (field: string, value: any) => {
    onDadosChange((prev: any) => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao editar
    if (errosValidacao[field]) {
      setErrosValidacao(prev => {
        const novosErros = { ...prev };
        delete novosErros[field];
        return novosErros;
      });
    }
  };

  const validarEtapa = (etapa: number): boolean => {
    const erros: Record<string, string> = {};

    switch (etapa) {
      case 1: // Dados Básicos
        if (!dados.emitenteId) erros.emitenteId = 'Emitente é obrigatório';
        if (!dados.ufIni) erros.ufIni = 'UF de Início é obrigatória';
        if (!dados.ufFim) erros.ufFim = 'UF de Fim é obrigatória';
        break;
      case 2: // Transporte
        if (!dados.veiculoId) erros.veiculoId = 'Veículo é obrigatório';
        if (!dados.condutorId) erros.condutorId = 'Condutor é obrigatório';
        break;
      case 3: // Carga
        if (!dados.valorTotal || dados.valorTotal <= 0) erros.valorTotal = 'Valor total deve ser maior que zero';
        if (!dados.pesoBrutoTotal || dados.pesoBrutoTotal <= 0) erros.pesoBrutoTotal = 'Peso bruto deve ser maior que zero';
        break;
    }

    setErrosValidacao(erros);
    return Object.keys(erros).length === 0;
  };

  const proximaEtapa = () => {
    if (validarEtapa(etapaAtual)) {
      setEtapaAtual(prev => Math.min(prev + 1, 5));
    }
  };

  const etapaAnterior = () => {
    setEtapaAtual(prev => Math.max(prev - 1, 1));
  };

  const irParaEtapa = (etapa: number) => {
    // Validar todas as etapas anteriores
    let podeAvancar = true;
    for (let i = 1; i < etapa; i++) {
      if (!validarEtapa(i)) {
        podeAvancar = false;
        break;
      }
    }
    if (podeAvancar) {
      setEtapaAtual(etapa);
    }
  };

  if (carregandoDados) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Carregando dados do MDFe...</span>
        </div>
      </div>
    );
  }

  const etapas = [
    { numero: 1, titulo: 'Dados Básicos', icone: 'file-alt', descricao: 'Informações gerais do manifesto' },
    { numero: 2, titulo: 'Transporte', icone: 'truck', descricao: 'Veículo e condutor' },
    { numero: 3, titulo: 'Carga', icone: 'box', descricao: 'Valor e peso da carga' },
    { numero: 4, titulo: 'Documentos', icone: 'file-invoice', descricao: 'CTe e NFe vinculados' },
    { numero: 5, titulo: 'Finalizar', icone: 'check-circle', descricao: 'Revisar e transmitir' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-xl shadow-lg shadow-blue-500/30 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-indigo-700 dark:from-blue-400 dark:via-indigo-500 dark:to-indigo-600" aria-hidden="true" />
              <span className="absolute inset-0 opacity-40 blur-lg bg-blue-500" aria-hidden="true" />
              <div className="relative h-full w-full flex items-center justify-center">
                <Icon name="file-alt" className="!text-white text-2xl" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                {isEdicao ? 'Editar MDFe' : 'Novo MDFe'}
              </h1>
              <p className="text-muted-foreground text-lg">
                {isEdicao ? 'Atualize as informações do manifesto' : 'Preencha os dados para emissão do manifesto eletrônico'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          <div className="flex items-center justify-between">
            {etapas.map((etapa, index) => (
              <React.Fragment key={etapa.numero}>
                <div 
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                    etapa.numero === etapaAtual ? 'scale-110' : 'hover:scale-105'
                  }`}
                  onClick={() => irParaEtapa(etapa.numero)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                    etapa.numero === etapaAtual
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : etapa.numero < etapaAtual
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <Icon name={etapa.icone} />
                  </div>
                  <span className={`text-sm font-medium ${
                    etapa.numero === etapaAtual ? 'text-blue-500' : 'text-muted-foreground'
                  }`}>
                    {etapa.titulo}
                  </span>
                  <span className="text-xs text-muted-foreground hidden md:block">{etapa.descricao}</span>
                </div>
                {index < etapas.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all duration-200 ${
                    etapa.numero < etapaAtual ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6 mb-6">
          {/* Etapa 1: Dados Básicos */}
          {etapaAtual === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="file-alt" className="text-blue-500" />
                  Dados Básicos do Manifesto
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Emitente <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dados.emitenteId || ''}
                    onChange={(e) => updateDados('emitenteId', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border ${
                      errosValidacao.emitenteId ? 'border-red-500' : 'border-gray-300 dark:border-0'
                    } rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  >
                    <option value="">Selecione o emitente</option>
                    {entidadesCarregadas?.emitentes?.map((emitente) => (
                      <option key={emitente.id} value={emitente.id}>
                        {emitente.label}
                      </option>
                    ))}
                  </select>
                  {errosValidacao.emitenteId && (
                    <p className="text-red-500 text-sm mt-1">{errosValidacao.emitenteId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Série
                  </label>
                  <input
                    type="text"
                    value={dados.serie || '1'}
                    onChange={(e) => updateDados('serie', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    UF de Início <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dados.ufIni || ''}
                    onChange={(e) => updateDados('ufIni', e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errosValidacao.ufIni ? 'border-red-500' : 'border-gray-300 dark:border-0'
                    } rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  >
                    <option value="">Selecione a UF</option>
                    {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                  {errosValidacao.ufIni && (
                    <p className="text-red-500 text-sm mt-1">{errosValidacao.ufIni}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    UF de Fim <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dados.ufFim || ''}
                    onChange={(e) => updateDados('ufFim', e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errosValidacao.ufFim ? 'border-red-500' : 'border-gray-300 dark:border-0'
                    } rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  >
                    <option value="">Selecione a UF</option>
                    {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                  {errosValidacao.ufFim && (
                    <p className="text-red-500 text-sm mt-1">{errosValidacao.ufFim}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Informações Adicionais
                </label>
                <textarea
                  value={dados.infoAdicional || ''}
                  onChange={(e) => updateDados('infoAdicional', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Informações complementares sobre o transporte..."
                />
              </div>
            </div>
          )}

          {/* Etapa 2: Transporte */}
          {etapaAtual === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="truck" className="text-blue-500" />
                  Dados do Transporte
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Veículo (Tração) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dados.veiculoId || ''}
                    onChange={(e) => updateDados('veiculoId', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border ${
                      errosValidacao.veiculoId ? 'border-red-500' : 'border-gray-300 dark:border-0'
                    } rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  >
                    <option value="">Selecione o veículo</option>
                    {entidadesCarregadas?.veiculos?.map((veiculo) => (
                      <option key={veiculo.id} value={veiculo.id}>
                        {veiculo.label}
                      </option>
                    ))}
                  </select>
                  {errosValidacao.veiculoId && (
                    <p className="text-red-500 text-sm mt-1">{errosValidacao.veiculoId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Condutor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dados.condutorId || ''}
                    onChange={(e) => updateDados('condutorId', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border ${
                      errosValidacao.condutorId ? 'border-red-500' : 'border-gray-300 dark:border-0'
                    } rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                  >
                    <option value="">Selecione o condutor</option>
                    {entidadesCarregadas?.condutores?.map((condutor) => (
                      <option key={condutor.id} value={condutor.id}>
                        {condutor.label}
                      </option>
                    ))}
                  </select>
                  {errosValidacao.condutorId && (
                    <p className="text-red-500 text-sm mt-1">{errosValidacao.condutorId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Contratante
                  </label>
                  <select
                    value={dados.contratanteId || ''}
                    onChange={(e) => updateDados('contratanteId', parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Selecione o contratante (opcional)</option>
                    {entidadesCarregadas?.contratantes?.map((contratante) => (
                      <option key={contratante.id} value={contratante.id}>
                        {contratante.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Seguradora
                  </label>
                  <select
                    value={dados.seguradoraId || ''}
                    onChange={(e) => updateDados('seguradoraId', parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-0 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Selecione a seguradora (opcional)</option>
                    {entidadesCarregadas?.seguradoras?.map((seguradora) => (
                      <option key={seguradora.id} value={seguradora.id}>
                        {seguradora.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reboques (Opcional)
                </label>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Icon name="exclamation-triangle" className="text-yellow-600 dark:text-yellow-400 mt-0.5 text-sm" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-400">
                      A funcionalidade de reboques será implementada em breve. Por enquanto, prossiga sem reboques ou utilize apenas o veículo de tração.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 3: Carga */}
          {etapaAtual === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="box" className="text-blue-500" />
                  Informações da Carga
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Valor Total da Carga (R$) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.valorTotal || ''}
                    onChange={(e) => updateDados('valorTotal', parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border ${
                      errosValidacao.valorTotal ? 'border-red-500' : 'border-gray-300 dark:border-0'
                    } rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    placeholder="0.00"
                  />
                  {errosValidacao.valorTotal && (
                    <p className="text-red-500 text-sm mt-1">{errosValidacao.valorTotal}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Peso Bruto Total (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dados.pesoBrutoTotal || ''}
                    onChange={(e) => updateDados('pesoBrutoTotal', parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border ${
                      errosValidacao.pesoBrutoTotal ? 'border-red-500' : 'border-gray-300 dark:border-0'
                    } rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    placeholder="0.00"
                  />
                  {errosValidacao.pesoBrutoTotal && (
                    <p className="text-red-500 text-sm mt-1">{errosValidacao.pesoBrutoTotal}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="info-circle" className="text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Informação Importante</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      O valor e peso da carga devem ser informados considerando TODA a carga transportada. 
                      Estes valores serão validados contra os documentos fiscais (CTe/NFe) vinculados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 4: Documentos */}
          {etapaAtual === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="file-invoice" className="text-blue-500" />
                  Documentos Fiscais Vinculados
                </h3>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="exclamation-triangle" className="text-yellow-600 dark:text-yellow-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">Funcionalidade em Desenvolvimento</h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      O gerenciamento de documentos fiscais (CTe/NFe) será implementado em breve. 
                      Por enquanto, você pode prosseguir sem vincular documentos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-8 text-muted-foreground">
                <Icon name="file-alt" className="text-4xl mb-2 mx-auto" />
                <p>Nenhum documento vinculado</p>
              </div>
            </div>
          )}

          {/* Etapa 5: Finalizar */}
          {etapaAtual === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="check-circle" className="text-green-500" />
                  Revisão Final
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resumo dos dados */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Icon name="file-alt" className="text-blue-500" />
                    Dados Básicos
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Emitente:</dt>
                      <dd className="font-medium text-foreground">
                        {entidadesCarregadas?.emitentes?.find((e) => e.id === dados.emitenteId)?.label || 'Não selecionado'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Trajeto:</dt>
                      <dd className="font-medium text-foreground">{dados.ufIni || '?'} → {dados.ufFim || '?'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Icon name="truck" className="text-blue-500" />
                    Transporte
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Veículo:</dt>
                      <dd className="font-medium text-foreground">
                        {entidadesCarregadas?.veiculos?.find((v) => v.id === dados.veiculoId)?.label || 'Não selecionado'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Condutor:</dt>
                      <dd className="font-medium text-foreground">
                        {entidadesCarregadas?.condutores?.find((c) => c.id === dados.condutorId)?.label || 'Não selecionado'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Icon name="box" className="text-blue-500" />
                    Carga
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Valor Total:</dt>
                      <dd className="font-medium text-green-600 dark:text-green-400">
                        R$ {(dados.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Peso Bruto:</dt>
                      <dd className="font-medium text-foreground">
                        {(dados.pesoBrutoTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon name="check-circle" className="text-green-600 dark:text-green-400 mt-1" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-300 mb-1">Pronto para Salvar</h4>
                    <p className="text-sm text-green-800 dark:text-green-400">
                      Revise as informações acima. Você pode salvar como rascunho ou transmitir diretamente para a SEFAZ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-card rounded-lg border border-gray-200 dark:border-0 p-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              {etapaAtual > 1 && (
                <button
                  onClick={etapaAnterior}
                  className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-foreground rounded-lg font-semibold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Icon name="arrow-left" />
                  Anterior
                </button>
              )}
              {onCancelar && (
                <button
                  onClick={onCancelar}
                  className="px-6 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Icon name="times" />
                  Cancelar
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {etapaAtual < 5 ? (
                <button
                  onClick={proximaEtapa}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Próximo
                  <Icon name="arrow-right" />
                </button>
              ) : (
                <>
                  {onSalvarRascunho && (
                    <button
                      onClick={onSalvarRascunho}
                      disabled={salvando}
                      className="px-6 py-2.5 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {salvando ? (
                        <>
                          <Icon name="spinner" className="animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Icon name="save" />
                          Salvar Rascunho
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={onSalvar}
                    disabled={salvando}
                    className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {salvando ? (
                      <>
                        <Icon name="spinner" className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Icon name="check" />
                        {isEdicao ? 'Atualizar MDFe' : 'Salvar MDFe'}
                      </>
                    )}
                  </button>
                  {onTransmitir && (
                    <button
                      onClick={onTransmitir}
                      disabled={transmitindo}
                      className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {transmitindo ? (
                        <>
                          <Icon name="spinner" className="animate-spin" />
                          Transmitindo...
                        </>
                      ) : (
                        <>
                          <Icon name="paper-plane" />
                          Transmitir para SEFAZ
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
