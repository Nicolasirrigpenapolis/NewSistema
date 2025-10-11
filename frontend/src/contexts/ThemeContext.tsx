import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeMode() {
  const { themeMode } = useTheme();
  return themeMode;
}

export function useIsDark() {
  const { isDark } = useTheme();
  return isDark;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Inicializar tema de forma síncrona para evitar flashes
  const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'light';

    const savedTheme = localStorage.getItem('mdfe-theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const initialTheme = getInitialTheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);

  const isDark = themeMode === 'dark';

  const applyTheme = (mode: ThemeMode) => {
    // Atualizar documento para Tailwind/Shadcn
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Aplicar tema inicial apenas uma vez
  useEffect(() => {
    applyTheme(initialTheme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';

    // Aplicar todas as mudanças em lote
    setThemeMode(newTheme);
    applyTheme(newTheme);

    // Salvar preferência
    localStorage.setItem('mdfe-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
