import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { veiculoConfig } from '../../../components/Veiculos/VeiculoConfig';
import { entitiesService } from '../../../services/entitiesService';
import { Icon } from '../../../ui';

interface Veiculo {
  id?: number;
  placa: string;
  marca?: string;
  tara: number;
  tipoRodado: string;
  tipoCarroceria: string;
  uf: string;
  ativo?: boolean;
}

interface LocationState {
  veiculo?: Veiculo;
}

export function FormVeiculo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id);
  const veiculoFromState = (location.state as LocationState | undefined)?.veiculo;

  const [initialData, setInitialData] = useState<Veiculo | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const carregarVeiculo = async () => {
      if (!isEdit) {
        if (isMounted) {
          setInitialData({
            ...(veiculoConfig.form.defaultValues as Veiculo),
            ativo: true
          });
          setLoading(false);
        }
        return;
      }

      if (veiculoFromState && isMounted) {
        setInitialData(veiculoFromState);
      }

      try {
        setLoading(true);
        const resposta = await entitiesService.buscarVeiculoPorId(Number(id));

        if (!isMounted) return;

        if (resposta.sucesso && resposta.dados) {
          setInitialData(resposta.dados as Veiculo);
          setError(null);
        } else {
          setError(resposta.mensagem || 'Não foi possível carregar os dados do veículo.');
        }
      } catch (err) {
        console.error('Erro ao carregar veículo:', err);
        if (isMounted) {
          setError('Erro inesperado ao carregar veículo.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarVeiculo();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, veiculoFromState]);

  const sections = useMemo(() => {
    return veiculoConfig.form.getSections(initialData ?? undefined);
  }, [initialData]);

  const handleBack = () => {
    navigate('/veiculos');
  };

  const handleSave = async (dados: Veiculo) => {
    setError(null);

    const payload: Veiculo = {
      ...dados,
      placa: dados.placa?.trim().toUpperCase(),
      marca: dados.marca?.trim(),
      uf: dados.uf?.toUpperCase(),
      ativo: dados.ativo ?? true
    };

    try {
      const resposta = isEdit && id
        ? await entitiesService.atualizarVeiculo(Number(id), payload)
        : await entitiesService.criarVeiculo(payload);

      if (!resposta.sucesso) {
        const mensagem = resposta.mensagem || 'Erro ao salvar veículo.';
        setError(mensagem);
        throw new Error(mensagem);
      }

      navigate('/veiculos', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      console.error('Erro ao salvar veículo:', err);
      const mensagem = err?.message || 'Erro ao salvar veículo.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEdit
    ? veiculoConfig.form.editTitle || veiculoConfig.form.title
    : veiculoConfig.form.title;

  const pageSubtitle = isEdit
    ? veiculoConfig.form.editSubtitle || veiculoConfig.form.subtitle
    : veiculoConfig.form.subtitle;

  if (loading || (!initialData && isEdit)) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-card rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando dados do veículo...</p>
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
        <GenericForm<Veiculo>
          data={initialData}
          sections={sections}
          isEditing={isEdit}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={veiculoConfig.form.headerIcon}
          headerColor={veiculoConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          hideCancelButton={false}
          submitLabel={isEdit ? 'Atualizar veículo' : 'Salvar veículo'}
          cancelLabel="Cancelar"
          pageClassName="max-w-5xl mx-auto"
        />
      )}
    </div>
  );
}
