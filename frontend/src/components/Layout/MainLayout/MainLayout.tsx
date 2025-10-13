import React from 'react';

export const MainLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="container mx-auto px-4 py-6">{children}</div>
    </div>
  );
};

export default MainLayout;
