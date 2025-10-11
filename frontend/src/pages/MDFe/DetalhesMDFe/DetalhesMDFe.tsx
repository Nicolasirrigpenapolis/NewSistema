import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../../components/UI/Icon';

interface MDFeDetalhado {
  id: number;
  numero: string;
  serie: string;
  dataEmissao: string;
  ufIni: string;
  ufFim: string;
  valorTotal: number;
  status: 'Autorizado' | 'Pendente' | 'Cancelado' | 'Rejeitado' | 'Rascunho';
  chaveAcesso?: string;
  emitenteNome: string;
  emitenteCnpj: string;
  veiculoPlaca: string;
  condutorNome?: string;
  observacoes?: string;
  dataTransmissao?: string;
  protocoloSefaz?: string;
  motivoRejeicao?: string;
}

export function DetalhesMDFe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mdfe, setMdfe] = useState<MDFeDetalhado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    if (id) {
      carregarMDFe(parseInt(id));
    }
  }, [id]);

  const carregarMDFe = async (mdfeId: number) => {
    try {
      setCarregando(true);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe/${mdfeId}`);

      if (!response.ok) {
        throw new Error('MDFe não encontrado');
      }

      const data = await response.json();

      // Mapear dados da API para o formato esperado pelo componente
      const mdfeDetalhado: MDFeDetalhado = {
        id: data.id,
        numero: data.numeroMdfe?.toString().padStart(9, '0') || '',
        serie: data.serie?.toString() || '001',
        dataEmissao: data.dataEmissao,
        ufIni: data.ufIni || '',
        ufFim: data.ufFim || '',
        valorTotal: data.valorTotal || 0,
        status: mapearStatus(data.statusSefaz),
        chaveAcesso: data.chaveAcesso,
        emitenteNome: data.emitenteRazaoSocial || '',
        emitenteCnpj: data.emitenteCnpj || '',
        veiculoPlaca: data.veiculoPlaca || '',
        condutorNome: data.condutorNome || '',
        observacoes: data.observacoes,
        dataTransmissao: data.dataTransmissao,
        protocoloSefaz: data.numeroProtocolo,
        motivoRejeicao: data.motivoRejeicao
      };

      setMdfe(mdfeDetalhado);
    } catch (error) {
      console.error('Erro ao carregar MDFe:', error);
      exibirMensagem('erro', 'Erro ao carregar os detalhes do MDFe');
    } finally {
      setCarregando(false);
    }
  };

  // Função auxiliar para mapear status da API
  const mapearStatus = (status: string): 'Autorizado' | 'Pendente' | 'Cancelado' | 'Rejeitado' | 'Rascunho' => {
    switch (status?.toUpperCase()) {
      case 'AUTORIZADO':
        return 'Autorizado';
      case 'CANCELADO':
        return 'Cancelado';
      case 'REJEITADO':
        return 'Rejeitado';
      case 'PENDENTE':
        return 'Pendente';
      case 'RASCUNHO':
      default:
        return 'Rascunho';
    }
  };

  const exibirMensagem = (tipo: 'sucesso' | 'erro', texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 5000);
  };

  const handleTransmitir = async () => {
    if (!window.confirm('Deseja transmitir este MDFe para a SEFAZ?')) {
      return;
    }

    try {
      setProcessando('transmitir');

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe/${id}/transmitir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const resultado = await response.json();

      if (response.ok) {
        exibirMensagem('sucesso', 'MDFe transmitido com sucesso para a SEFAZ!');
        await carregarMDFe(parseInt(id!));
      } else {
        exibirMensagem('erro', resultado.message || 'Erro ao transmitir MDFe');
      }
    } catch (error) {
      console.error('Erro ao transmitir:', error);
      exibirMensagem('erro', 'Erro ao transmitir MDFe');
    } finally {
      setProcessando(null);
    }
  };

  const handleCancelar = async () => {
    const justificativa = window.prompt('Digite a justificativa para cancelamento (mínimo 15 caracteres):');

    if (!justificativa) {
      return;
    }

    if (justificativa.length < 15) {
      exibirMensagem('erro', 'Justificativa deve ter no mínimo 15 caracteres');
      return;
    }

    if (!window.confirm(`Deseja realmente cancelar este MDFe?\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setProcessando('cancelar');

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe/${id}/cancelar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ justificativa })
      });

      const resultado = await response.json();

      if (response.ok) {
        exibirMensagem('sucesso', 'MDFe cancelado com sucesso!');
        await carregarMDFe(parseInt(id!));
      } else {
        exibirMensagem('erro', resultado.message || 'Erro ao cancelar MDFe');
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      exibirMensagem('erro', 'Erro ao cancelar MDFe');
    } finally {
      setProcessando(null);
    }
  };

  const handleGerarMDFe = async () => {
    try {
      setProcessando('gerar');

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe/${id}/gerar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const resultado = await response.json();

      if (response.ok) {
        exibirMensagem('sucesso', 'MDFe gerado com sucesso!');
        await carregarMDFe(parseInt(id!));
      } else {
        exibirMensagem('erro', resultado.mensagem || 'Erro ao gerar MDFe');
      }
    } catch (error) {
      console.error('Erro ao gerar MDFe:', error);
      exibirMensagem('erro', 'Erro ao gerar MDFe');
    } finally {
      setProcessando(null);
    }
  };

  const handleConsultarStatus = async () => {
    if (!mdfe?.chaveAcesso) {
      exibirMensagem('erro', 'Chave de acesso não disponível');
      return;
    }

    try {
      setProcessando('consultar');

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe/consultar-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chaveAcesso: mdfe.chaveAcesso })
      });

      const resultado = await response.json();

      if (response.ok) {
        exibirMensagem('sucesso', 'Status consultado com sucesso!');
        await carregarMDFe(parseInt(id!));
      } else {
        exibirMensagem('erro', resultado.mensagem || 'Erro ao consultar status');
      }
    } catch (error) {
      console.error('Erro ao consultar status:', error);
      exibirMensagem('erro', 'Erro ao consultar status');
    } finally {
      setProcessando(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Autorizado': return '#10b981';
      case 'Rascunho': return '#f59e0b';
      case 'Pendente': return '#3b82f6';
      case 'Rejeitado': return '#ef4444';
      case 'Cancelado': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Carregando detalhes do MDFe...</span>
      </div>
    );
  }

  if (!mdfe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <i className="fas fa-exclamation-triangle"></i>
        <span>MDFe não encontrado</span>
        <button onClick={() => navigate('/mdfes')} className="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-muted transition-colors duration-200">
          Voltar à Listagem
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Mensagem de Feedback */}
      {mensagem && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center justify-between ${
          mensagem.tipo === 'sucesso'
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
        }`}>
          <div className="flex items-center gap-3">
            <i className={`fas ${
              mensagem.tipo === 'sucesso' ? 'fa-check-circle' : 'fa-exclamation-circle'
            }`}></i>
            <span>{mensagem.texto}</span>
          </div>
          <button
            className="text-current hover:opacity-70 transition-opacity duration-200"
            onClick={() => setMensagem(null)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-8 bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/mdfes')}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-muted transition-colors duration-200"
          >
            <i className="fas fa-arrow-left"></i>
            Voltar
          </button>
          <div className="space-y-2">
            <h1>MDFe #{mdfe.numero}</h1>
            <div
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: getStatusColor(mdfe.status) }}
            >
              {mdfe.status}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ações condicionais por status */}
          {mdfe.status === 'Rascunho' && (
            <>
              <button
                onClick={() => navigate(`/mdfes/editar/${mdfe.id}`)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                disabled={!!processando}
              >
                <i className="fas fa-edit"></i>
                Editar
              </button>
              <button
                onClick={handleTransmitir}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                disabled={!!processando}
              >
                {processando === 'transmitir' ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
                {processando === 'transmitir' ? 'Transmitindo...' : 'Transmitir'}
              </button>
            </>
          )}

          {mdfe.status === 'Rejeitado' && (
            <>
              <button
                onClick={() => navigate(`/mdfes/editar/${mdfe.id}`)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                disabled={!!processando}
              >
                <i className="fas fa-edit"></i>
                Corrigir & Editar
              </button>
              <button
                onClick={handleTransmitir}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                disabled={!!processando}
              >
                {processando === 'transmitir' ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
                {processando === 'transmitir' ? 'Retransmitindo...' : 'Retransmitir'}
              </button>
            </>
          )}

          {(mdfe.status === 'Autorizado' || mdfe.status === 'Pendente') && (
            <>
              <button
                onClick={handleConsultarStatus}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                disabled={!!processando}
              >
                {processando === 'consultar' ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-search"></i>
                )}
                Consultar Status
              </button>
              <button
                onClick={handleCancelar}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                disabled={!!processando}
              >
                {processando === 'cancelar' ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-times"></i>
                )}
                Cancelar
              </button>
            </>
          )}

          {/* Gerar MDFe para rascunhos */}
          {mdfe.status === 'Rascunho' && (
            <button
              onClick={handleGerarMDFe}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              disabled={!!processando}
            >
              {processando === 'gerar' ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-cog"></i>
              )}
              Gerar MDFe
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <i className="fas fa-info-circle"></i>
            Informações Básicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Número:</label>
              <span className="block text-foreground">{mdfe.numero}</span>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Série:</label>
              <span className="block text-foreground">{mdfe.serie}</span>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Data Emissão:</label>
              <span className="block text-foreground">{new Date(mdfe.dataEmissao).toLocaleString('pt-BR')}</span>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">UF Origem:</label>
              <span className="block text-foreground">{mdfe.ufIni}</span>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">UF Destino:</label>
              <span className="block text-foreground">{mdfe.ufFim}</span>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Valor da Carga:</label>
              <span className="block text-foreground">R$ {mdfe.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            {mdfe.chaveAcesso && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Chave de Acesso:</label>
                <span className="block font-mono text-sm bg-muted px-2 py-1 rounded text-foreground">{mdfe.chaveAcesso}</span>
              </div>
            )}
          </div>
        </div>

        {/* Emitente */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <i className="fas fa-building"></i>
            Emitente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Razão Social:</label>
              <span className="block text-foreground">{mdfe.emitenteNome}</span>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">CNPJ:</label>
              <span className="block text-foreground">{mdfe.emitenteCnpj}</span>
            </div>
          </div>
        </div>

        {/* Transporte */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <i className="fas fa-truck"></i>
            Transporte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Veículo:</label>
              <span className="block text-foreground">{mdfe.veiculoPlaca}</span>
            </div>
            {mdfe.condutorNome && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Condutor:</label>
                <span className="block text-foreground">{mdfe.condutorNome}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status e Protocolo */}
        {(mdfe.dataTransmissao || mdfe.protocoloSefaz || mdfe.motivoRejeicao) && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <i className="fas fa-exchange-alt"></i>
              Status SEFAZ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mdfe.dataTransmissao && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Data Transmissão:</label>
                  <span className="block text-foreground">{new Date(mdfe.dataTransmissao).toLocaleString('pt-BR')}</span>
                </div>
              )}
              {mdfe.protocoloSefaz && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Protocolo:</label>
                  <span className="block text-foreground">{mdfe.protocoloSefaz}</span>
                </div>
              )}
              {mdfe.motivoRejeicao && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Motivo Rejeição:</label>
                  <span className="block text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{mdfe.motivoRejeicao}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        {mdfe.observacoes && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <i className="fas fa-sticky-note"></i>
              Observações
            </h2>
            <div className="text-muted-foreground bg-muted p-4 rounded-lg">
              {mdfe.observacoes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}