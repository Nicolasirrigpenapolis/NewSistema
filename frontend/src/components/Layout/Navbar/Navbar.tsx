import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useEmitente } from '../../../contexts/EmitenteContext';
import { Sun, Moon, Menu, ChevronDown, LogOut, Building2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLocation } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { nomeExibicao, logoUrl } = useEmitente();
  const { themeMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Detectar módulo atual baseado na rota
  const moduloAtual = React.useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'Administração';
    if (path.startsWith('/manutencoes') || path.startsWith('/viagens') || path.startsWith('/relatorios')) {
      return 'Gestão Operacional';
    }
    if (path.startsWith('/configuracoes')) return 'Configurações';
    if (path.startsWith('/mdfe')) return 'MDF-e';
    if (path.startsWith('/nfe')) return 'NF-e';
    if (path.startsWith('/cte')) return 'CT-e';
    if (path.startsWith('/veiculos') || path.startsWith('/condutores') || path.startsWith('/reboques'))
      return 'Operações';
    if (path.startsWith('/contratantes') || path.startsWith('/seguradoras') || path.startsWith('/municipios') || path.startsWith('/fornecedores'))
      return 'Cadastros';
    if (path === '/dashboard' || path === '/') return 'Dashboard';
    return 'Gestão';
  }, [location.pathname]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-sm border-b border-border z-50 shadow-sm transition-all duration-300">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Logo e Nome do Emitente - Mobile (à esquerda) */}
          <div className="lg:hidden flex items-center gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
              {nomeExibicao}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-accent rounded-lg transition-all duration-200"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* Logo e Nome do Emitente - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {nomeExibicao}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                Módulo: {moduloAtual}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-accent rounded-lg transition-all duration-200"
            aria-label="Alternar tema"
            title={themeMode === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-5 h-5 text-slate-300 hover:text-foreground transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 hover:text-foreground transition-colors" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-lg transition-all duration-200 ml-2 border-l border-border pl-4"
              aria-label="Menu do usuário"
            >
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-slate-900 dark:text-white leading-tight hidden sm:block">
                  {user?.nome || user?.username || 'Usuário'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight hidden sm:block">
                  {user?.cargoNome || 'Sem cargo'}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {(user?.nome || user?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.nome || user?.username || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {user?.cargoNome || 'Sem cargo definido'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Encerrar sessão</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
