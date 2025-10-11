// Teste de modificação - App.tsx
import { BrowserRouter, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './config/queryClient';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { EmpresaProvider } from './contexts/EmpresaContext';
import { MainLayout } from './components/Layout/MainLayout/MainLayout';
import { AppRoutes } from './routes/AppRoutes';
import './styles/globals.css';

function AppContent() {
  const location = useLocation();

  // Páginas que não devem ter o MainLayout
  const pagesWithoutLayout = ['/login'];
  const shouldShowLayout = !pagesWithoutLayout.includes(location.pathname);

  return shouldShowLayout ? (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  ) : (
    <AppRoutes />
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PermissionProvider>
            <EmpresaProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </EmpresaProvider>
          </PermissionProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
