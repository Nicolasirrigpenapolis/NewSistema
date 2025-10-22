import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { reboqueConfig } from '../../../components/Reboques/ReboqueConfig';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import { entitiesService } from '../../../services/entitiesService';

interface Reboque {
  id?: number;
  placa: string;
  tara: number;
  tipoRodado: string;
  tipoCarroceria: string;
  uf: string;
  rntrc?: string;
  ativo?: boolean;
}

interface LocationState {
  reboque?: Reboque;
}

export function FormReboque() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id);
  const reboqueFromState = (location.state as LocationState | undefined)?.reboque;

  const [initialData, setInitialData] = useState<Reboque | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const carregarReboque = async () => {
      if (!isEdit) {
        if (isMounted) {
          setInitialData({
            ...(reboqueConfig.form.defaultValues as Reboque),
            ativo: true
          });
          setLoading(false);
        }
        return;
      }

      if (reboqueFromState && isMounted) {
        setInitialData(reboqueFromState);
      }

      try {
        setLoading(true);
        const resposta = await entitiesService.buscarReboquePorId(Number(id));

        if (!isMounted) return;

        if (resposta.sucesso && resposta.dados) {
          setInitialData(resposta.dados as Reboque);
          setError(null);
        } else {
          setError(resposta.mensagem || 'Não foi possível carregar os dados do reboque.');
        }
      } catch (err) {
        console.error('Erro ao carregar reboque:', err);
        if (isMounted) {
          setError('Erro inesperado ao carregar reboque.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarReboque();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, reboqueFromState]);

  const sections = useMemo(() => {
    return reboqueConfig.form.getSections(initialData ?? undefined);
  }, [initialData]);

  const handleBack = () => {
    navigate('/reboques');
  };

  const handleSave = async (dados: Reboque) => {
    setError(null);

    const taraSanitizada = Number(String(dados.tara ?? '').replace(/\D/g, '')) || 0;

    const payload: Reboque = {
      ...dados,
      placa: dados.placa?.trim().toUpperCase(),
      tara: taraSanitizada,
      uf: dados.uf?.toUpperCase(),
      tipoRodado: dados.tipoRodado?.trim() || '',
      tipoCarroceria: dados.tipoCarroceria?.trim() || '',
      rntrc: dados.rntrc?.trim() || undefined,
      ativo: dados.ativo ?? true
    };

    try {
      const resposta = isEdit && id
        ? await entitiesService.atualizarReboque(Number(id), payload)
        : await entitiesService.criarReboque(payload);

      if (!resposta.sucesso) {
        const mensagem = resposta.mensagem || 'Erro ao salvar reboque.';
        setError(mensagem);
        throw new Error(mensagem);
      }

      navigate('/reboques', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      console.error('Erro ao salvar reboque:', err);
      const mensagem = err?.message || 'Erro ao salvar reboque.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEdit
    ? reboqueConfig.form.editTitle || reboqueConfig.form.title
    : reboqueConfig.form.title;

  const pageSubtitle = isEdit
    ? reboqueConfig.form.editSubtitle || reboqueConfig.form.subtitle
    : reboqueConfig.form.subtitle;

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={reboqueConfig.form.headerIcon}
      headerColor={reboqueConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading || (!initialData && isEdit)}
      loadingMessage="Carregando dados do reboque..."
      error={error}
    >
      {initialData && (
        <GenericForm<Reboque>
          data={initialData}
          sections={sections}
          isEditing={isEdit}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={reboqueConfig.form.headerIcon}
          headerColor={reboqueConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          hideCancelButton={false}
          submitLabel={isEdit ? 'Atualizar Reboque' : 'Cadastrar Reboque'}
          cancelLabel="Cancelar"
          maxWidth="full"
        />
      )}
    </FormPageLayout>
  );
}
