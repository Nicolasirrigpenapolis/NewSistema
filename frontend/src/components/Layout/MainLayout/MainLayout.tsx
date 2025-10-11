import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { TokenWarning } from '../../Auth/TokenWarning';
import { useTokenMonitor } from '../../../hooks/useTokenMonitor';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  // Determinar estado inicial baseado no tamanho da tela
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarAberta, setSidebarAberta] = useState(() => {
    // Inicializar com base no tamanho da tela atual
    return window.innerWidth >= 1024; // Aberta em desktop, fechada em mobile
  });

  // Todos os hooks devem estar no topo, antes de qualquer early return
  const { showWarning, tokenTimeRemaining, onContinue, onLogout } = useTokenMonitor();

  // Monitorar mudanças no tamanho da tela
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      const wasMobile = isMobile;
      setIsMobile(mobile);

      // Só alterar sidebar automaticamente quando há mudança desktop <-> mobile
      if (wasMobile !== mobile) {
        if (mobile) {
          // Mudou para mobile: fechar sidebar
          setSidebarAberta(false);
        } else {
          // Mudou para desktop: abrir sidebar
          setSidebarAberta(true);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Não mostrar layout para páginas de autenticação
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  const toggleSidebar = () => {
    setSidebarAberta(!sidebarAberta);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Header fixo no topo */}
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarAberta={sidebarAberta}
        isMobile={isMobile}
      />

      {/* Container principal com altura calculada (100vh - altura do header) */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <Sidebar
          aberta={sidebarAberta}
          isMobile={isMobile}
          onClose={() => setSidebarAberta(false)}
        />

        {/* Overlay para mobile quando sidebar está aberta */}
        {isMobile && sidebarAberta && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarAberta(false)}
          />
        )}

        {/* Área de conteúdo principal - usa o espaço restante */}
        <main className={`
          flex-1 overflow-auto transition-all duration-300 ease-in-out
          ${!isMobile ? (sidebarAberta ? 'lg:ml-64' : 'lg:ml-16') : 'ml-0'}
          bg-background
        `}>
          <div className="p-2 sm:p-4 h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Modal de aviso sobre expiração do token */}
      <TokenWarning
        isVisible={showWarning}
        timeRemaining={tokenTimeRemaining}
        onContinue={onContinue}
        onLogout={onLogout}
      />
    </div>
  );
}