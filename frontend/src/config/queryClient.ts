import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configurações de cache
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados "frescos"
      gcTime: 10 * 60 * 1000, // 10 minutos - tempo que dados ficam em cache (antigo cacheTime)

      // Comportamento
      refetchOnWindowFocus: false, // Não refaz a query ao focar na janela
      refetchOnMount: false, // Não refaz a query ao montar o componente se dados estão frescos
      refetchOnReconnect: true, // Refaz a query ao reconectar

      // Retry
      retry: 1, // Tenta novamente 1 vez em caso de falha
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry em mutations
      retry: false, // Não tenta novamente mutations automaticamente
    },
  },
});
