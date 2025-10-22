import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { contratanteConfig } from '../../../components/Contratantes/ContratanteConfig';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import { entitiesService } from '../../../services/entitiesService';
import { cleanNumericString } from '../../../utils/formatters';
import { CNPJData } from '../../../types/apiResponse';

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
    // Re-computar sections sempre que formData mudar (especialmente tipoDocumento)
    return contratanteConfig.form.getSections(formData);
  }, [formData]);

  const handleBack = () => {
    navigate('/contratantes');
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCNPJDataFetch = (data: CNPJData) => {
    if (data) {
      const updates: Partial<Contratante> = {
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia || '',
        cep: data.cep,
        endereco: data.logradouro,
        numero: data.numero,
        complemento: data.complemento || '',
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        codMunicipio: data.codigoMunicipio
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

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={contratanteConfig.form.headerIcon}
      headerColor={contratanteConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading || (!initialData && isEdit)}
      loadingMessage="Carregando dados do contratante..."
      error={error}
    >
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
          onCNPJDataFetch={handleCNPJDataFetch}
          hideCancelButton={false}
          submitLabel={isEdit ? 'Atualizar contratante' : 'Salvar contratante'}
          cancelLabel="Cancelar"
          maxWidth="full"
        />
      )}
    </FormPageLayout>
  );
}
