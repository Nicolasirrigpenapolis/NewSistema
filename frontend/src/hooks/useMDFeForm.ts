// FRONTEND: APENAS GESTÃO DE ESTADO DA UI
// Lógica de negócio, mapeamentos e transformações movidas para o backend

import { useState, useCallback } from 'react';
import { MDFeData } from '../types/mdfe';
import { entitiesService } from '../services/entitiesService';

export interface Entity {
  id: string;
  label: string;
  description: string;
}

export interface Entities {
  emitentes: Entity[];
  veiculos: Entity[];
  condutores: Entity[];
  contratantes: Entity[];
  seguradoras: Entity[];
}

/**
 * Hook SIMPLIFICADO - apenas para UI
 *
 * RESPONSABILIDADES (APENAS UI):
 * - Gerenciar estado do formulário
 * - Controlar seleções nos comboboxes
 * - Atualizar campos da UI
 *
 * NÃO FAZ MAIS:
 * Consultas API complexas
 * Transformações de dados
 * Validações de negócio
 * Mapeamentos frontend ↔ backend
 * Correções/lógica de dados
 */
export const useMDFeForm = () => {
  // Estados simples para UI
  const [dados, setDados] = useState<Partial<MDFeData>>({});
  const [selectedIds, setSelectedIds] = useState<{
    emitenteId: string | number;
    veiculoId: string | number;
    condutorId: string | number;
    contratanteId: string | number;
    seguradoraId: string | number;
  }>({
    emitenteId: '',
    veiculoId: '',
    condutorId: '',
    contratanteId: '',
    seguradoraId: ''
  });

  // Atualizar campo do formulário (UI apenas)
  const updateField = useCallback((field: string, value: any) => {
    setDados(prev => ({ ...prev, [field]: value }));
  }, []);

  // Atualizar seleção de entidade com auto-população para emitente
  const selectEntity = useCallback(async (entityType: string, id: string | number) => {
    // entityType já vem com 'Id' no final (ex: 'emitenteId', 'veiculoId')
    setSelectedIds(prev => ({ ...prev, [entityType]: id }));

    // Atualizar o dado correspondente - converter para número se necessário
    const numericId = typeof id === 'string' ? (id ? parseInt(id) : undefined) : id;
    setDados(prev => ({ ...prev, [entityType]: numericId }));

    // AUTO-POPULAR dados do emitente quando selecionado
    if (entityType === 'emitenteId' && numericId) {
      try {
        const response = await entitiesService.obterDadosEmitente(numericId);
        if (response.sucesso && response.dados) {
          const emitenteData = response.dados;
          setDados(prev => ({
            ...prev,
            emitenteId: numericId,
            ufIni: emitenteData.uf,
            ufFim: emitenteData.uf // Por padrão, UF fim = UF início
            // Backend processará município automaticamente
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do emitente:', error);
      }
    }
  }, []);

  // Definir dados completos (vem do componente pai)
  const setFormData = useCallback((data: Partial<MDFeData>) => {
    setDados(data);

    // Atualizar selectedIds baseado nos dados
    setSelectedIds({
      emitenteId: data.emitenteId?.toString() || '',
      veiculoId: data.veiculoId?.toString() || '',
      condutorId: data.condutorId?.toString() || '',
      contratanteId: data.contratanteId?.toString() || '',
      seguradoraId: data.seguradoraId?.toString() || ''
    });
  }, []);

  // Reset do formulário
  const resetForm = useCallback(() => {
    setDados({});
    setSelectedIds({
      emitenteId: '',
      veiculoId: '',
      condutorId: '',
      contratanteId: '',
      seguradoraId: ''
    });
  }, []);

  // API ULTRA-SIMPLIFICADA - apenas UI
  return {
    // Estados da UI
    dados,
    selectedIds,

    // Actions da UI
    updateField,     // Atualizar um campo
    selectEntity,    // Selecionar entidade no combobox
    setFormData,     // Definir dados completos
    resetForm        // Reset
  };
};