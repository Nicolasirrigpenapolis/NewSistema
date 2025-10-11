import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { ThemeToggle } from '../../UI/Common/ThemeToggle';
import Icon from '../../UI/Icon';
import logoIP from '../../../assets/images/logo-ip.png';
import { useEmpresa } from '../../../contexts/EmpresaContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarAberta: boolean;
  isMobile?: boolean;
}

export function Header({ onToggleSidebar, sidebarAberta, isMobile }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { empresa } = useEmpresa();

  const nomeEmpresa = empresa?.nomeExibicao || 'Sistema Geral';
  const logoUrl = empresa?.urlLogotipo || logoIP;

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="
      fixed top-0 left-0 right-0 z-50
      flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4
      bg-card
      border-b border-gray-200 dark:border-0
      shadow-sm dark:shadow-gray-900/20
      transition-colors duration-200
      h-16 sm:h-20
    ">
      <div className="flex items-center gap-4">
        <button
          className="
            p-2 rounded-lg transition-all duration-200
            text-muted-foreground dark:text-gray-300
            hover:bg-accent
            hover:text-foreground dark:hover:text-white
            focus:outline-none
          "
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <Icon name="bars" size="md" />
        </button>

        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer focus:outline-none"
          title="Ir para Dashboard"
        >
          {empresa?.urlLogotipo ? (
            <img
              src={logoUrl}
              alt={nomeEmpresa}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-md bg-white border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
              <Icon name="building" size="md" />
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-foreground">
              {nomeEmpresa}
            </h1>
            {empresa?.identificador && (
              <span className="text-xs text-muted-foreground">
                {empresa.identificador}
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-transparent"></div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="
              w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600
              flex items-center justify-center text-white text-sm font-medium
            ">
              <Icon name="user" size="sm" />
            </div>
            <div className="hidden md:block">
              <span className="block text-sm font-medium text-foreground">
                {user?.nome || 'Usuário'}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                {user?.username || 'Não autenticado'}
              </span>
            </div>
            <button className="
              hidden sm:block p-1 rounded-md transition-colors duration-200
              text-gray-400 dark:text-gray-500
              hover:text-muted-foreground dark:hover:text-gray-300
              focus:outline-none
            ">
              <Icon name="chevron-down" size="sm" />
            </button>
          </div>
        </div>

        <button
          className="
            flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duração-200
            text-red-600 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-900/20
            hover:text-red-700 dark:hover:text-red-300
            border border-transparent hover:border-red-200 dark:hover:border-transparent
            focus:outline-none
          "
          onClick={handleLogout}
          title="Sair do sistema"
        >
          <Icon name="sign-out-alt" size="sm" />
          <span className="hidden sm:inline text-sm font-medium">Sair</span>
        </button>
      </div>
    </header>
  );
}

