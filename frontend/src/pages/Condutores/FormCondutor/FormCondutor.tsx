import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { condutorConfig } from '../../../components/Condutores/CondutorConfig';
import { entitiesService } from '../../../services/entitiesService';
import { Icon } from '../../../ui';
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

  if (loading || (!initialData && isEdit)) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-card rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando dados do condutor...</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            <Icon name="arrow-left" size="sm" />
            Voltar
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
        <button
          onClick={handleBack}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-card text-foreground hover:bg-background transition-colors"
        >
          <Icon name="arrow-left" size="sm" />
          Voltar para lista
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
          <Icon name="exclamation-triangle" />
          <span className="text-sm">{error}</span>
        </div>
      )}

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
          submitLabel={isEdit ? 'Atualizar condutor' : 'Salvar condutor'}
          cancelLabel="Cancelar"
          pageClassName="max-w-5xl mx-auto"
        />
      )}
    </div>
  );
}
