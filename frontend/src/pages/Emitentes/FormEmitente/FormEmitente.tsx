import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { emitenteConfig } from '../../../components/Emitentes/EmitenteConfig';
import { entitiesService } from '../../../services/entitiesService';
import Icon from '../../../components/UI/Icon';

// Local form data type (EmitenteConfig doesn't export a dedicated form data type)
type EmitenteFormDataLocal = any;

interface Emitente extends EmitenteFormDataLocal {
  id?: number;
  ativo?: boolean;
}

interface LocationState {
  emitente?: Emitente;
}

export function FormEmitente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id);
  const emitenteFromState = (location.state as LocationState | undefined)?.emitente;

  const [initialData, setInitialData] = useState<Emitente | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const carregar = async () => {
      if (!isEdit) {
        if (isMounted) {
          setInitialData({ ativo: true } as Emitente);
          setLoading(false);
        }
        return;
      }

      if (emitenteFromState && isMounted) {
        setInitialData(emitenteFromState);
      }

      try {
        setLoading(true);
        const resp = await entitiesService.buscarEmitentePorId(Number(id));
        if (!isMounted) return;
        if (resp && resp.dados) {
          setInitialData(resp.dados as Emitente);
          setError(null);
        } else {
          setError('Não foi possível carregar o emitente.');
        }
      } catch (err) {
        console.error('Erro ao carregar emitente:', err);
        if (isMounted) setError('Erro inesperado ao carregar emitente.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    carregar();

    return () => { isMounted = false; };
  }, [id, isEdit, emitenteFromState]);

  const sections = useMemo(() => {
    // getSections expects the emitente item shape; we pass initialData as any to avoid strict typing issues during migration
    return emitenteConfig.form.getSections(initialData as any);
  }, [initialData]);

  const handleBack = () => navigate('/emitentes');

  const handleSave = async (dados: EmitenteFormDataLocal) => {
    setError(null);
    try {
      if (isEdit && id) {
        await entitiesService.atualizarEmitente(Number(id), dados);
      } else {
        await entitiesService.criarEmitente(dados);
      }

      navigate('/emitentes', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      console.error('Erro ao salvar emitente:', err);
      const mensagem = err?.message || 'Erro ao salvar emitente.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEdit ? (emitenteConfig.form.editTitle || emitenteConfig.form.title) : emitenteConfig.form.title;
  const pageSubtitle = isEdit ? (emitenteConfig.form.editSubtitle || emitenteConfig.form.subtitle || '') : (emitenteConfig.form.subtitle || '');

  if (loading || (!initialData && isEdit)) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-card rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando dados do emitente...</p>
          <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 transition-colors">
            <Icon name="arrow-left" size="sm" /> Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{pageSubtitle}</p>
        </div>
        <button onClick={handleBack} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-card text-foreground hover:bg-background transition-colors">
          <Icon name="arrow-left" size="sm" /> Voltar para lista
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
          <Icon name="exclamation-triangle" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {initialData && (
        <GenericForm<EmitenteFormDataLocal>
          data={initialData as any}
          sections={sections}
          isEditing={isEdit}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={emitenteConfig.form.headerIcon}
          headerColor={emitenteConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          submitLabel={isEdit ? 'Atualizar emitente' : 'Salvar emitente'}
          cancelLabel="Cancelar"
          pageClassName="max-w-4xl mx-auto"
        />
      )}
    </div>
  );
}

export default FormEmitente;
