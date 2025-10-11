// FRONTEND: Hook simples para carregar entidades
// Backend é responsável por formatação e transformações

import { useState, useEffect } from 'react';
import { entitiesService } from '../services/entitiesService';
import { EntityOption } from '../types/apiResponse';

export interface EntitiesData {
  emitentes: EntityOption[];
  condutores: EntityOption[];
  veiculos: EntityOption[];
  contratantes: EntityOption[];
  seguradoras: EntityOption[];
}

export const useEntities = () => {
  const [entities, setEntities] = useState<EntitiesData>({
    emitentes: [],
    condutores: [],
    veiculos: [],
    contratantes: [],
    seguradoras: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Uma chamada unificada ao backend
      const data = await entitiesService.obterTodasEntidades();
      setEntities(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar entidades';
      setError(errorMessage);
      console.error('Erro ao carregar entidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntities();
  }, []);

  return {
    entities,
    loading,
    error,
    reload: loadEntities
  };
};