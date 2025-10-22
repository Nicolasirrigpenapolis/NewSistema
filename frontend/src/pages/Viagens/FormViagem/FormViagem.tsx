import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FormPageLayout } from '../../../components/UI/layout/FormPageLayout';
import { GenericForm, ConfirmDeleteItemModal } from '../../../components/UI/feedback';
import { viagemConfig, ViagemFormData } from '../../../components/Viagens/ViagemConfig';
import { entitiesService } from '../../../services/entitiesService';
import { viagensService, Viagem, DespesaViagem, ReceitaViagem, TiposDespesa } from '../../../services/viagensService';
import type { EntityOption } from '../../../types/apiResponse';
import { Icon } from '../../../ui';

interface LocationState {
  viagem?: Viagem;
}

interface Option {
  value: string;
  label: string;
}

const parseCurrency = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  
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
  
  // Se não tem separador decimal, dividir por 100 (formato centavos: 350000 = 3500.00)
  const numbers = cleaned.replace(/\D/g, '');
  if (numbers.length === 0) return 0;
  const parsed = Number(numbers) / 100;
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatCurrencyInput = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para número (dividindo por 100 para considerar centavos)
  const num = parseFloat(numbers) / 100;
  
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const ReceitasManager: React.FC<{ value?: ReceitaViagem[]; onChange: (receitas: ReceitaViagem[]) => void; saving: boolean }>
= ({ value = [], onChange, saving }) => {
  const [novaReceita, setNovaReceita] = useState({
    descricao: '',
    valor: '',
    dataReceita: new Date().toISOString().substring(0, 10),
    origem: '',
    observacoes: ''
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; index: number | null }>({
    isOpen: false,
    index: null
  });

  const handleAdd = () => {
    if (!novaReceita.descricao.trim()) {
      alert('⚠️ Informe a descrição da receita.');
      return;
    }

    if (novaReceita.descricao.trim().length > 200) {
      alert('⚠️ A descrição não pode ter mais de 200 caracteres.');
      return;
    }

    const valorNumerico = parseCurrency(novaReceita.valor);
    if (valorNumerico <= 0) {
      alert('⚠️ Informe um valor válido para a receita.');
      return;
    }

    onChange([
      ...value,
      {
        descricao: novaReceita.descricao.trim(),
        valor: valorNumerico,
        dataReceita: novaReceita.dataReceita,
        origem: novaReceita.origem.trim() || undefined,
        observacoes: novaReceita.observacoes.trim() || undefined
      }
    ]);

    setNovaReceita({
      descricao: '',
      valor: '',
      dataReceita: new Date().toISOString().substring(0, 10),
      origem: '',
      observacoes: ''
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    setDeleteModal({ isOpen: true, index });
  };

  const confirmDelete = () => {
    if (deleteModal.index !== null) {
      onChange(value.filter((_, idx) => idx !== deleteModal.index));
    }
    setDeleteModal({ isOpen: false, index: null });
  };

  const totalReceitas = value.reduce((acc, item) => acc + (item.valor || 0), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-emerald-200/60 bg-white p-4 dark:border-emerald-900/40 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Adicionar receita</h4>
          <span className="text-xs text-slate-500">Campos obrigatórios marcados com *</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Descrição * <span className="text-xs text-slate-400">(máx. 200)</span>
            </label>
            <input
              type="text"
              value={novaReceita.descricao}
              onChange={(e) => setNovaReceita((prev) => ({ ...prev, descricao: e.target.value.slice(0, 200) }))}
              onKeyPress={handleKeyPress}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ex: Frete principal"
              disabled={saving}
              maxLength={200}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Valor (R$) *</label>
            <input
              type="text"
              value={novaReceita.valor ? formatCurrencyInput(novaReceita.valor) : ''}
              onChange={(e) => {
                // Armazena apenas os números digitados (sem formatação)
                const apenasNumeros = e.target.value.replace(/\D/g, '');
                setNovaReceita((prev) => ({ ...prev, valor: apenasNumeros }));
              }}
              onKeyPress={handleKeyPress}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="0,00"
              disabled={saving}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Data *</label>
            <input
              type="date"
              value={novaReceita.dataReceita}
              onChange={(e) => setNovaReceita((prev) => ({ ...prev, dataReceita: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              disabled={saving}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Origem <span className="text-xs text-slate-400">(máx. 100)</span>
            </label>
            <input
              type="text"
              value={novaReceita.origem}
              onChange={(e) => setNovaReceita((prev) => ({ ...prev, origem: e.target.value.slice(0, 100) }))}
              onKeyPress={handleKeyPress}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Cliente, contrato"
              disabled={saving}
              maxLength={100}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              title="Pressione Enter para adicionar rapidamente"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
            >
              <Icon name="plus" size="sm" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        {value.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Nenhuma receita adicionada. Utilize o formulário acima para incluir lançamentos.</div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 text-sm font-semibold text-foreground dark:border-slate-700">
              <span>Receitas registradas</span>
              <span className="text-emerald-600">Total: {totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {value.map((receita, index) => (
                <div key={`${receita.descricao}-${index}`} className="grid grid-cols-5 gap-4 px-6 py-4 text-sm">
                  <div className="col-span-2">
                    <p className="font-semibold text-foreground">{receita.descricao}</p>
                    {receita.origem && <p className="text-xs text-muted-foreground">Origem: {receita.origem}</p>}
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-600">{receita.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-xs text-muted-foreground">Valor</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{new Date(receita.dataReceita).toLocaleDateString('pt-BR')}</p>
                    <p className="text-xs text-muted-foreground">Data</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      disabled={saving}
                      className="rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
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
          title="Excluir Receita"
          itemName={value[deleteModal.index]?.descricao || ''}
          itemDetails={[
            { label: 'Valor', value: (value[deleteModal.index]?.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
            { label: 'Data', value: new Date(value[deleteModal.index]?.dataReceita || '').toLocaleDateString('pt-BR') },
            ...(value[deleteModal.index]?.origem ? [{ label: 'Origem', value: value[deleteModal.index].origem || '' }] : [])
          ]}
        />
      )}
    </div>
  );
};

const despesasOptions = Object.values(TiposDespesa).map((tipo) => ({ value: tipo, label: tipo }));

const DespesasManager: React.FC<{ value?: DespesaViagem[]; onChange: (despesas: DespesaViagem[]) => void; saving: boolean }>
= ({ value = [], onChange, saving }) => {
  const [novaDespesa, setNovaDespesa] = useState({
    tipoDespesa: despesasOptions[0]?.value || '',
    descricao: '',
    valor: '',
    dataDespesa: new Date().toISOString().substring(0, 10),
    local: '',
    observacoes: ''
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; index: number | null }>({
    isOpen: false,
    index: null
  });

  const handleAdd = () => {
    if (!novaDespesa.descricao.trim()) {
      alert('⚠️ Informe a descrição da despesa.');
      return;
    }

    if (novaDespesa.descricao.trim().length > 200) {
      alert('⚠️ A descrição não pode ter mais de 200 caracteres.');
      return;
    }

    const valorNumerico = parseCurrency(novaDespesa.valor);
    if (valorNumerico <= 0) {
      alert('⚠️ Informe um valor válido para a despesa.');
      return;
    }

    onChange([
      ...value,
      {
        tipoDespesa: novaDespesa.tipoDespesa,
        descricao: novaDespesa.descricao.trim(),
        valor: valorNumerico,
        dataDespesa: novaDespesa.dataDespesa,
        local: novaDespesa.local.trim() || undefined,
        observacoes: novaDespesa.observacoes.trim() || undefined
      }
    ]);

    setNovaDespesa({
      tipoDespesa: despesasOptions[0]?.value || '',
      descricao: '',
      valor: '',
      dataDespesa: new Date().toISOString().substring(0, 10),
      local: '',
      observacoes: ''
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    setDeleteModal({ isOpen: true, index });
  };

  const confirmDelete = () => {
    if (deleteModal.index !== null) {
      onChange(value.filter((_, idx) => idx !== deleteModal.index));
    }
    setDeleteModal({ isOpen: false, index: null });
  };

  const totalDespesas = value.reduce((acc, item) => acc + (item.valor || 0), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-teal-200/60 bg-white p-4 dark:border-teal-900/40 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Adicionar despesa</h4>
          <span className="text-xs text-slate-500">Campos obrigatórios marcados com *</span>
        </div>
        <div className="grid grid-cols-7 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Tipo *</label>
            <select
              value={novaDespesa.tipoDespesa}
              onChange={(e) => setNovaDespesa((prev) => ({ ...prev, tipoDespesa: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              disabled={saving}
            >
              {despesasOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Descrição * <span className="text-xs text-slate-400">(máx. 200)</span>
            </label>
            <input
              type="text"
              value={novaDespesa.descricao}
              onChange={(e) => setNovaDespesa((prev) => ({ ...prev, descricao: e.target.value.slice(0, 200) }))}
              onKeyPress={handleKeyPress}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ex: Combustível"
              disabled={saving}
              maxLength={200}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Valor (R$) *</label>
            <input
              type="text"
              value={novaDespesa.valor ? formatCurrencyInput(novaDespesa.valor) : ''}
              onChange={(e) => {
                // Armazena apenas os números digitados (sem formatação)
                const apenasNumeros = e.target.value.replace(/\D/g, '');
                setNovaDespesa((prev) => ({ ...prev, valor: apenasNumeros }));
              }}
              onKeyPress={handleKeyPress}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="0,00"
              disabled={saving}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Data *</label>
            <input
              type="date"
              value={novaDespesa.dataDespesa}
              onChange={(e) => setNovaDespesa((prev) => ({ ...prev, dataDespesa: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              disabled={saving}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              Local <span className="text-xs text-slate-400">(máx. 100)</span>
            </label>
            <input
              type="text"
              value={novaDespesa.local}
              onChange={(e) => setNovaDespesa((prev) => ({ ...prev, local: e.target.value.slice(0, 100) }))}
              onKeyPress={handleKeyPress}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Cidade, posto"
              disabled={saving}
              maxLength={100}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              title="Pressione Enter para adicionar rapidamente"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-700 disabled:opacity-50"
            >
              <Icon name="plus" size="sm" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        {value.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Nenhuma despesa adicionada. Registre custos para acompanhar o saldo da viagem.</div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 text-sm font-semibold text-foreground dark:border-slate-700">
              <span>Despesas registradas</span>
              <span className="text-red-600">Total: {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {value.map((despesa, index) => (
                <div key={`${despesa.descricao}-${index}`} className="grid grid-cols-6 gap-4 px-6 py-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{despesa.tipoDespesa}</p>
                    <p className="text-xs text-muted-foreground">{despesa.descricao}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-red-600">{despesa.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-xs text-muted-foreground">Valor</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{new Date(despesa.dataDespesa).toLocaleDateString('pt-BR')}</p>
                    <p className="text-xs text-muted-foreground">Data</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{despesa.local || 'Local não informado'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{despesa.observacoes || ''}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      disabled={saving}
                      className="rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
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
          title="Excluir Despesa"
          itemName={value[deleteModal.index]?.descricao || ''}
          itemDetails={[
            { label: 'Tipo', value: value[deleteModal.index]?.tipoDespesa || '' },
            { label: 'Valor', value: (value[deleteModal.index]?.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
            { label: 'Data', value: new Date(value[deleteModal.index]?.dataDespesa || '').toLocaleDateString('pt-BR') },
            ...(value[deleteModal.index]?.local ? [{ label: 'Local', value: value[deleteModal.index].local || '' }] : [])
          ]}
        />
      )}
    </div>
  );
};

interface FormViagemProps {
  mode?: 'editar' | 'visualizar';
}

export function FormViagem({ mode }: FormViagemProps = {}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const isViewMode = mode === 'visualizar';

  const viagemFromState = (location.state as LocationState | undefined)?.viagem;

  const [initialData, setInitialData] = useState<ViagemFormData | null>(null);
  const [formData, setFormData] = useState<ViagemFormData | null>(null);
  const [veiculoOptions, setVeiculoOptions] = useState<Option[]>([]);
  const [condutorOptions, setCondutorOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const buildOptions = useCallback((items: EntityOption[] | undefined): Option[] => {
    if (!items) return [];
    return items.map((item) => ({ value: String(item.id), label: item.label }));
  }, []);

  const mapToFormData = (viagem: Viagem): ViagemFormData => ({
    veiculoId: viagem.veiculoId ? String(viagem.veiculoId) : '',
    condutorId: viagem.condutorId ? String(viagem.condutorId) : '',
    motoristaNome: viagem.motoristaNome || viagem.condutorNome || '',
    dataInicio: viagem.dataInicio?.slice(0, 10) || '',
    dataFim: viagem.dataFim?.slice(0, 10) || '',
    origemDestino: viagem.origemDestino || '',
    kmInicial: viagem.kmInicial ?? '',
    kmFinal: viagem.kmFinal ?? '',
    observacoes: viagem.observacoes || '',
    receitas: Array.isArray(viagem.receitas) ? viagem.receitas : [],
    despesas: Array.isArray(viagem.despesas) ? viagem.despesas : []
  });

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const [veiculosResposta, condutoresResposta] = await Promise.all([
        entitiesService.obterVeiculos(),
        entitiesService.obterCondutores()
      ]);

      setVeiculoOptions(buildOptions(veiculosResposta));
      setCondutorOptions(buildOptions(condutoresResposta));

      if (isEdit && id) {
        if (viagemFromState) {
          setInitialData(mapToFormData(viagemFromState));
          setError(null);
        }

        const resposta = await viagensService.obterPorId(Number(id));
        if (resposta.success && resposta.data) {
          setInitialData(mapToFormData(resposta.data));
          setError(null);
        } else {
          setError(resposta.message || 'Não foi possível carregar a viagem.');
        }
      } else {
        setInitialData({ ...(viagemConfig.form.defaultValues as ViagemFormData) });
      }
    } catch (err) {
      console.error('Erro ao carregar dados da viagem:', err);
      setError('Erro inesperado ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [buildOptions, id, isEdit, viagemFromState]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Sincronizar formData com initialData
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Validações em tempo real
  useEffect(() => {
    if (!formData) return;

    const warnings: string[] = [];

    // Validar datas
    if (formData.dataInicio && formData.dataFim) {
      const dataInicio = new Date(formData.dataInicio);
      const dataFim = new Date(formData.dataFim);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Verificar se data de início é futura
      if (dataInicio > hoje) {
        warnings.push('⚠️ A data de início está no futuro');
      }

      // Calcular duração
      const diferencaDias = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diferencaDias > 60) {
        warnings.push('⚠️ Duração da viagem muito longa (mais de 60 dias). Verifique as datas.');
      }

      if (diferencaDias < 0) {
        warnings.push('❌ Data final deve ser maior ou igual à data inicial');
      }
    }

    // Validar KM
    const kmInicial = typeof formData.kmInicial === 'string' ? parseFloat(formData.kmInicial.replace(/\./g, '')) : formData.kmInicial;
    const kmFinal = typeof formData.kmFinal === 'string' ? parseFloat(formData.kmFinal.replace(/\./g, '')) : formData.kmFinal;

    if (kmInicial && kmFinal) {
      if (kmFinal <= kmInicial) {
        warnings.push('❌ KM final deve ser maior que KM inicial');
      } else {
        const kmPercorrido = kmFinal - kmInicial;
        
        if (kmPercorrido > 10000) {
          warnings.push('⚠️ KM percorrido muito alto (mais de 10.000 km). Verifique se está correto.');
        }
        
        if (kmPercorrido < 10) {
          warnings.push('⚠️ KM percorrido muito baixo (menos de 10 km). Verifique se está correto.');
        }
      }
    }

    // Validar saldo financeiro
    const totalReceitas = (formData.receitas || []).reduce((acc, r) => acc + (parseCurrency(r.valor) || 0), 0);
    const totalDespesas = (formData.despesas || []).reduce((acc, d) => acc + (parseCurrency(d.valor) || 0), 0);
    const saldo = totalReceitas - totalDespesas;

    if (saldo < -5000) {
      warnings.push('⚠️ Saldo muito negativo (prejuízo alto de ' + 
        saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + 
        '). Revise os lançamentos.');
    }

    setValidationWarnings(warnings);
  }, [formData?.dataInicio, formData?.dataFim, formData?.kmInicial, formData?.kmFinal, formData?.receitas, formData?.despesas]);

  const handleBack = () => {
    navigate('/viagens');
  };

  const handleFieldChange = useCallback((fieldKey: string, value: any) => {
    setFormData(prev => prev ? { ...prev, [fieldKey]: value } : null);
  }, []);

  const sections = useMemo(() => {
    const baseSections = viagemConfig.form.getSections(formData ?? undefined);

    return baseSections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        if (field.key === 'veiculoId') {
          return {
            ...field,
            options: veiculoOptions
          };
        }

        if (field.key === 'condutorId') {
          return {
            ...field,
            options: condutorOptions
          };
        }

        if (field.key === 'receitas') {
          return {
            ...field,
            render: ({ value, onChange, saving }) => (
              <ReceitasManager
                value={value as ReceitaViagem[]}
                onChange={(novasReceitas) => onChange(novasReceitas)}
                saving={saving}
              />
            )
          };
        }

        if (field.key === 'despesas') {
          return {
            ...field,
            render: ({ value, onChange, saving }) => (
              <DespesasManager
                value={value as DespesaViagem[]}
                onChange={(novasDespesas) => onChange(novasDespesas)}
                saving={saving}
              />
            )
          };
        }

        return field;
      })
    }));
  }, [condutorOptions, formData, veiculoOptions]);

  const handleSave = async (dados: ViagemFormData) => {
    setError(null);

    if (!dados.veiculoId) {
      throw new Error('Selecione um veículo para registrar a viagem.');
    }

    if (!dados.dataInicio || !dados.dataFim) {
      throw new Error('Informe as datas de início e término da viagem.');
    }

    if (new Date(dados.dataFim) < new Date(dados.dataInicio)) {
      throw new Error('A data final deve ser maior que a data inicial.');
    }

    const receitasSanitizadas = (dados.receitas || []).map((receita) => ({
      descricao: receita.descricao,
      valor: parseCurrency(receita.valor as any),
      dataReceita: receita.dataReceita,
      origem: receita.origem,
      observacoes: receita.observacoes
    }));

    const despesasSanitizadas = (dados.despesas || []).map((despesa) => ({
      tipoDespesa: despesa.tipoDespesa,
      descricao: despesa.descricao,
      valor: parseCurrency(despesa.valor as any),
      dataDespesa: despesa.dataDespesa,
      local: despesa.local,
      observacoes: despesa.observacoes
    }));

    const payload: Viagem = {
      veiculoId: Number(dados.veiculoId),
      condutorId: dados.condutorId ? Number(dados.condutorId) : undefined,
      motoristaNome: dados.motoristaNome?.trim() || undefined,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
      origemDestino: dados.origemDestino?.trim() || undefined,
      kmInicial: dados.kmInicial ? Number(dados.kmInicial) : undefined,
      kmFinal: dados.kmFinal ? Number(dados.kmFinal) : undefined,
      observacoes: dados.observacoes?.trim() || undefined,
      receitas: receitasSanitizadas,
      despesas: despesasSanitizadas
    } as Viagem;

    try {
      const resposta = isEdit && id
        ? await viagensService.atualizar(Number(id), payload)
        : await viagensService.criar(payload);

      if (!resposta.success) {
        const mensagem = resposta.message || 'Erro ao salvar viagem.';
        setError(mensagem);
        throw new Error(mensagem);
      }

      navigate('/viagens', { replace: true, state: { revalidate: true } });
    } catch (err: any) {
      console.error('Erro ao salvar viagem:', err);
      const mensagem = err?.message || 'Erro ao salvar viagem.';
      setError(mensagem);
      throw err;
    }
  };

  const pageTitle = isEdit ? viagemConfig.form.editTitle || viagemConfig.form.title : viagemConfig.form.title;
  const pageSubtitle = isEdit ? viagemConfig.form.editSubtitle || viagemConfig.form.subtitle : viagemConfig.form.subtitle;

  return (
    <FormPageLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      iconName={viagemConfig.form.headerIcon}
      headerColor={viagemConfig.form.headerColor}
      onBack={handleBack}
      isLoading={loading}
      loadingMessage="Carregando viagem..."
      error={error}
    >
      {/* Alertas de validação */}
      {validationWarnings.length > 0 && (
        <div className="mb-6 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <div className="flex items-start gap-3">
            <Icon name="exclamation-triangle" className="text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Atenção aos seguintes pontos:
              </h4>
              <ul className="space-y-1">
                {validationWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-700 dark:text-amber-300">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {formData && (
        <GenericForm<ViagemFormData>
          key={isEdit ? `viagem-${id ?? 'edicao'}` : 'viagem-nova'}
          data={formData}
          sections={sections}
          isEditing={isEdit}
          title={pageTitle}
          subtitle={pageSubtitle}
          headerIcon={viagemConfig.form.headerIcon}
          headerColor={viagemConfig.form.headerColor}
          onSave={handleSave}
          onCancel={handleBack}
          onFieldChange={handleFieldChange}
          submitLabel={isEdit ? 'Atualizar viagem' : 'Salvar viagem'}
          cancelLabel={isViewMode ? 'Voltar' : 'Cancelar'}
          hideCancelButton={false}
          maxWidth="full"
          readonly={isViewMode}
        />
      )}
    </FormPageLayout>
  );
}
