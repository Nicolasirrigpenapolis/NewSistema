import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { municipioConfig, MunicipioFormData } from '../../../components/Municipios/MunicipioConfig';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import { entitiesService } from '../../../services/entitiesService';
import { cleanNumericString } from '../../../utils/formatters';

interface MunicipioRecord {
  id?: number;
  codigo: number;
  nome: string;
  uf: string;
  ativo?: boolean;
}

interface LocationState {
  municipio?: MunicipioRecord;
}

interface MunicipioFormState extends MunicipioFormData {
  id?: number;
}

export function FormMunicipio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id);
  const municipioFromState = (location.state as LocationState | undefined)?.municipio;

  const [initialData, setInitialData] = useState<MunicipioFormState | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const carregarMunicipio = async () => {
      if (!isEdit) {
        if (isMounted) {
          setInitialData({
            ...(municipioConfig.form.defaultValues as MunicipioFormState)
          });
          setLoading(false);
        }
        return;
      }

      if (municipioFromState && isMounted) {
        setInitialData({
          id: municipioFromState.id,
          codigo: municipioFromState.codigo ? String(municipioFromState.codigo) : '',
          nome: municipioFromState.nome ?? '',
          uf: municipioFromState.uf ?? '',
          ativo: municipioFromState.ativo ?? true
        });
      }

      try {
        setLoading(true);
        const resposta = await entitiesService.buscarMunicipioPorId(Number(id));

        if (!isMounted) return;

        if (resposta.sucesso && resposta.dados) {
          const dadosMunicipio = resposta.dados as MunicipioRecord;

          setInitialData({
            id: dadosMunicipio.id,
            codigo: dadosMunicipio.codigo ? String(dadosMunicipio.codigo) : '',
            nome: dadosMunicipio.nome ?? '',
            uf: dadosMunicipio.uf ?? '',
            ativo: dadosMunicipio.ativo ?? true
          });
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

  const handleSave = async (dados: MunicipioFormState) => {
    setError(null);

  const codigoSanitizado = cleanNumericString(String(dados.codigo ?? ''));

    const payload = {
      codigo: Number(codigoSanitizado),
      nome: dados.nome?.trim(),
      uf: dados.uf?.trim().toUpperCase(),
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

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={municipioConfig.form.headerIcon}
      headerColor={municipioConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading || (!initialData && isEdit)}
      loadingMessage="Carregando dados do município..."
      error={error}
    >
      {initialData && (
        <GenericForm<MunicipioFormState>
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
          submitLabel={isEdit ? 'Atualizar Município' : 'Cadastrar Município'}
          cancelLabel="Cancelar"
          maxWidth="full"
        />
      )}
    </FormPageLayout>
  );
}
