import React, { useState, useEffect } from 'react';
import { FormShell } from '../FormShell';
import Icon from '../Icon';

export interface FiltrosExportacao {
  dataInicio: string;
  dataFim: string;
  formato: 'excel' | 'pdf';
  placa?: string;
  tipoDespesa?: string;
  condutorId?: number;
}

interface ModalExportacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onExportar: (params: FiltrosExportacao) => Promise<void>;
  filtrosIniciais?: Partial<FiltrosExportacao>;
  tipoRelatorio?: 'viagens' | 'manutencoes';
  opcoesFiltros?: {
    veiculos?: Array<{ value: string; label: string }>;
    tiposDespesa?: Array<{ value: string; label: string }>;
    condutores?: Array<{ value: number; label: string }>;
  };
}

export function ModalExportacao({
  isOpen,
  onClose,
  onExportar,
  filtrosIniciais = {},
  tipoRelatorio = 'viagens',
  opcoesFiltros = {}
}: ModalExportacaoProps) {
  const [exportando, setExportando] = useState(false);
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosExportacao>({
    dataInicio: filtrosIniciais.dataInicio || '',
    dataFim: filtrosIniciais.dataFim || '',
    formato: filtrosIniciais.formato || 'excel',
    placa: filtrosIniciais.placa || '',
    tipoDespesa: filtrosIniciais.tipoDespesa || '',
    condutorId: filtrosIniciais.condutorId
  });

  // Reset ao abrir modal
  useEffect(() => {
    if (isOpen) {
      setErro(null);
      setFiltros({
        dataInicio: filtrosIniciais.dataInicio || '',
        dataFim: filtrosIniciais.dataFim || '',
        formato: filtrosIniciais.formato || 'excel',
        placa: filtrosIniciais.placa || '',
        tipoDespesa: filtrosIniciais.tipoDespesa || '',
        condutorId: filtrosIniciais.condutorId
      });
    }
  }, [isOpen, filtrosIniciais]);

  const handleChange = (field: keyof FiltrosExportacao, value: any) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
    setErro(null);
  };

  const validarFormulario = (): string | null => {
    if (!filtros.dataInicio || !filtros.dataFim) {
      return 'Data inicial e data final são obrigatórias';
    }

    const dataInicio = new Date(filtros.dataInicio);
    const dataFim = new Date(filtros.dataFim);

    if (dataFim < dataInicio) {
      return 'Data final deve ser maior ou igual à data inicial';
    }

    return null;
  };

  const handleExportar = async () => {
    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setExportando(true);
      setErro(null);
      await onExportar(filtros);
      onClose();
    } catch (error: any) {
      setErro(error.message || 'Erro ao exportar relatório');
    } finally {
      setExportando(false);
    }
  };

  if (!isOpen) return null;

  const datasInvalidas = filtros.dataInicio && filtros.dataFim && 
    new Date(filtros.dataFim) < new Date(filtros.dataInicio);

  return (
    <FormShell
      title="Exportar Relatório"
      subtitle="Configure o período, formato e filtros para exportação"
      headerIcon="download"
      headerColor="linear-gradient(135deg, #10b981 0%, #059669 100%)"
      isModal={true}
      maxWidth="2xl"
      onClose={onClose}
      loading={exportando}
      error={erro}
      actions={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={exportando}
            className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExportar}
            disabled={exportando || datasInvalidas || !filtros.dataInicio || !filtros.dataFim}
            className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {exportando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Icon name="download" />
                <span>Exportar</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Seção: Período */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Icon name="calendar" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Período *
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => handleChange('dataInicio', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => handleChange('dataFim', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>
          {datasInvalidas && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <Icon name="exclamation-circle" />
                Data final deve ser maior ou igual à data inicial
              </p>
            </div>
          )}
        </div>

        {/* Seção: Formato */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <Icon name="file-alt" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Formato *
            </h3>
          </div>
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="formato"
                value="excel"
                checked={filtros.formato === 'excel'}
                onChange={(e) => handleChange('formato', e.target.value)}
                className="sr-only"
              />
              <div className={`p-4 rounded-lg border-2 transition-all ${
                filtros.formato === 'excel'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
              }`}>
                <div className="flex items-center gap-3">
                  <Icon name="file-excel" className={`text-2xl ${filtros.formato === 'excel' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-semibold ${filtros.formato === 'excel' ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Excel
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Formato .xlsx para análise
                    </p>
                  </div>
                </div>
              </div>
            </label>

            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="formato"
                value="pdf"
                checked={filtros.formato === 'pdf'}
                onChange={(e) => handleChange('formato', e.target.value)}
                className="sr-only"
              />
              <div className={`p-4 rounded-lg border-2 transition-all ${
                filtros.formato === 'pdf'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
              }`}>
                <div className="flex items-center gap-3">
                  <Icon name="file-pdf" className={`text-2xl ${filtros.formato === 'pdf' ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
                  <div>
                    <p className={`font-semibold ${filtros.formato === 'pdf' ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      PDF
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Formato para impressão
                    </p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Seção: Filtros Avançados (Collapse) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Icon name="sliders-h" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Filtros Avançados (opcional)
              </h3>
            </div>
            <Icon 
              name={mostrarFiltrosAvancados ? 'chevron-up' : 'chevron-down'} 
              className="text-gray-400"
            />
          </button>

          {mostrarFiltrosAvancados && (
            <div className="p-5 pt-0 space-y-4 border-t border-gray-200 dark:border-slate-700">
              {/* Condutor */}
              {opcoesFiltros.condutores && tipoRelatorio === 'viagens' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Icon name="user" className="inline mr-1" />
                    Condutor
                  </label>
                  <select
                    value={filtros.condutorId || ''}
                    onChange={(e) => handleChange('condutorId', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
                  >
                    <option value="">Todos os condutores</option>
                    {opcoesFiltros.condutores.map(condutor => (
                      <option key={condutor.value} value={condutor.value}>
                        {condutor.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Placa */}
              {opcoesFiltros.veiculos && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Icon name="truck" className="inline mr-1" />
                    Veículo (Placa)
                  </label>
                  <input
                    type="text"
                    value={filtros.placa || ''}
                    onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
                    placeholder="Ex: ABC1234"
                    maxLength={7}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all uppercase"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Digite a placa para filtrar viagens de um veículo específico
                  </p>
                </div>
              )}

              {/* Tipo de Despesa */}
              {opcoesFiltros.tiposDespesa && tipoRelatorio === 'viagens' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Icon name="dollar-sign" className="inline mr-1" />
                    Tipo de Despesa
                  </label>
                  <select
                    value={filtros.tipoDespesa || ''}
                    onChange={(e) => handleChange('tipoDespesa', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
                  >
                    <option value="">Todos os tipos</option>
                    {opcoesFiltros.tiposDespesa.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </FormShell>
  );
}
