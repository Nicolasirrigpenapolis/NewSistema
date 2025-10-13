import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../../components/UI/feedback/GenericForm';
import { cargoConfig, CargoFormData } from '../../../../components/Admin/CargoConfig';
import { cargosService } from '../../../../services/cargosService';
import Icon from '../../../../components/UI/Icon';

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

  if (loading || (!initialData && isEdit)) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-card rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando dados do cargo...</p>
          <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 transition-colors">
            <Icon name="arrow-left" size="sm" /> Voltar
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
        <button onClick={handleBack} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-card text-foreground hover:bg-background transition-colors">
          <Icon name="arrow-left" size="sm" /> Voltar para lista
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
          <Icon name="exclamation-triangle" />
          <span className="text-sm">{error}</span>
        </div>
      )}

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
          pageClassName="max-w-4xl mx-auto"
        />
      )}
    </div>
  );
}
