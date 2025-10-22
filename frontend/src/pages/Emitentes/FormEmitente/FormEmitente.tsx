import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { emitenteConfig } from '../../../components/Emitentes/EmitenteConfig';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import { entitiesService } from '../../../services/entitiesService';

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

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={emitenteConfig.form.headerIcon}
      headerColor={emitenteConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading || (!initialData && isEdit)}
      loadingMessage="Carregando dados do emitente..."
      error={error}
    >
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
          maxWidth="full"
        />
      )}
    </FormPageLayout>
  );
}

export default FormEmitente;
