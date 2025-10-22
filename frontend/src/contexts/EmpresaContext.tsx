import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { empresaService, EmpresaConfiguracao } from '../services/empresaService';
import { useAuth } from './AuthContext';

interface EmpresaContextValue {
  empresa: EmpresaConfiguracao | null;
  carregando: boolean;
  erro: string | null;
  atualizar: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextValue | undefined>(undefined);

interface EmpresaProviderProps {
  children: ReactNode;
}

export function EmpresaProvider({ children }: EmpresaProviderProps) {
  const { isAuthenticated } = useAuth();
  const [empresa, setEmpresa] = useState<EmpresaConfiguracao | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!isAuthenticated) {
      setEmpresa(null);
      setErro(null);
      return;
    }

    try {
      setCarregando(true);
      setErro(null);
      const dados = await empresaService.obterConfiguracao();
      setEmpresa(dados);
    } catch (error) {
      console.error('Erro ao carregar configuração da empresa:', error);
      setErro('Não foi possível carregar as informações da empresa.');
    } finally {
      setCarregando(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // Monitorar mudanças na empresa selecionada no localStorage
  useEffect(() => {
    const handleEmpresaMudou = () => {
      // Recarregar dados quando a empresa mudar
      void carregar();
    };

    // Ouvir eventos customizados de mudança de empresa
    window.addEventListener('empresaMudou', handleEmpresaMudou);

    return () => {
      window.removeEventListener('empresaMudou', handleEmpresaMudou);
    };
  }, [carregar]);

  const value = useMemo<EmpresaContextValue>(() => ({
    empresa,
    carregando,
    erro,
    atualizar: carregar,
  }), [empresa, carregando, erro, carregar]);

  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa(): EmpresaContextValue {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa deve ser usado dentro de um EmpresaProvider');
  }
  return context;
}
