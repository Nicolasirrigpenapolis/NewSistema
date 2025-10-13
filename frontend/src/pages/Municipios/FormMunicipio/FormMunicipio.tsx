import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { municipioConfig } from '../../../components/Municipios/MunicipioConfig';
import { entitiesService } from '../../../services/entitiesService';
import { Icon } from '../../../ui';

interface Municipio {
  id?: number;
  codigo: number;
  nome: string;
  uf: string;
  ativo?: boolean;
}

interface LocationState {
  municipio?: Municipio;
}

export function FormMunicipio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id);
  const municipioFromState = (location.state as LocationState | undefined)?.municipio;

  const [initialData, setInitialData] = useState<Municipio | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const carregarMunicipio = async () => {
      if (!isEdit) {
        if (isMounted) {
          setInitialData({
            ...(municipioConfig.form.defaultValues as Municipio),
            codigo: 0,
            nome: '',
            uf: '',
            ativo: true
          });
          setLoading(false);
        }
        return;
      }

      if (municipioFromState && isMounted) {
        setInitialData(municipioFromState);
      }

      try {
        setLoading(true);
        const resposta = await entitiesService.buscarMunicipioPorId(Number(id));

        if (!isMounted) return;

        if (resposta.sucesso && resposta.dados) {
          setInitialData(resposta.dados as Municipio);
          setError(null);
        } else {
          setError(resposta.mensagem || 'Não foi possível carregar os dados do município.');
        }
      } catch (err) {
        console.error('Erro ao carregar município:', err);
        if (isMounted) {
          setError('Erro inesperado ao carregar município.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarMunicipio();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, municipioFromState]);

  const sections = useMemo(() => {
    return municipioConfig.form.getSections(initialData ?? undefined);
  }, [initialData]);

  const handleBack = () => {
    navigate('/municipios');
  };

  const handleSave = async (dados: Municipio) => {
    setError(null);

    const payload: Municipio = {
      ...dados,
      codigo: Number(dados.codigo),
      nome: dados.nome?.trim(),
      uf: dados.uf?.toUpperCase(),
      ativo: dados.ativo ?? true
    };

    try {
      const resposta = isEdit && id
        ? await entitiesService.atualizarMunicipio(Number(id), payload)
        : await entitiesService.criarMunicipio(payload);

      if (!resposta.sucesso) {
        const mensagem = resposta.mensagem || 'Erro ao salvar município.';
        setError(mensagem);
        throw new Error(mensagem);
      }

      navigate('/municipios', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      const mensagem = err?.message || 'Erro ao salvar município.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEdit
    ? municipioConfig.form.editTitle || municipioConfig.form.title
    : municipioConfig.form.title;

  const pageSubtitle = isEdit
    ? municipioConfig.form.editSubtitle || municipioConfig.form.subtitle
    : municipioConfig.form.subtitle;

  if (loading || (!initialData && isEdit)) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-card rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando dados do município...</p>
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
        <GenericForm<Municipio>
          data={initialData}
          sections={sections}
          isEditing={isEdit}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={municipioConfig.form.headerIcon}
          headerColor={municipioConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          hideCancelButton={false}
          submitLabel={isEdit ? 'Atualizar município' : 'Salvar município'}
          cancelLabel="Cancelar"
          pageClassName="max-w-3xl mx-auto"
        />
      )}
    </div>
  );
}
