import React, { useState } from 'react';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar/Sidebar';

export const MainLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar fixa no topo */}
      <Navbar onMenuClick={handleMenuClick} />
      
      {/* Sidebar fixa abaixo da navbar */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      
      {/* Conteúdo principal com offset para navbar e sidebar */}
      <main className="pt-16 lg:ml-72">
        <div className="w-full px-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
