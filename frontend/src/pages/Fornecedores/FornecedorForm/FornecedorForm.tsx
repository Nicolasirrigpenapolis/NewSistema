import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GenericForm } from '../../../components/UI/feedback/GenericForm';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import {
  fornecedoresService,
  FornecedorCreateDto,
  FornecedorUpdateDto,
  Fornecedor
} from '../../../services/fornecedoresService';
import {
  fornecedorConfig,
  FornecedorFormData,
  TipoPessoa
} from '../../../components/Fornecedores/FornecedorConfig';
import { cleanNumericString } from '../../../utils/formatters';
import { InputCNPJ } from '../../../components/UI/InputCNPJ';
import { CNPJData } from '../../../types/apiResponse';

interface FornecedorFormState extends FornecedorFormData {
  id?: number;
}

export function FornecedorForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formState, setFormState] = useState<FornecedorFormState | null>(null);
  const [loading, setLoading] = useState<boolean>(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const carregarFornecedor = async () => {
      if (!isEditing) {
        if (isMounted) {
          setFormState({
            ...(fornecedorConfig.form.defaultValues as FornecedorFormState)
          });
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await fornecedoresService.getFornecedorById(Number(id));

        if (!isMounted) {
          return;
        }

        if (response.success && response.data) {
          const fornecedor = response.data as Fornecedor;
          setFormState({
            id: fornecedor.id,
            nome: fornecedor.nome ?? '',
            tipoPessoa: (fornecedor.tipoPessoa || 'J').toUpperCase() === 'F' ? 'F' : 'J',
            cnpjCpf: cleanNumericString(fornecedor.cnpjCpf ?? ''),
            email: fornecedor.email ?? '',
            telefone: cleanNumericString(fornecedor.telefone ?? ''),
            endereco: fornecedor.endereco ?? '',
            cidade: fornecedor.cidade ?? '',
            uf: fornecedor.uf ?? '',
            cep: cleanNumericString(fornecedor.cep ?? ''),
            observacoes: fornecedor.observacoes ?? '',
            ativo: fornecedor.ativo !== false
          });
          setError(null);
        } else {
          setError(response.message || 'Não foi possível carregar os dados do fornecedor.');
        }
      } catch (err) {
        console.error('Erro ao carregar fornecedor:', err);
        if (isMounted) {
          setError('Erro inesperado ao carregar fornecedor.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarFornecedor();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const handleCNPJDataFetch = useCallback((data: CNPJData) => {
    if (!data) {
      return;
    }

    setFormState((prev) => {
      if (!prev || prev.tipoPessoa === 'F') {
        return prev;
      }

      const prefer = (current?: string, fallback?: string) => {
        const trimmed = current?.trim();
        return trimmed ? current ?? '' : fallback ?? '';
      };

      const cleanedCnpj = cleanNumericString(data.cnpj ?? prev?.cnpjCpf);
      const cleanedTelefone = cleanNumericString(data.telefone ?? '');
      const cleanedCep = cleanNumericString(data.cep ?? '');

      const enderecoPartes = [data.logradouro, data.numero].filter(Boolean).join(', ');
      const enderecoCompleto = [enderecoPartes, data.complemento].filter(Boolean).join(' ');
      const situacaoTexto = data.situacao
        ? `Situação cadastral: ${data.situacao}${data.dataSituacao ? ` (desde ${data.dataSituacao})` : ''}`
        : '';

      return {
        ...prev,
        nome: prefer(prev.nome, data.razaoSocial || data.nomeFantasia || prev.nome),
        cnpjCpf: cleanedCnpj || prev.cnpjCpf,
        email: prefer(prev.email, data.email),
        telefone: prefer(prev.telefone, cleanedTelefone),
        endereco: prefer(prev.endereco, enderecoCompleto || data.logradouro),
        cidade: prefer(prev.cidade, data.municipio),
        uf: prefer(prev.uf, data.uf)?.toUpperCase(),
        cep: prefer(prev.cep, cleanedCep),
        observacoes: prefer(prev.observacoes, situacaoTexto)
      };
    });
  }, []);

  const sections = useMemo(() => {
    const baseSections = fornecedorConfig.form.getSections(formState ?? undefined);

    return baseSections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        if (field.key === 'cnpjCpf' && (formState?.tipoPessoa ?? 'J') === 'J') {
          return {
            ...field,
            mask: undefined,
            render: ({ value, setFieldValue }: any) => (
              <InputCNPJ
                key="fornecedor-cnpj"
                label=""
                value={value || ''}
                onChange={(rawValue) => setFieldValue('cnpjCpf', rawValue)}
                onDataFetched={handleCNPJDataFetch}
                required={field.required}
                disabled={field.disabled}
                placeholder={field.placeholder}
                autoFetch
              />
            )
          };
        }

        return field;
      })
    }));
  }, [formState, handleCNPJDataFetch]);

  const handleBack = () => {
    navigate('/fornecedores');
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormState((prev) => {
      if (!prev) {
        return prev;
      }

      if (fieldKey === 'tipoPessoa') {
        const tipo = (value as string).toUpperCase() === 'F' ? 'F' : 'J';
        return {
          ...prev,
          tipoPessoa: tipo as TipoPessoa,
          cnpjCpf: ''
        };
      }

      if (fieldKey === 'uf') {
        return {
          ...prev,
          uf: (value || '').toString().toUpperCase()
        };
      }

      return {
        ...prev,
        [fieldKey]: value
      };
    });
  };

  const handleSave = async (dados: FornecedorFormState) => {
    setError(null);

    const documentoLimpo = cleanNumericString(dados.cnpjCpf);
    const telefoneLimpo = cleanNumericString(dados.telefone ?? '');
    const cepLimpo = cleanNumericString(dados.cep ?? '');

    const payload: FornecedorCreateDto = {
      nome: dados.nome?.trim() || '',
      tipoPessoa: (dados.tipoPessoa || 'J') as TipoPessoa,
      cnpjCpf: documentoLimpo,
      email: dados.email?.trim() || undefined,
      telefone: telefoneLimpo || undefined,
      endereco: dados.endereco?.trim() || undefined,
      cidade: dados.cidade?.trim() || undefined,
      uf: dados.uf?.trim().toUpperCase() || undefined,
      cep: cepLimpo || undefined,
      observacoes: dados.observacoes?.trim() || undefined,
      ativo: dados.ativo !== false
    };

    try {
      let response;

      if (isEditing && id) {
        const updatePayload: FornecedorUpdateDto = {
          id: Number(id),
          ...payload
        };

        response = await fornecedoresService.updateFornecedor(updatePayload);
      } else {
        response = await fornecedoresService.createFornecedor(payload);
      }

      if (!response.success) {
        const mensagem = response.message || 'Erro ao salvar fornecedor.';
        setError(mensagem);
        throw new Error(mensagem);
      }

      navigate('/fornecedores', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      console.error('Erro ao salvar fornecedor:', err);
      const mensagem = err?.message || 'Erro ao salvar fornecedor.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEditing
    ? fornecedorConfig.form.editTitle || fornecedorConfig.form.title
    : fornecedorConfig.form.title;

  const pageSubtitle = isEditing
    ? fornecedorConfig.form.editSubtitle || fornecedorConfig.form.subtitle
    : fornecedorConfig.form.subtitle;

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={fornecedorConfig.form.headerIcon}
      headerColor={fornecedorConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading || (isEditing && !formState)}
      loadingMessage="Carregando dados do fornecedor..."
      error={error}
    >
      {formState && (
        <GenericForm<FornecedorFormState>
          data={formState}
          sections={sections}
          isEditing={isEditing}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={fornecedorConfig.form.headerIcon}
          headerColor={fornecedorConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          onFieldChange={handleFieldChange}
          submitLabel={isEditing ? 'Atualizar Fornecedor' : 'Cadastrar Fornecedor'}
          cancelLabel="Cancelar"
          maxWidth="full"
        />
      )}
    </FormPageLayout>
  );
}