// Teste de modificação - App.tsx
import { BrowserRouter, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { EmpresaProvider } from './contexts/EmpresaContext';
import { EmitenteProvider } from './contexts/EmitenteContext';
import { ToastProvider } from './contexts/ToastContext';
import { MainLayout } from './components/Layout/MainLayout/MainLayout';
import { AppRoutes } from './routes';
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
        <ToastProvider>
          <AuthProvider>
            <PermissionProvider>
              <EmpresaProvider>
                <EmitenteProvider>
                  <BrowserRouter>
                    <AppContent />
                  </BrowserRouter>
                </EmitenteProvider>
              </EmpresaProvider>
            </PermissionProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
