import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { seguradoraConfig, SeguradoraFormData } from '../../../components/Seguradoras/SeguradoraConfig';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import { entitiesService } from '../../../services/entitiesService';
import { cleanNumericString } from '../../../utils/formatters';

interface Seguradora extends SeguradoraFormData {
  id?: number;
  ativo?: boolean;
}

interface LocationState {
  seguradora?: Seguradora;
}

export function FormSeguradora() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const seguradoraFromState = (location.state as LocationState | undefined)?.seguradora;

  const [initialData, setInitialData] = useState<Seguradora | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const carregarSeguradora = async () => {
      if (!isEdit) {
        if (isMounted) {
          setInitialData({
            ...(seguradoraConfig.form.defaultValues as Seguradora),
            ativo: seguradoraConfig.form.defaultValues?.ativo ?? true
          });
          setLoading(false);
        }
        return;
      }

      if (seguradoraFromState && isMounted) {
        setInitialData(seguradoraFromState);
      }

      try {
        setLoading(true);
        const resposta = await entitiesService.buscarSeguradoraPorId(Number(id));

        if (!isMounted) return;

        if (resposta.sucesso && resposta.dados) {
          setInitialData(resposta.dados as Seguradora);
          setError(null);
        } else {
          setError(resposta.mensagem || 'Não foi possível carregar os dados da seguradora.');
        }
      } catch (err) {
        console.error('Erro ao carregar seguradora:', err);
        if (isMounted) {
          setError('Erro inesperado ao carregar seguradora.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarSeguradora();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, seguradoraFromState]);

  const sections = useMemo(() => seguradoraConfig.form.getSections(initialData ?? undefined), [initialData]);

  const handleBack = () => {
    navigate('/seguradoras');
  };

  const handleSave = async (dados: Seguradora) => {
    setError(null);

    const payload: SeguradoraFormData & { ativo?: boolean } = {
      cnpj: cleanNumericString(dados.cnpj),
      razaoSocial: dados.razaoSocial?.trim(),
      nomeFantasia: dados.nomeFantasia?.trim() || undefined,
      apolice: dados.apolice?.trim(),
      ativo: dados.ativo !== false
    };

    try {
      const resposta = isEdit && id
        ? await entitiesService.atualizarSeguradora(Number(id), payload)
        : await entitiesService.criarSeguradora(payload);

      if (!resposta.sucesso) {
        const mensagem = resposta.mensagem || 'Erro ao salvar seguradora.';
        setError(mensagem);
        throw new Error(mensagem);
      }

      navigate('/seguradoras', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      console.error('Erro ao salvar seguradora:', err);
      const mensagem = err?.message || 'Erro ao salvar seguradora.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEdit
    ? seguradoraConfig.form.editTitle || seguradoraConfig.form.title
    : seguradoraConfig.form.title;

  const pageSubtitle = isEdit
    ? seguradoraConfig.form.editSubtitle || seguradoraConfig.form.subtitle
    : seguradoraConfig.form.subtitle;

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={seguradoraConfig.form.headerIcon}
      headerColor={seguradoraConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading || (!initialData && isEdit)}
      loadingMessage="Carregando dados da seguradora..."
      error={error}
    >
      {initialData && (
        <GenericForm<Seguradora>
          data={initialData}
          sections={sections}
          isEditing={isEdit}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={seguradoraConfig.form.headerIcon}
          headerColor={seguradoraConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          submitLabel={isEdit ? 'Atualizar Seguradora' : 'Cadastrar Seguradora'}
          cancelLabel="Cancelar"
          maxWidth="full"
        />
      )}
    </FormPageLayout>
  );
}
