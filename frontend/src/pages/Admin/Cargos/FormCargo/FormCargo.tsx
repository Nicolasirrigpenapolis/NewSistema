import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../../components/UI/feedback/GenericForm';
import { cargoConfig, CargoFormData } from '../../../../components/Admin/CargoConfig';
import { FormPageLayout } from '../../../../components/UI/layout/FormPageLayout';
import { cargosService } from '../../../../services/cargosService';

interface Cargo extends CargoFormData {
  id?: number;
  ativo?: boolean;
}

interface LocationState {
  cargo?: Cargo;
}

export function FormCargo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id);
  const cargoFromState = (location.state as LocationState | undefined)?.cargo;

  const [initialData, setInitialData] = useState<Cargo | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const carregar = async () => {
      if (!isEdit) {
        if (isMounted) {
          // cargoConfig now is CRUDConfig: form.sections contains the FormSection[]
          setInitialData({ ativo: true } as Cargo);
          setLoading(false);
        }
        return;
      }

      if (cargoFromState && isMounted) {
        setInitialData(cargoFromState);
      }

      try {
        setLoading(true);
        const resp = await cargosService.obterCargo(Number(id));
        if (!isMounted) return;
        if (resp) {
          setInitialData(resp as Cargo);
          setError(null);
        } else {
          setError('Não foi possível carregar o cargo.');
        }
      } catch (err) {
        console.error('Erro ao carregar cargo:', err);
        if (isMounted) setError('Erro inesperado ao carregar cargo.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    carregar();

    return () => { isMounted = false; };
  }, [id, isEdit, cargoFromState]);

  // cargoConfig.form.getSections returns FormSection[] expected by GenericForm
  const sections = useMemo(() => {
    // CRUDConfig has form property with getSections function that returns correctly formatted sections
    return cargoConfig.form.getSections(initialData || undefined);
  }, [initialData]);

  const handleBack = () => navigate('/admin/cargos');

  const handleSave = async (dados: CargoFormData) => {
    setError(null);
    try {
      if (isEdit && id) {
        // cargosService expects 'ativo' on update; ensure it's present
        await cargosService.atualizarCargo(Number(id), { ...(dados as any), ativo: (dados as any).ativo ?? true });
      } else {
        await cargosService.criarCargo(dados);
      }

      navigate('/admin/cargos', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      console.error('Erro ao salvar cargo:', err);
      const mensagem = err?.message || 'Erro ao salvar cargo.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEdit ? (cargoConfig.form.editTitle || cargoConfig.form.title) : cargoConfig.form.title;
  const pageSubtitle = isEdit ? (cargoConfig.form.editSubtitle || cargoConfig.form.subtitle || '') : (cargoConfig.form.subtitle || '');

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={cargoConfig.form.headerIcon}
      headerColor={cargoConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading || (!initialData && isEdit)}
      loadingMessage="Carregando dados do cargo..."
      error={error}
    >
      {initialData && (
        <GenericForm<CargoFormData>
          data={initialData}
          sections={sections}
          isEditing={isEdit}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={cargoConfig.form.headerIcon}
          headerColor={cargoConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          submitLabel={isEdit ? 'Atualizar cargo' : 'Salvar cargo'}
          cancelLabel="Cancelar"
          maxWidth="full"
        />
      )}
    </FormPageLayout>
  );
}
