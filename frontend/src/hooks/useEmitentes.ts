import { useState, useEffect, useCallback, useMemo } from 'react';
import { entitiesService } from '../services/entitiesService';
import { Emitente, PaginationData, EmitenteFilters } from '../types/emitente';

export const useEmitentes = () => {
  const [emitentes, setEmitentes] = useState<Emitente[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [paginacao, setPaginacao] = useState<PaginationData | null>(null);
  const [filtros, setFiltros] = useState<EmitenteFilters>({
    search: '',
    tipo: '',
    status: '',
    uf: ''
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);

  const carregarEmitentes = useCallback(async (
    pagina: number = paginaAtual,
    search: string = filtros.search,
    tipo: string = filtros.tipo,
    status: string = filtros.status,
    uf: string = filtros.uf
  ) => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagina.toString());
      params.append('pageSize', tamanhoPagina.toString());

      if (search.trim()) params.append('search', search.trim());
      if (tipo) params.append('TipoEmitente', tipo);
      if (status) params.append('Status', status === 'ativo' ? 'true' : 'false');
      if (uf) params.append('Uf', uf);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://localhost:5001/api'}/emitentes?${params}`);

      if (response.ok) {
        const data = await response.json();
        setEmitentes(data.items || []);
        setPaginacao({
          totalItems: data.totalItems,
          totalPages: data.totalPages,
          currentPage: data.page,
          pageSize: data.pageSize,
          hasNextPage: data.hasNextPage,
          hasPreviousPage: data.hasPreviousPage,
          startItem: ((data.page - 1) * data.pageSize) + 1,
          endItem: Math.min(data.page * data.pageSize, data.totalItems)
        });
      }
    } catch (error) {
      console.error('Erro ao carregar emitentes:', error);
    } finally {
      setCarregando(false);
    }
  }, [paginaAtual, tamanhoPagina, filtros]);

  const excluirEmitente = useCallback(async (id: number) => {
    try {
      const resposta = await entitiesService.excluirEmitente(id);
      if (resposta.sucesso) {
        await carregarEmitentes();
        return { sucesso: true, mensagem: 'Emitente excluído com sucesso!' };
      }
      return { sucesso: false, mensagem: resposta.mensagem || 'Erro ao excluir emitente' };
    } catch (error) {
      return { sucesso: false, mensagem: 'Erro de conexão' };
    }
  }, [carregarEmitentes]);

  const salvarEmitente = useCallback(async (dados: Emitente, modoEdicao: boolean, emitenteId?: number) => {
    try {
      const dadosLimpos = { ...dados };

      // Limpeza de campos opcionais vazios
      Object.keys(dadosLimpos).forEach(key => {
        const value = dadosLimpos[key as keyof Emitente];
        if (value === '' || value === null) {
          delete dadosLimpos[key as keyof Emitente];
        }
      });

      let resposta;
      if (modoEdicao && emitenteId) {
        resposta = await entitiesService.atualizarEmitente(emitenteId, dadosLimpos);
      } else {
        resposta = await entitiesService.criarEmitente(dadosLimpos);
      }

      if (resposta.sucesso) {
        await carregarEmitentes();
        return { sucesso: true, mensagem: modoEdicao ? 'Emitente atualizado com sucesso!' : 'Emitente criado com sucesso!' };
      }
      return { sucesso: false, mensagem: resposta.mensagem || 'Erro ao salvar emitente' };
    } catch (error) {
      return { sucesso: false, mensagem: 'Erro de conexão' };
    }
  }, [carregarEmitentes]);

  // Carregamento inicial
  useEffect(() => {
    carregarEmitentes(1, '', '', '', '');
  }, []);

  // Filtros com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (paginaAtual === 1) {
        carregarEmitentes(1, filtros.search, filtros.tipo, filtros.status, filtros.uf);
      } else {
        setPaginaAtual(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filtros, carregarEmitentes]);

  // Mudança de página
  useEffect(() => {
    carregarEmitentes(paginaAtual, filtros.search, filtros.tipo, filtros.status, filtros.uf);
  }, [paginaAtual, tamanhoPagina]);

  const emitentesFiltrados = useMemo(() => emitentes, [emitentes]);

  const atualizarFiltros = useCallback((novosFiltros: Partial<EmitenteFilters>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros({ search: '', tipo: '', status: '', uf: '' });
  }, []);

  return {
    // Estado
    emitentes: emitentesFiltrados,
    carregando,
    paginacao,
    filtros,
    paginaAtual,
    tamanhoPagina,

    // Ações
    carregarEmitentes,
    excluirEmitente,
    salvarEmitente,
    atualizarFiltros,
    limparFiltros,
    setPaginaAtual,
    setTamanhoPagina
  };
};