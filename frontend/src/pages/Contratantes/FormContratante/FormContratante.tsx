import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { contratanteConfig } from '../../../components/Contratantes/ContratanteConfig';
import { entitiesService } from '../../../services/entitiesService';
import { Icon } from '../../../ui';
import { cleanNumericString } from '../../../utils/formatters';

interface Contratante {
  id?: number;
  cnpj?: string;
  cpf?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  codMunicipio: number;
  municipio: string;
  cep: string;
  uf: string;
  ativo?: boolean;
}

interface LocationState {
  contratante?: Contratante;
}

export function FormContratante() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = Boolean(id);
  const contratanteFromState = (location.state as LocationState | undefined)?.contratante;

  const [initialData, setInitialData] = useState<Contratante | null>(null);
  const [formData, setFormData] = useState<Partial<Contratante>>({});
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const carregarContratante = async () => {
      if (!isEdit) {
        if (isMounted) {
          const defaults = {
            ...(contratanteConfig.form.defaultValues as Partial<Contratante>),
            ativo: true
          };
          setInitialData(defaults as Contratante);
          setFormData(defaults);
          setLoading(false);
        }
        return;
      }

      if (contratanteFromState && isMounted) {
        setInitialData(contratanteFromState);
        setFormData(contratanteFromState);
      }

      try {
        setLoading(true);
        const resposta = await entitiesService.buscarContratantePorId(Number(id));

        if (!isMounted) return;

        if (resposta.sucesso && resposta.dados) {
          const contratante = resposta.dados as Contratante;
          // Adicionar campo virtual tipoDocumento
          const dataComTipo = {
            ...contratante,
            tipoDocumento: contratante.cnpj ? 'cnpj' : contratante.cpf ? 'cpf' : undefined
          };
          setInitialData(dataComTipo as any);
          setFormData(dataComTipo);
          setError(null);
        } else {
          setError(resposta.mensagem || 'Não foi possível carregar os dados do contratante.');
        }
      } catch (err) {
        console.error('Erro ao carregar contratante:', err);
        if (isMounted) {
          setError('Erro inesperado ao carregar contratante.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarContratante();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, contratanteFromState]);

  const sections = useMemo(() => {
    return contratanteConfig.form.getSections(initialData ?? undefined);
  }, [initialData]);

  const handleBack = () => {
    navigate('/contratantes');
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCNPJDataFetch = (data: any) => {
    if (data) {
      const updates: Record<string, any> = {
        razaoSocial: data.razaoSocial || data.nome,
        nomeFantasia: data.nomeFantasia || data.fantasia,
        cep: data.cep,
        endereco: data.logradouro || data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        codMunicipio: data.codMunicipio || 0
      };

      setFormData(prev => ({
        ...prev,
        ...updates
      }));
    }
  };

  const handleSave = async (dados: Contratante) => {
    setError(null);

    // Limpar campos CNPJ/CPF baseado no tipo de documento
    const tipoDocumento = (dados as any).tipoDocumento;
    const payload: Contratante = {
      ...dados,
      cnpj: tipoDocumento === 'cnpj' ? cleanNumericString(dados.cnpj || '') : undefined,
      cpf: tipoDocumento === 'cpf' ? cleanNumericString(dados.cpf || '') : undefined,
      razaoSocial: dados.razaoSocial?.trim(),
      nomeFantasia: dados.nomeFantasia?.trim() || undefined,
      cep: cleanNumericString(dados.cep),
      endereco: dados.endereco?.trim(),
      numero: dados.numero?.trim() || undefined,
      complemento: dados.complemento?.trim() || undefined,
      bairro: dados.bairro?.trim(),
      municipio: dados.municipio?.trim(),
      uf: dados.uf?.toUpperCase(),
      ativo: dados.ativo ?? true
    };

    // Remover o campo virtual tipoDocumento
    delete (payload as any).tipoDocumento;

    try {
      const resposta = isEdit && id
        ? await entitiesService.atualizarContratante(Number(id), payload)
        : await entitiesService.criarContratante(payload);

      if (!resposta.sucesso) {
        const mensagem = resposta.mensagem || 'Erro ao salvar contratante.';
        setError(mensagem);
        throw new Error(mensagem);
      }

      navigate('/contratantes', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      console.error('Erro ao salvar contratante:', err);
      const mensagem = err?.message || 'Erro ao salvar contratante.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEdit
    ? contratanteConfig.form.editTitle || contratanteConfig.form.title
    : contratanteConfig.form.title;

  const pageSubtitle = isEdit
    ? contratanteConfig.form.editSubtitle || contratanteConfig.form.subtitle
    : contratanteConfig.form.subtitle;

  if (loading || (!initialData && isEdit)) {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-card rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando dados do contratante...</p>
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
        <GenericForm<Contratante>
          data={formData as Contratante}
          sections={sections}
          isEditing={isEdit}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={contratanteConfig.form.headerIcon}
          headerColor={contratanteConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          onFieldChange={handleFieldChange}
          hideCancelButton={false}
          submitLabel={isEdit ? 'Atualizar contratante' : 'Salvar contratante'}
          cancelLabel="Cancelar"
          pageClassName="max-w-5xl mx-auto"
        />
      )}
    </div>
  );
}
