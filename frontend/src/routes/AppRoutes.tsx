import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from '../components/Auth/PrivateRoute';
import { Login } from '../pages/Auth/Login/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { ListarMDFe } from '../pages/MDFe/ListarMDFe/ListarMDFe';
import { FormularioMDFe } from '../pages/MDFe/FormularioMDFe/FormularioMDFe';
import { DetalhesMDFe } from '../pages/MDFe/DetalhesMDFe/DetalhesMDFe';
import { ListarVeiculos } from '../pages/Veiculos/ListarVeiculos/ListarVeiculos';
import { ListarReboques } from '../pages/Reboques/ListarReboques/ListarReboques';
import { ListarCondutores } from '../pages/Condutores/ListarCondutores/ListarCondutores';
import { ListarContratantes } from '../pages/Contratantes/ListarContratantes/ListarContratantes';
import { ListarSeguradoras } from '../pages/Seguradoras/ListarSeguradoras/ListarSeguradoras';
import { ListarMunicipios } from '../pages/Municipios/ListarMunicipios/ListarMunicipios';
import { Usuarios } from '../pages/Admin/Usuarios';
import { Cargos } from '../pages/Admin/Cargos/Cargos';
import { RelatorioManutencao, RelatorioFinanceiroViagens } from '../pages/Relatorios';
import { ListarFornecedores } from '../pages/Fornecedores/ListarFornecedores/ListarFornecedores';
import { FornecedorForm } from '../pages/Fornecedores/FornecedorForm/FornecedorForm';
import { ListarManutencoes } from '../pages/Manutencoes/ListarManutencoes/ListarManutencoes';
import { FormManutencao } from '../pages/Manutencoes/FormManutencao';
import { FormViagem } from '../pages/Viagens/FormViagem';
import { ConfiguracaoEmitente } from '../pages/Configuracoes/Emitente/ConfiguracaoEmitente';
import { PermissionGuard } from '../components/Auth/PermissionGuard';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas de autenticação */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas */}
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      {/* MDFe */}
      <Route path="/mdfes" element={
        <PrivateRoute>
          <ListarMDFe />
        </PrivateRoute>
      } />
      <Route path="/mdfes/novo" element={
        <PrivateRoute>
          <FormularioMDFe />
        </PrivateRoute>
      } />
      <Route path="/mdfes/editar/:id" element={
        <PrivateRoute>
          <FormularioMDFe />
        </PrivateRoute>
      } />
      <Route path="/mdfes/visualizar/:id" element={
        <PrivateRoute>
          <DetalhesMDFe />
        </PrivateRoute>
      } />

      {/* Outras entidades - apenas listagem, CRUD via modal */}
      <Route path="/veiculos" element={
        <PrivateRoute>
          <ListarVeiculos />
        </PrivateRoute>
      } />
      <Route path="/reboques" element={
        <PrivateRoute>
          <ListarReboques />
        </PrivateRoute>
      } />
      <Route path="/condutores" element={
        <PrivateRoute>
          <ListarCondutores />
        </PrivateRoute>
      } />
      <Route path="/contratantes" element={
        <PrivateRoute>
          <ListarContratantes />
        </PrivateRoute>
      } />
      <Route path="/seguradoras" element={
        <PrivateRoute>
          <ListarSeguradoras />
        </PrivateRoute>
      } />
      <Route path="/municipios" element={
        <PrivateRoute>
          <ListarMunicipios />
        </PrivateRoute>
      } />

      {/* Administração */}
      <Route path="/admin/usuarios" element={
        <PrivateRoute>
          <Usuarios />
        </PrivateRoute>
      } />
      <Route path="/admin/cargos" element={
        <PrivateRoute>
          <Cargos />
        </PrivateRoute>
      } />
      <Route path="/configuracoes/emitente" element={
        <PrivateRoute>
          <PermissionGuard
            permission="emitente.configurar"
            fallback={<div className="p-6 text-center text-muted-foreground">Você não possui permissão para acessar esta página.</div>}
          >
            <ConfiguracaoEmitente />
          </PermissionGuard>
        </PrivateRoute>
      } />

      {/* Fornecedores */}
      <Route path="/fornecedores" element={
        <PrivateRoute>
          <ListarFornecedores />
        </PrivateRoute>
      } />
      <Route path="/manutencoes" element={
        <PrivateRoute>
          <ListarManutencoes />
        </PrivateRoute>
      } />
      <Route path="/manutencoes/nova" element={
        <PrivateRoute>
          <FormManutencao />
        </PrivateRoute>
      } />
      <Route path="/manutencoes/editar/:id" element={
        <PrivateRoute>
          <FormManutencao />
        </PrivateRoute>
      } />
      <Route path="/fornecedores/novo" element={
        <PrivateRoute>
          <FornecedorForm />
        </PrivateRoute>
      } />
      <Route path="/fornecedores/:id/editar" element={
        <PrivateRoute>
          <FornecedorForm />
        </PrivateRoute>
      } />

      {/* Relatórios */}
      <Route path="/relatorios/manutencao" element={
        <PrivateRoute>
          <RelatorioManutencao />
        </PrivateRoute>
      } />
      <Route path="/relatorios/despesas" element={
        <PrivateRoute>
          <RelatorioFinanceiroViagens />
        </PrivateRoute>
      } />

      {/* Viagens */}
      <Route path="/viagens/nova" element={
        <PrivateRoute>
          <FormViagem />
        </PrivateRoute>
      } />
      <Route path="/viagens/editar/:id" element={
        <PrivateRoute>
          <FormViagem />
        </PrivateRoute>
      } />
    </Routes>
  );
}
