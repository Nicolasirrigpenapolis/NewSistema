import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { condutorConfig } from '../../../components/Condutores/CondutorConfig';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import { entitiesService } from '../../../services/entitiesService';
import { cleanNumericString } from '../../../utils/formatters';

interface Condutor {
  id?: number;
  nome: string;
  cpf: string;
  telefone?: string;
  ativo?: boolean;
}

interface LocationState {
  condutor?: Condutor;
}

export function FormCondutor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id);
  const condutorFromState = (location.state as LocationState | undefined)?.condutor;

  const [initialData, setInitialData] = useState<Condutor | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const carregarCondutor = async () => {
      if (!isEdit) {
        if (isMounted) {
          setInitialData({
            ...(condutorConfig.form.defaultValues as Condutor),
            ativo: true
          });
          setLoading(false);
        }
        return;
      }

      if (condutorFromState && isMounted) {
        setInitialData(condutorFromState);
      }

      try {
        setLoading(true);
        const resposta = await entitiesService.buscarCondutorPorId(Number(id));

        if (!isMounted) return;

        if (resposta.sucesso && resposta.dados) {
          setInitialData(resposta.dados as Condutor);
          setError(null);
        } else {
          setError(resposta.mensagem || 'Não foi possível carregar os dados do condutor.');
        }
      } catch (err) {
        console.error('Erro ao carregar condutor:', err);
        if (isMounted) {
          setError('Erro inesperado ao carregar condutor.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarCondutor();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, condutorFromState]);

  const sections = useMemo(() => {
    return condutorConfig.form.getSections(initialData ?? undefined);
  }, [initialData]);

  const handleBack = () => {
    navigate('/condutores');
  };

  const handleSave = async (dados: Condutor) => {
    setError(null);

    const payload: Condutor = {
      ...dados,
      nome: dados.nome?.trim(),
      cpf: cleanNumericString(dados.cpf),
      telefone: dados.telefone ? cleanNumericString(dados.telefone) : undefined,
      ativo: dados.ativo ?? true
    };

    try {
      const resposta = isEdit && id
        ? await entitiesService.atualizarCondutor(Number(id), payload)
        : await entitiesService.criarCondutor(payload);

      if (!resposta.sucesso) {
        const mensagem = resposta.mensagem || 'Erro ao salvar condutor.';
        setError(mensagem);
        throw new Error(mensagem);
      }

      navigate('/condutores', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      console.error('Erro ao salvar condutor:', err);
      const mensagem = err?.message || 'Erro ao salvar condutor.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEdit
    ? condutorConfig.form.editTitle || condutorConfig.form.title
    : condutorConfig.form.title;

  const pageSubtitle = isEdit
    ? condutorConfig.form.editSubtitle || condutorConfig.form.subtitle
    : condutorConfig.form.subtitle;

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={condutorConfig.form.headerIcon}
      headerColor={condutorConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading || (!initialData && isEdit)}
      loadingMessage="Carregando dados do condutor..."
      error={error}
    >
      {initialData && (
        <GenericForm<Condutor>
          data={initialData}
          sections={sections}
          isEditing={isEdit}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={condutorConfig.form.headerIcon}
          headerColor={condutorConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          hideCancelButton={false}
          submitLabel={isEdit ? 'Atualizar Condutor' : 'Cadastrar Condutor'}
          cancelLabel="Cancelar"
          maxWidth="full"
        />
      )}
    </FormPageLayout>
  );
}
