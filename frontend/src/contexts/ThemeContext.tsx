import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyThemeClass = (mode: ThemeMode) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.style.setProperty('color-scheme', mode);
};

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
  const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'light';

    const savedTheme = localStorage.getItem('mdfe-theme') as ThemeMode;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      applyThemeClass(savedTheme);
      return savedTheme;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme = prefersDark ? 'dark' : 'light';
    applyThemeClass(resolvedTheme);
    return resolvedTheme;
  };

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getInitialTheme());
  const [hasExplicitPreference, setHasExplicitPreference] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const savedTheme = localStorage.getItem('mdfe-theme');
    return savedTheme === 'light' || savedTheme === 'dark';
  });

  const isDark = themeMode === 'dark';

  useEffect(() => {
    applyThemeClass(themeMode);

    if (typeof window !== 'undefined' && hasExplicitPreference) {
      localStorage.setItem('mdfe-theme', themeMode);
    }
  }, [themeMode, hasExplicitPreference]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (!hasExplicitPreference) {
        setThemeMode(event.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [hasExplicitPreference]);

  const toggleTheme = () => {
    setHasExplicitPreference(true);
    setThemeMode((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
