import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { mdfeService } from '../../../services/mdfeService';
import { entitiesService } from '../../../services/entitiesService';
import { MDFeData, EntidadesCarregadas, MdfeTransmissaoResponse } from '../../../types/mdfe';
import { MDFeForm } from '../../../components/UI/Forms/MDFeForm';
import { ErrorDisplay } from '../../../components/UI/ErrorDisplay/ErrorDisplay';

export function FormularioMDFe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const modoVisualizacao = searchParams.get('modo') === 'visualizar';
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string>('');
  const [transmitindo, setTransmitindo] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [mostrarModalCancelamento, setMostrarModalCancelamento] = useState(false);
  const [temAlteracoesNaoSalvas, setTemAlteracoesNaoSalvas] = useState(false);

  const [entidadesCarregadas, setEntidadesCarregadas] = useState<EntidadesCarregadas | null>(null);
  const [dados, setDados] = useState<Partial<MDFeData>>({
    // Nova interface simplificada - apenas campos básicos
    documentosCTe: [],
    documentosNFe: []
  });


  useEffect(() => {
    carregarDadosIniciais();
    if (id) {
      carregarMDFe(id);
    }
  }, [id]);

  // Detectar alterações nos dados para ativar o aviso
  useEffect(() => {
    // FRONTEND SIMPLIFICADO: Detectar alterações apenas nos campos principais
    const temDados =
      dados.emitenteId ||
      dados.veiculoId ||
      dados.condutorId ||
      dados.ufIni ||
      dados.ufFim ||
      dados.valorTotal ||
      dados.pesoBrutoTotal;

    setTemAlteracoesNaoSalvas(!!temDados);
  }, [dados]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      setMensagemSucesso('');
      setErro('');
    };
  }, []);

  // Bloquear navegação se houver alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (temAlteracoesNaoSalvas) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [temAlteracoesNaoSalvas]);

  const carregarDadosIniciais = async () => {
    try {
      const entidades = await entitiesService.obterTodasEntidades();
      setEntidadesCarregadas(entidades);
      if (!id) {
        await gerarProximoNumero();
      }
    } catch (error) {
      setErro('Erro ao carregar dados necessários para o formulário');
    }
  };

  const gerarProximoNumero = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/mdfe/proximo-numero`);

      const proximoNumero = response.ok
        ? ((await response.json()).proximoNumero || 700)
        : 700;

      // Nova interface simplificada - não precisa mais de objeto ide
      setDados(dadosAtuais => ({
        ...dadosAtuais
        // Próximo número será gerenciado pelo backend
      }));
    } catch (error) {
      // Nova interface simplificada - fallback será gerenciado pelo backend
      setDados(dadosAtuais => ({
        ...dadosAtuais
      }));
    }
  };

  const carregarMDFe = async (mdfeId: string) => {
    setCarregandoDados(true);
    setErro('');

    try {
      const resultado = await mdfeService.obterMDFeCompleto(parseInt(mdfeId));

      if (resultado.sucesso && resultado.dados) {
        // Estrutura: { mdfe: {...}, entities: {...} }
        const { mdfe, entities } = resultado.dados as any;

        if (mdfe) {
          // FRONTEND SIMPLIFICADO: Extrair APENAS IDs das entidades para edição
          const dadosSimplificados: Partial<MDFeData> = {
            id: mdfe.id?.toString(),

            // APENAS IDs das entidades (responsabilidade do frontend)
            emitenteId: mdfe.emitenteId,
            veiculoId: mdfe.veiculoId,
            condutorId: mdfe.condutorId,
            contratanteId: mdfe.contratanteId,
            seguradoraId: mdfe.seguradoraId,

            // Campos básicos que o usuário pode editar
            ufIni: mdfe.ufIni,
            ufFim: mdfe.ufFim,
            pesoBrutoTotal: mdfe.pesoBrutoTotal,
            valorTotal: mdfe.valorTotal,
            infoAdicional: mdfe.infoAdicional,

            // Arrays simples (sem parsing complexo)
            documentosCTe: mdfe.documentosCTe || [],
            documentosNFe: mdfe.documentosNFe || [],
            reboquesIds: mdfe.reboquesIds || [],

            // Localidades e rota - incluir para edição
            localidadesCarregamento: mdfe.localidadesCarregamento || [],
            localidadesDescarregamento: mdfe.localidadesDescarregamento || [],
            rotaPercurso: mdfe.rotaPercurso || [],

            // Status apenas para exibição
            chaveAcesso: mdfe.chaveAcesso,
            protocolo: mdfe.protocolo,
            statusSefaz: mdfe.statusSefaz
          };

          setDados(dadosSimplificados);

          // Definir as entidades carregadas
          setEntidadesCarregadas(entities);
        }
      } else {
        setErro(`Erro ao carregar MDFe: ${resultado.mensagem}`);
      }
    } catch (error) {
      console.error('Erro ao carregar MDFe:', error);
      setErro('Erro inesperado ao carregar MDFe. Tente novamente.');
    } finally {
      setCarregandoDados(false);
    }
  };



  const salvar = async () => {
    setSalvando(true);
    try {
      // FRONTEND SIMPLIFICADO: Enviar apenas dados coletados, backend define datas e lógica
      const resultado = id
        ? await mdfeService.atualizarMDFe(parseInt(id), dados as MDFeData)
        : await mdfeService.criarMDFe(dados as MDFeData);

      if (resultado.sucesso) {
        setTemAlteracoesNaoSalvas(false);
        setMensagemSucesso('MDFe salvo com sucesso');

        // Redirecionar para listagem
        setTimeout(() => {
          navigate('/mdfes');
        }, 1500);
      } else {
        setErro(`Erro ao salvar MDFe: ${resultado.mensagem}`);
        console.error('Erro detalhado:', resultado);
      }
    } catch (error) {
      setErro('Erro inesperado ao salvar MDFe. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const salvarRascunho = async () => {
    setSalvando(true);
    try {
      // FRONTEND SIMPLIFICADO: Backend define datas automaticamente
      const resultado = await mdfeService.salvarRascunho(dados as MDFeData);

      if (resultado.sucesso) {
        setTemAlteracoesNaoSalvas(false);
        setMensagemSucesso('Rascunho salvo com sucesso');

        // Se retornou um ID e não tínhamos um, atualizar os dados
        if (resultado.dados?.id && !id) {
          setDados(dadosAtuais => ({ ...dadosAtuais, id: resultado.dados.id.toString() }));
        }

        // Redirecionar para listagem após salvar rascunho
        setTimeout(() => {
          navigate('/mdfes');
        }, 1500);
      } else {
        setErro(`Erro ao salvar rascunho: ${resultado.mensagem}`);
        console.error('Erro detalhado:', resultado);
      }
    } catch (error) {
      setErro('Erro inesperado ao salvar rascunho. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const cancelar = () => {
    if (temAlteracoesNaoSalvas) {
      setMostrarModalCancelamento(true);
    } else {
      navigate('/mdfes');
    }
  };

  const confirmarCancelamento = () => {
    setTemAlteracoesNaoSalvas(false);
    setMostrarModalCancelamento(false);
    navigate('/mdfes');
  };

  const continuarEditando = () => {
    setMostrarModalCancelamento(false);
  };

  const transmitir = async () => {

    if (!window.confirm('Deseja transmitir este MDFe para a SEFAZ?')) {
      return;
    }

    setTransmitindo(true);
    setErro('');
    setMensagemSucesso('');

    try {
      await salvar();


      // FRONTEND SIMPLIFICADO: Backend prepara INI automaticamente


      // Se não tem ID, precisa salvar primeiro
      if (!id) {
        setErro('É necessário salvar o MDFe antes de transmitir');
        return;
      }

      const resultadoTransmissao = await mdfeService.transmitirMDFe(parseInt(id));

      if (resultadoTransmissao.sucesso) {
        const detalhes = resultadoTransmissao.dados as MdfeTransmissaoResponse | undefined;
        const protocolo = detalhes?.protocolo ?? '---';
        const status = detalhes?.codigoStatus ?? '---';
        const motivo = detalhes?.motivoStatus ?? 'Status não informado';

        setMensagemSucesso(`MDFe autorizado (cStat ${status}) - ${motivo}. Protocolo: ${protocolo}`);
        if (detalhes?.chaveMDFe) {
          setDados(prev => ({
            ...prev,
            chaveAcesso: detalhes.chaveMDFe
          }));
        }
        setTimeout(() => navigate('/mdfes'), 3000);
      } else {
        const detalhes = resultadoTransmissao.dados as MdfeTransmissaoResponse | undefined;
        console.error('TRANSMITIR - ERRO NA TRANSMISSÃO:', resultadoTransmissao);
        if (detalhes?.codigoStatus) {
          setErro(`SEFAZ retornou ${detalhes.codigoStatus}: ${detalhes.motivoStatus ?? 'Motivo não informado'}`);
        } else {
          setErro(`Erro na transmissão: ${resultadoTransmissao.mensagem}`);
        }
      }

    } catch (error) {
      console.error('TRANSMITIR - ERRO CRÍTICO:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack available');
      setErro('Erro inesperado ao transmitir MDFe. Tente novamente.');
    } finally {
      setTransmitindo(false);
    }
  };



  return (
    <div className="min-h-screen bg-background">
      {/* Modal de Confirmação de Cancelamento */}
      {mostrarModalCancelamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-amber-600 text-lg"></i>
              </div>
              <h3 className="text-white font-bold text-lg">Cancelar Edição?</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-foreground mb-4 text-base leading-relaxed">
                Você tem <strong>alterações não salvas</strong>. Se sair agora, todas as modificações serão perdidas.
              </p>
              <p className="text-muted-foreground text-sm">
                Deseja realmente cancelar e descartar as alterações?
              </p>
            </div>

            {/* Actions */}
            <div className="bg-muted px-6 py-4 flex gap-3 justify-end border-t border-border">
              <button
                onClick={continuarEditando}
                className="px-6 py-2.5 bg-card hover:bg-background border-2 border-border text-foreground rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Continuar Editando
              </button>
              <button
                onClick={confirmarCancelamento}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <i className="fas fa-times mr-2"></i>
                Descartar e Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de carregamento */}
      {carregandoDados && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-blue-500 text-white rounded-lg flex items-center gap-2 shadow-lg">
          <i className="fas fa-spinner fa-spin"></i>
          <span className="text-sm font-medium">Carregando...</span>
        </div>
      )}

      {erro && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-red-500 text-white rounded-lg flex items-center gap-2 shadow-lg max-w-sm">
          <i className="fas fa-exclamation-circle"></i>
          <span className="text-sm font-medium">{erro}</span>
          <button onClick={() => setErro('')} className="ml-2 hover:opacity-75">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Mensagem de sucesso */}
      {mensagemSucesso && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-green-500 text-white rounded-lg flex items-center gap-2 shadow-lg">
          <i className="fas fa-check-circle"></i>
          <span className="text-sm font-medium">{mensagemSucesso}</span>
        </div>
      )}

      <MDFeForm
        dados={dados}
        onDadosChange={setDados}
        onSalvar={salvar}
        onSalvarRascunho={salvarRascunho}
        onCancelar={cancelar}
        onTransmitir={transmitir}
        salvando={salvando}
        transmitindo={transmitindo}
        isEdicao={!!id}
        carregandoDados={carregandoDados}
        entidadesCarregadas={entidadesCarregadas}
      />
    </div>
  );
}
