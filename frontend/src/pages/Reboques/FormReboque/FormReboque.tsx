import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { reboqueConfig } from '../../../components/Reboques/ReboqueConfig';
import { entitiesService } from '../../../services/entitiesService';
import { Icon } from '../../../ui';

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

    const payload: Reboque = {
      ...dados,
      placa: dados.placa?.trim().toUpperCase(),
      tara: Number(dados.tara),
      uf: dados.uf?.toUpperCase(),
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

  if (loading || (!initialData && isEdit)) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-card rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando dados do reboque...</p>
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
          submitLabel={isEdit ? 'Atualizar reboque' : 'Salvar reboque'}
          cancelLabel="Cancelar"
          pageClassName="max-w-4xl mx-auto"
        />
      )}
    </div>
  );
}
