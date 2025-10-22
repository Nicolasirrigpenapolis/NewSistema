import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { emitenteService, type EmitenteDto } from '../services/emitenteService';
import { empresaService, type EmpresaConfiguracao } from '../services/empresaService';

interface EmitenteContextType {
  emitente: EmitenteDto | null;
  empresa: EmpresaConfiguracao | null;
  logoUrl: string | null;
  backgroundUrl: string | null;
  nomeExibicao: string;
  loading: boolean;
  recarregar: () => Promise<void>;
}

const EmitenteContext = createContext<EmitenteContextType | undefined>(undefined);

interface EmitenteProviderProps {
  children: ReactNode;
}

export function EmitenteProvider({ children }: EmitenteProviderProps) {
  const [emitente, setEmitente] = useState<EmitenteDto | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaConfiguracao | null>(null);
  const [loading, setLoading] = useState(true);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>(
    localStorage.getItem('empresaSelecionada') || ''
  );

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [emitenteData, empresaData] = await Promise.all([
        emitenteService.obterEmitenteAtual(),
        empresaService.obterConfiguracao()
      ]);

      setEmitente(emitenteData);
      setEmpresa(empresaData);
    } catch (error) {
      console.error('Erro ao carregar dados do emitente:', error);
    } finally {
      setLoading(false);
    }
  };

  // Monitorar mudanças na empresa selecionada
  useEffect(() => {
    const handleEmpresaMudou = (event: CustomEvent) => {
      const novaEmpresa = event.detail.empresaSelecionada;
      setEmpresaSelecionada(novaEmpresa);
      // Recarregar dados quando a empresa mudar
      carregarDados();
          // Antes havia um reload da página para garantir sincronização.
          // Isso causa problemas na tela de login (ex.: mostra dados genéricos).
          // Evitar o reload automático quando estivermos na rota de login.
          if (window.location.pathname !== '/login') {
            // Manter o comportamento antigo para outras rotas (delay curto para sincronização)
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
    };

    // Ouvir eventos customizados de mudança de empresa
    window.addEventListener('empresaMudou' as any, handleEmpresaMudou as EventListener);

    return () => {
      window.removeEventListener('empresaMudou' as any, handleEmpresaMudou as EventListener);
    };
  }, []);

  useEffect(() => {
    carregarDados();
  }, []);

  // Mapeamento de imagens estáticas por empresa
  const imagensPorEmpresa: Record<string, { logo?: string; fundo?: string }> = {
    'irrigacao': {
      logo: '/imagens/logo_IP.png',
      fundo: '/imagens/imagem_login_IP.jpg'
    },
    'chinellato': {
      logo: '/imagens/logo_chinellato.png',
      fundo: '/imagens/imagem_login_chinellato.jpg'
    }
  };

  const imagens = imagensPorEmpresa[empresaSelecionada] || {};
  const logoUrl = imagens.logo || null;
  const backgroundUrl = imagens.fundo || null;
  const nomeExibicao = emitente?.nomeFantasia || emitente?.razaoSocial || empresa?.nomeExibicao || '';

  return (
    <EmitenteContext.Provider
      value={{
        emitente,
        empresa,
        logoUrl,
        backgroundUrl,
        nomeExibicao,
        loading,
        recarregar: carregarDados
      }}
    >
      {children}
    </EmitenteContext.Provider>
  );
}

export function useEmitente(): EmitenteContextType {
  const context = useContext(EmitenteContext);
  if (context === undefined) {
    throw new Error('useEmitente deve ser usado dentro de um EmitenteProvider');
  }
  return context;
}
