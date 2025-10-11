import React, { useEffect, useMemo, useState, useRef } from 'react';
import Icon from '../../../components/UI/Icon';
import { emitenteConfig } from '../../../components/Emitentes/EmitenteConfig';
import { GenericFormModal } from '../../../components/UI/feedback/GenericFormModal';
import { empresaService } from '../../../services/empresaService';
import { useEmpresa } from '../../../contexts/EmpresaContext';
import { emitenteService, EmitenteDto } from '../../../services/emitenteService';
import { formatCNPJ, formatCPF, applyMask } from '../../../utils/formatters';

interface MensagemFeedback {
  tipo: 'sucesso' | 'erro';
  texto: string;
}

export function ConfiguracaoEmitente() {
  const { empresa, carregando: carregandoEmpresa, atualizar: atualizarEmpresa } = useEmpresa();
  const [emitente, setEmitente] = useState<EmitenteDto | null>(null);
  const [carregandoEmitente, setCarregandoEmitente] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mensagem, setMensagem] = useState<MensagemFeedback | null>(null);

  const inputLogotipoRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregandoEmitente(true);
      await atualizarEmpresa();
      const dadosEmitente = await emitenteService.obterEmitenteAtual();
      setEmitente(dadosEmitente);
    } catch (error) {
      console.error(error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar informaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes da empresa.' });
    } finally {
      setCarregandoEmitente(false);
    }
  };
  const abrirModal = () => {
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const handleSalvarEmitente = async (dados: EmitenteDto) => {
    try {
      setProcessando(true);
      await emitenteService.salvarEmitente({
        ...emitente,
        ...dados,
        ativo: dados.ativo ?? true
      });
      setMensagem({ tipo: 'sucesso', texto: 'Emitente atualizado com sucesso.' });
      setModalAberto(false);
      await carregarDados();
    } catch (error: any) {
      console.error(error);
      setMensagem({ tipo: 'erro', texto: error?.message || 'Erro ao salvar emitente.' });
    } finally {
      setProcessando(false);
    }
  };

  const handleUploadLogotipo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const arquivo = event.target.files[0];

    try {
      setUploading(true);
      const resultado = await empresaService.enviarLogotipo(arquivo);
      setMensagem({ tipo: 'sucesso', texto: resultado.mensagem });

      await atualizarEmpresa();
    } catch (error: any) {
      console.error(error);
      setMensagem({ tipo: 'erro', texto: error?.message || 'Erro ao enviar logotipo.' });
    } finally {
      setUploading(false);
      if (inputLogotipoRef.current) {
        inputLogotipoRef.current.value = '';
      }
    }
  };

  const nomeEmitente = emitente?.razaoSocial || 'Emitente não configurado';
  const documentoFormatado = useMemo(() => {
    if (emitente?.cnpj) return formatCNPJ(emitente.cnpj);
    if (emitente?.cpf) return formatCPF(emitente.cpf);
    return 'Documento nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o informado';
  }, [emitente]);

  const caminhoBase = empresa?.caminhoBaseArmazenamento || '';
  const caminhoCombinado = (subpasta?: string | null) => {
    if (!subpasta) {
      return '-';
    }

    if (!caminhoBase) {
      return subpasta;
    }

    const baseNormalizada = caminhoBase.replace(/[\\/]+$/, '');
    const subNormalizada = subpasta.replace(/^[\\/]+/, '');
    return `${baseNormalizada}\\${subNormalizada}`;
  };

  const sectionsForm = useMemo(() => emitenteConfig.form.getSections(emitente || undefined), [emitente]);
  const carregando = carregandoEmitente || carregandoEmpresa;

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ConfiguraÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o do Emitente</h1>
          <p className="text-muted-foreground mt-2">
            Ajuste as informaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes fiscais da empresa e personalize o logotipo exibido nos relatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rios.
          </p>
        </div>

        <button
          onClick={abrirModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
        >
          <Icon name="edit" />
          {emitente ? 'Editar dados do emitente' : 'Configurar emitente'}
        </button>
      </div>

      {mensagem && (
        <div
          className={`rounded-lg px-4 py-3 border text-sm ${
            mensagem.tipo === 'sucesso'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center h-64 bg-card rounded-xl border border-dashed border-gray-300">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            Carregando informaÃ§Ãµes da empresa...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Logotipo */}
          <div className="bg-card border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Icon name="image" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Logotipo</h2>
                <p className="text-sm text-muted-foreground">Imagem exibida nos relatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rios e documentos fiscais.</p>
              </div>
            </div>

            <div className="border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center min-h-[220px] p-6 bg-gray-50 dark:bg-gray-900/40">
              {empresa?.urlLogotipo ? (
                <img
                  src={empresa.urlLogotipo}
                  alt="Logotipo da empresa"
                  className="max-h-40 w-auto object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground flex flex-col items-center gap-3">
                  <Icon name="image" size="xl" />
                  <span>Nenhum logotipo enviado atÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© o momento.</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <input
                ref={inputLogotipoRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={handleUploadLogotipo}
                disabled={uploading}
              />
              <button
                onClick={() => inputLogotipoRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-600 font-semibold hover:bg-blue-50 disabled:opacity-50"
              >
                <Icon name="upload" />
                {uploading ? 'Enviando...' : empresa?.urlLogotipo ? 'Atualizar logotipo' : 'Enviar logotipo'}
              </button>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PNG, JPG ou SVG. Tamanho mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ximo: 5 MB.
              </p>
            </div>
          </div>

          {/* Dados da empresa */}
          <div className="bg-card border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Icon name="building" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Dados da instalaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</h2>
                <p className="text-sm text-muted-foreground">InformaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes locais desta instÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ncia do sistema.</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block">Identificador</span>
                <span className="font-medium text-foreground">{empresa?.identificador || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Nome de exibiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o</span>
                <span className="font-medium text-foreground">{empresa?.nomeExibicao || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Banco de dados</span>
                <span className="font-medium text-foreground">{empresa?.bancoDados || '-'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-2">
              <p className="text-sm font-semibold text-foreground">Pastas utilizadas</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>DiretÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³rio base: <span className="font-medium text-foreground">{caminhoBase || '-'}</span></div>
                <div>XMLs: <span className="font-medium text-foreground">{caminhoCombinado(empresa?.pastaXml)}</span></div>
                <div>Certificados: <span className="font-medium text-foreground">{caminhoCombinado(empresa?.pastaCertificados)}</span></div>
                <div>Logos: <span className="font-medium text-foreground">{caminhoCombinado(empresa?.pastaLogos)}</span></div>
              </div>
            </div>
          </div>

          {/* Dados do emitente */}
          <div className="bg-card border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Icon name="id-card" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Dados fiscais</h2>
                <p className="text-sm text-muted-foreground">
                  IdentificaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o da empresa emissora vinculada a esta instalaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block">RazÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o social</span>
                <span className="font-medium text-foreground">{nomeEmitente}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Documento</span>
                <span className="font-medium text-foreground">{documentoFormatado}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">EndereÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o</span>
                <span className="font-medium text-foreground">
                  {emitente
                    ? `${emitente.endereco}${emitente.numero ? `, ${emitente.numero}` : ''} - ${emitente.bairro}`
                    : 'EndereÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o informado'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">MunicÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­pio / UF</span>
                <span className="font-medium text-foreground">
                  {emitente ? `${emitente.municipio}/${emitente.uf}` : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">CEP</span>
                <span className="font-medium text-foreground">
                  {emitente?.cep ? applyMask(emitente.cep, 'cep') : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Certificado digital</span>
                <span className="font-medium text-foreground">
                  {emitente?.caminhoCertificadoDigital || '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Senha do certificado</span>
                <span className="font-medium text-foreground">
                  {emitente?.senhaCertificadoDigital ? '********' : '-'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={abrirModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-colors"
              >
                <Icon name="edit" />
                {emitente ? 'Editar emitente' : 'Configurar emitente'}
              </button>
              <p className="text-xs text-muted-foreground">
                Somente um emitente pode ser configurado por instalacao. Todas as emissoes e permissoes utilizam esse cadastro.
              </p>
            </div>
          </div>
        </div>
      )}

      <GenericFormModal<EmitenteDto>
        isOpen={modalAberto}
        onClose={fecharModal}
        onCancel={fecharModal}
        onSave={handleSalvarEmitente}
        data={(emitente ?? emitenteConfig.form.defaultValues) as EmitenteDto}
        sections={sectionsForm}
        isEdit={!!emitente}
        loading={processando}
        headerIcon={emitenteConfig.form.headerIcon}
        headerColor={emitenteConfig.form.headerColor}
        title={emitente ? emitenteConfig.form.editTitle || emitenteConfig.form.title : emitenteConfig.form.title}
        subtitle={emitente ? emitenteConfig.form.editSubtitle || emitenteConfig.form.subtitle : emitenteConfig.form.subtitle}
      />
    </div>
  );
}

















