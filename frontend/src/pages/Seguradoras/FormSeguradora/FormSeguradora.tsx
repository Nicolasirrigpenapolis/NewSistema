import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { seguradoraConfig, SeguradoraFormData } from '../../../components/Seguradoras/SeguradoraConfig';
import { entitiesService } from '../../../services/entitiesService';
import { Icon } from '../../../ui';
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
            cnpj: '',
            razaoSocial: '',
            nomeFantasia: '',
            apolice: '',
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
      apolice: dados.apolice?.trim() || undefined,
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

  if (loading || (!initialData && isEdit)) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-card rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando dados da seguradora...</p>
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
          submitLabel={isEdit ? 'Atualizar seguradora' : 'Salvar seguradora'}
          cancelLabel="Cancelar"
          pageClassName="max-w-4xl mx-auto"
        />
      )}
    </div>
  );
}
