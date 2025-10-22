import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { veiculoConfig } from '../../../components/Veiculos/VeiculoConfig';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import { entitiesService } from '../../../services/entitiesService';

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
      tara: Number((dados.tara ?? '').toString().replace(/\D/g, '')) || 0,
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

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={veiculoConfig.form.headerIcon}
      headerColor={veiculoConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading || (!initialData && isEdit)}
      loadingMessage="Carregando dados do veículo..."
      error={error}
    >
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
          submitLabel={isEdit ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
          cancelLabel="Cancelar"
          maxWidth="full"
        />
      )}
    </FormPageLayout>
  );
}
