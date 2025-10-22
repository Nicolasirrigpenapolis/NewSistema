import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import { GenericForm, ConfirmDeleteItemModal } from '../../../components/UI/feedback';
import { manutencaoConfig, ManutencaoFormData } from '../../../components/Manutencoes/ManutencaoConfig';
import { entitiesService } from '../../../services/entitiesService';
import { fornecedoresService } from '../../../services/fornecedoresService';
import {
  manutencoesService,
  Manutencao,
  ManutencaoPeca,
  UnidadesMedida
} from '../../../services/manutencoesService';
import type { EntityOption } from '../../../types/apiResponse';
import { Icon } from '../../../ui';

interface LocationState {
  manutencao?: Manutencao;
}

interface Option {
  value: string;
  label: string;
}

const formatDecimalString = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'));

  if (Number.isNaN(numeric)) {
    return '';
  }

  return numeric.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const parseCurrency = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  // Remove tudo exceto números, vírgulas e pontos
  const cleaned = value.replace(/[^\d,.-]/g, '');
  
  // Se tem vírgula e ponto, assumir formato brasileiro (1.234,56)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Remove os pontos (separadores de milhar) e substitui vírgula por ponto
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  
  // Se tem apenas vírgula, é decimal brasileiro (1234,56)
  if (cleaned.includes(',')) {
    const normalized = cleaned.replace(',', '.');
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  
  // Se tem apenas ponto, é decimal americano (1234.56)
  if (cleaned.includes('.')) {
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  
  // Se não tem separador decimal, tentar converter direto
  // (não dividir por 100 porque o valor já vem processado do input)
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatCurrencyInput = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para número e divide por 100 para ter os centavos
  const numberValue = Number(numbers) / 100;
  
  // Formata no padrão brasileiro
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const parseToNumber = (value: string | number | undefined | null): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

interface PecasManagerProps {
  value?: ManutencaoPeca[];
  onChange: (pecas: ManutencaoPeca[]) => void;
  sectionColor?: string;
  saving: boolean;
}

type PecaDraft = {
  descricaoPeca: string;
  quantidade: string;
  valorUnitario: string;
  unidade: (typeof UnidadesMedida)[number];
};

const createNovaPeca = (): PecaDraft => ({
  descricaoPeca: '',
  quantidade: '1',
  valorUnitario: '',
  unidade: UnidadesMedida[0]
});

const PecasManager: React.FC<PecasManagerProps> = ({ value = [], onChange, sectionColor = '#15803d', saving }) => {
  const [novaPeca, setNovaPeca] = useState<PecaDraft>(() => createNovaPeca());
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; index: number | null }>({
    isOpen: false,
    index: null
  });

  const resetNovaPeca = () => {
    setNovaPeca(createNovaPeca());
  };

  const handleUnitChange = (unidade: (typeof UnidadesMedida)[number]) => {
    setNovaPeca((prev) => ({ ...prev, unidade }));
  };

  const handleAdd = () => {
    if (!novaPeca.descricaoPeca.trim()) {
      alert('⚠️ Informe a descrição da peça.');
      return;
    }

    if (novaPeca.descricaoPeca.trim().length > 200) {
      alert('⚠️ A descrição da peça não pode ter mais de 200 caracteres.');
      return;
    }

    const quantidade = Number(novaPeca.quantidade);
    if (!quantidade || quantidade <= 0) {
      alert('⚠️ Informe uma quantidade válida (maior que zero).');
      return;
    }

    const valorUnitario = parseCurrency(novaPeca.valorUnitario);
    const valorTotal = quantidade * valorUnitario;

    const novaLista = [
      ...value,
      {
        descricaoPeca: novaPeca.descricaoPeca.trim(),
        quantidade,
        valorUnitario,
        valorTotal,
        unidade: novaPeca.unidade
      }
    ];

    onChange(novaLista);
    resetNovaPeca();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  // Calcular preview do valor total
  const previewValorTotal = () => {
    const quantidade = Number(novaPeca.quantidade) || 0;
    const valorUnitario = parseCurrency(novaPeca.valorUnitario) || 0;
    return quantidade * valorUnitario;
  };

  const handleRemove = (index: number) => {
    setDeleteModal({ isOpen: true, index });
  };

  const confirmDelete = () => {
    if (deleteModal.index !== null) {
      const novaLista = value.filter((_, idx) => idx !== deleteModal.index);
      onChange(novaLista);
    }
    setDeleteModal({ isOpen: false, index: null });
  };

  const totalPecas = value.reduce((acc, peca) => acc + (peca.valorTotal || 0), 0);

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border-2 border-dashed p-4 bg-white dark:bg-slate-900"
        style={{ borderColor: `${sectionColor}33` }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Adicionar peça ou insumo</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">Campos obrigatórios sinalizados *</span>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Descrição * <span className="text-xs text-slate-400">(máx. 200)</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-card px-3 py-2 text-sm"
                value={novaPeca.descricaoPeca}
                onChange={(e) => {
                  const valor = e.target.value.slice(0, 200);
                  setNovaPeca((prev) => ({ ...prev, descricaoPeca: valor }));
                }}
                onKeyPress={handleKeyPress}
                disabled={saving}
                placeholder="Ex: Pastilha de freio dianteira"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Quantidade *
              </label>
              <input
                type="number"
                min={1}
                step={1}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-card px-3 py-2 text-sm"
                value={novaPeca.quantidade}
                onChange={(e) => {
                  const valor = Math.max(1, parseInt(e.target.value) || 1);
                  setNovaPeca((prev) => ({ ...prev, quantidade: String(valor) }));
                }}
                onKeyPress={handleKeyPress}
                disabled={saving}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Unidade
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-card px-3 py-2 text-sm"
                value={novaPeca.unidade}
                onChange={(e) => handleUnitChange(e.target.value as (typeof UnidadesMedida)[number])}
                disabled={saving}
              >
                {UnidadesMedida.map((unidade) => (
                  <option key={unidade} value={unidade}>
                    {unidade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Valor unitário
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-card px-3 py-2 text-sm font-mono"
                value={novaPeca.valorUnitario}
                onChange={(e) => {
                  const valor = e.target.value;
                  const valorFormatado = formatCurrencyInput(valor);
                  setNovaPeca((prev) => ({ ...prev, valorUnitario: valorFormatado }));
                }}
                onKeyPress={handleKeyPress}
                placeholder="0,00"
                disabled={saving}
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
                title="Pressione Enter para adicionar rapidamente"
              >
                <Icon name="plus" size="sm" />
                Adicionar
              </button>
            </div>
          </div>
          
          {/* Preview do cálculo */}
          {(novaPeca.quantidade && novaPeca.valorUnitario && previewValorTotal() > 0) && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
              <Icon name="calculator" size="sm" className="text-emerald-600" />
              <span>
                {novaPeca.quantidade} × R$ {novaPeca.valorUnitario} = 
                <strong className="ml-1 text-emerald-600 dark:text-emerald-400">
                  {previewValorTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 shadow-sm">
        {value.length === 0 ? (
          <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
            Nenhuma peça adicionada até o momento. Utilize o formulário acima para registrar componentes utilizados.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Peças registradas</h4>
              <span className="text-sm font-semibold text-emerald-600">
                Total em peças: {totalPecas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {value.map((peca, index) => (
                <div key={`${peca.descricaoPeca}-${index}`} className="grid grid-cols-6 gap-4 px-6 py-4 text-sm">
                  <div className="col-span-2">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{peca.descricaoPeca}</span>
                    {peca.unidade && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Unidade: {peca.unidade}</p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{peca.quantidade}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Quantidade</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {parseCurrency(peca.valorUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Valor unitário</p>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-600">
                      {parseCurrency(peca.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Valor total</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
                    >
                      <Icon name="trash" size="sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {deleteModal.index !== null && (
        <ConfirmDeleteItemModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, index: null })}
          onConfirm={confirmDelete}
          title="Excluir Peça"
          itemName={value[deleteModal.index]?.descricaoPeca || ''}
          itemDetails={[
            { label: 'Quantidade', value: `${value[deleteModal.index]?.quantidade || 0}` },
            { label: 'Valor unitário', value: parseCurrency(value[deleteModal.index]?.valorUnitario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
            { label: 'Valor total', value: parseCurrency(value[deleteModal.index]?.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
            ...(value[deleteModal.index]?.unidade ? [{ label: 'Unidade', value: value[deleteModal.index].unidade || '' }] : [])
          ]}
        />
      )}
    </div>
  );
};

export function FormManutencao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);

  const manutencaoFromState = (location.state as LocationState | undefined)?.manutencao;

  const [initialData, setInitialData] = useState<ManutencaoFormData | null>(null);
  const [formData, setFormData] = useState<ManutencaoFormData | null>(null);
  const [veiculoOptions, setVeiculoOptions] = useState<Option[]>([]);
  const [fornecedorOptions, setFornecedorOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const buildOptions = useCallback((items: EntityOption[] | undefined): Option[] => {
    if (!items || items.length === 0) {
      return [];
    }

    return items.map((item) => ({
      value: String(item.id),
      label: item.label
    }));
  }, []);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const [veiculosResposta, fornecedoresResposta] = await Promise.all([
        entitiesService.obterVeiculos(),
        fornecedoresService.obterFornecedoresOptions()
      ]);

      setVeiculoOptions(buildOptions(veiculosResposta));
      setFornecedorOptions(buildOptions(fornecedoresResposta));

      if (isEdit && id) {
        if (manutencaoFromState) {
          setInitialData(mapToFormData(manutencaoFromState));
          setError(null);
        }

        const resposta = await manutencoesService.obterPorId(Number(id));
        if (resposta.success && resposta.data) {
          setInitialData(mapToFormData(resposta.data));
          setError(null);
        } else {
          setError(resposta.message || 'Não foi possível carregar a manutenção.');
        }
      } else {
        setInitialData({
          ...(manutencaoConfig.form.defaultValues as ManutencaoFormData)
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados da manutenção:', err);
      setError('Erro inesperado ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [buildOptions, id, isEdit, manutencaoFromState]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Atualizar formData quando initialData mudar
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Recalcular valores automaticamente quando peças ou mão de obra mudarem
  useEffect(() => {
    if (!formData) return;

    const pecas = formData.pecas || [];
    const valorPecasCalculado = pecas.reduce((acc, peca) => acc + (peca.valorTotal || 0), 0);
    const valorMaoObra = parseCurrency(formData.valorMaoObra as any);
    const valorTotalCalculado = valorMaoObra + valorPecasCalculado;

    // Atualizar apenas se houver mudança
    const valorPecasFormatado = formatDecimalString(valorPecasCalculado);
    const valorTotalFormatado = formatDecimalString(valorTotalCalculado);

    if (formData.valorPecas !== valorPecasFormatado || formData.valorTotal !== valorTotalFormatado) {
      setFormData(prev => prev ? {
        ...prev,
        valorPecas: valorPecasFormatado,
        valorTotal: valorTotalFormatado
      } : null);
    }
  }, [formData?.pecas, formData?.valorMaoObra]);

  // Validações em tempo real
  useEffect(() => {
    if (!formData) return;

    const errors: string[] = [];

    // Validar data futura
    if (formData.dataManutencao) {
      const dataManutencao = new Date(formData.dataManutencao);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataManutencao > hoje) {
        errors.push('⚠️ A data da manutenção não pode ser futura');
      }
    }

    // Validar KM próxima revisão > KM atual
    const kmAtual = parseToNumber(formData.kmAtual);
    const proximaRevisaoKm = parseToNumber(formData.proximaRevisaoKm);

    if (kmAtual && proximaRevisaoKm && proximaRevisaoKm <= kmAtual) {
      errors.push('⚠️ A próxima revisão deve ter quilometragem maior que a atual');
    }

    // Alertar valor total muito alto
    const valorTotal = parseCurrency(formData.valorTotal as any);
    if (valorTotal > 50000) {
      errors.push('⚠️ Valor total muito alto! Verifique se está correto (acima de R$ 50.000)');
    }

    setValidationErrors(errors);
  }, [formData?.dataManutencao, formData?.kmAtual, formData?.proximaRevisaoKm, formData?.valorTotal]);

  const handleBack = () => {
    navigate('/manutencoes');
  };

  const handleFieldChange = useCallback((fieldKey: string, value: any) => {
    setFormData(prev => prev ? { ...prev, [fieldKey]: value } : null);
  }, []);

  const mapToFormData = (manutencao: Manutencao): ManutencaoFormData => ({
    veiculoId: manutencao.veiculoId ? String(manutencao.veiculoId) : '',
    dataManutencao: manutencao.dataManutencao?.slice(0, 10) || '',
    descricao: manutencao.descricao || '',
    fornecedorId: manutencao.fornecedorId ? String(manutencao.fornecedorId) : '',
    valorMaoObra: formatDecimalString(manutencao.valorMaoObra),
    valorPecas: formatDecimalString(manutencao.valorPecas),
    valorTotal: formatDecimalString(manutencao.valorTotal),
    kmAtual: manutencao.kmAtual ?? '',
    proximaRevisaoKm: manutencao.proximaRevisaoKm ?? '',
    observacoes: manutencao.observacoes ?? '',
    pecas: Array.isArray(manutencao.pecas)
      ? manutencao.pecas.map((peca) => ({
          descricaoPeca: peca.descricaoPeca,
          quantidade: peca.quantidade,
          valorUnitario: peca.valorUnitario,
          valorTotal: peca.valorTotal,
          unidade: peca.unidade
        }))
      : []
  });

  const sections = useMemo(() => {
    const baseSections = manutencaoConfig.form.getSections(formData ?? undefined);

    return baseSections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        if (field.key === 'veiculoId') {
          return {
            ...field,
            options: veiculoOptions
          };
        }

        if (field.key === 'fornecedorId') {
          return {
            ...field,
            options: fornecedorOptions
          };
        }

        if (field.key === 'pecas') {
          return {
            ...field,
            render: (context) => {
              const { value, onChange, saving: isSaving, sectionColor } = context;
              return (
                <PecasManager
                  value={value as ManutencaoPeca[]}
                  onChange={(novasPecas) => onChange(novasPecas)}
                  saving={isSaving}
                  sectionColor={sectionColor ?? '#15803d'}
                />
              );
            }
          };
        }

        return field;
      })
    }));
  }, [fornecedorOptions, formData, veiculoOptions]);

  const handleSave = async (dados: ManutencaoFormData) => {
    setError(null);

    const pecasSanitizadas = (dados.pecas || []).map((peca) => {
      const quantidade = Number(peca.quantidade) || 0;
      const valorUnitario = parseCurrency(peca.valorUnitario as any);
      return {
        descricaoPeca: peca.descricaoPeca,
        quantidade,
        valorUnitario,
        unidade: peca.unidade
      };
    });

    const payload = {
      veiculoId: Number(dados.veiculoId),
      dataManutencao: dados.dataManutencao,
      descricao: dados.descricao?.trim(),
      fornecedorId: dados.fornecedorId ? Number(dados.fornecedorId) : undefined,
      valorMaoObra: parseCurrency(dados.valorMaoObra as any),
      observacoes: dados.observacoes?.trim() || undefined,
      pecas: pecasSanitizadas
    };

    console.log('📦 Payload sendo enviado:', JSON.stringify(payload, null, 2));

    try {
      const resposta = isEdit && id
        ? await manutencoesService.atualizar(Number(id), payload as any)
        : await manutencoesService.criar(payload as any);

      if (!resposta.success) {
        const mensagem = resposta.message || 'Erro ao salvar manutenção.';
        setError(mensagem);
        throw new Error(mensagem);
      }

      navigate('/manutencoes', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      console.error('Erro ao salvar manutenção:', err);
      const mensagem = err?.message || 'Erro ao salvar manutenção.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEdit ? manutencaoConfig.form.editTitle || manutencaoConfig.form.title : manutencaoConfig.form.title;
  const pageSubtitle = isEdit ? manutencaoConfig.form.editSubtitle || manutencaoConfig.form.subtitle : manutencaoConfig.form.subtitle;

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={manutencaoConfig.form.headerIcon}
      headerColor={manutencaoConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading}
      loadingMessage="Carregando dados da manutenção..."
      error={error}
    >
      {/* Alertas de validação */}
      {validationErrors.length > 0 && (
        <div className="mb-6 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <div className="flex items-start gap-3">
            <Icon name="exclamation-triangle" className="text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Atenção aos seguintes pontos:
              </h4>
              <ul className="space-y-1">
                {validationErrors.map((erro, idx) => (
                  <li key={idx} className="text-sm text-amber-700 dark:text-amber-300">
                    {erro}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {formData && (
        <GenericForm<ManutencaoFormData>
          data={formData}
          sections={sections}
          isEditing={isEdit}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={manutencaoConfig.form.headerIcon}
          headerColor={manutencaoConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          onFieldChange={handleFieldChange}
          submitLabel={isEdit ? 'Atualizar manutenção' : 'Salvar manutenção'}
          cancelLabel="Cancelar"
          hideCancelButton={false}
          maxWidth="full"
        />
      )}
    </FormPageLayout>
  );
}
