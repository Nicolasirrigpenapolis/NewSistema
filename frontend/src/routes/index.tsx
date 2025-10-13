import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PrivateRoute } from '../components/Auth/PrivateRoute';
import { Login } from '../pages/Auth/Login/Login';
import { Dashboard } from '../pages/Dashboard';
import { ListarVeiculos } from '../pages/Veiculos/ListarVeiculos/ListarVeiculos';
import { FormVeiculo } from '../pages/Veiculos/FormVeiculo/FormVeiculo';
import { ListarReboques } from '../pages/Reboques/ListarReboques/ListarReboques';
import { ListarCondutores } from '../pages/Condutores/ListarCondutores/ListarCondutores';
import { ListarContratantes } from '../pages/Contratantes/ListarContratantes/ListarContratantes';
import { ListarSeguradoras } from '../pages/Seguradoras/ListarSeguradoras/ListarSeguradoras';
import { FormSeguradora } from '../pages/Seguradoras/FormSeguradora/FormSeguradora';
import { ListarMunicipios } from '../pages/Municipios/ListarMunicipios/ListarMunicipios';
import { Usuarios } from '../pages/Admin/Usuarios';
import { FormUsuario } from '../pages/Admin/Usuarios/FormUsuario/FormUsuario';
import { Cargos } from '../pages/Admin/Cargos/Cargos';
import { RelatorioManutencao, RelatorioFinanceiroViagens } from '../pages/Relatorios';
import { ListarFornecedores } from '../pages/Fornecedores/ListarFornecedores/ListarFornecedores';
import { FornecedorForm } from '../pages/Fornecedores/FornecedorForm/FornecedorForm';
import { ListarManutencoes } from '../pages/Manutencoes/ListarManutencoes/ListarManutencoes';
import { FormManutencao } from '../pages/Manutencoes/FormManutencao';
import { FormViagem } from '../pages/Viagens/FormViagem';
import { ConfiguracaoEmitente } from '../pages/Configuracoes/Emitente/ConfiguracaoEmitente';
import { PermissionGuard } from '../components/Auth/PermissionGuard';

import { FormContratante } from '../pages/Contratantes/FormContratante/FormContratante';
import { FormMunicipio } from '../pages/Municipios/FormMunicipio/FormMunicipio';
import { FormReboque } from '../pages/Reboques/FormReboque/FormReboque';
import { FormCondutor } from '../pages/Condutores/FormCondutor/FormCondutor';
export function AppRoutes(): ReactElement {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Operações */}
        <Route path="/veiculos" element={<ListarVeiculos />} />
        <Route path="/veiculos/novo" element={<FormVeiculo />} />
        <Route path="/veiculos/:id/editar" element={<FormVeiculo />} />
        <Route path="/reboques" element={<ListarReboques />} />
        <Route path="/reboques/novo" element={<FormReboque />} />
        <Route path="/reboques/:id/editar" element={<FormReboque />} />
        <Route path="/condutores" element={<ListarCondutores />} />
        <Route path="/condutores/novo" element={<FormCondutor />} />
        <Route path="/condutores/:id/editar" element={<FormCondutor />} />
        <Route path="/contratantes" element={<ListarContratantes />} />
        <Route path="/contratantes/novo" element={<FormContratante />} />
        <Route path="/contratantes/:id/editar" element={<FormContratante />} />
        <Route path="/seguradoras" element={<ListarSeguradoras />} />
        <Route path="/seguradoras/novo" element={<FormSeguradora />} />
        <Route path="/seguradoras/:id/editar" element={<FormSeguradora />} />
        <Route path="/municipios" element={<ListarMunicipios />} />
        <Route path="/municipios/novo" element={<FormMunicipio />} />
        <Route path="/municipios/:id/editar" element={<FormMunicipio />} />

        {/* Administração */}
        <Route path="/admin/usuarios" element={<Usuarios />} />
  <Route path="/admin/usuarios/novo" element={<FormUsuario />} />
  <Route path="/admin/usuarios/:id/editar" element={<FormUsuario />} />
  <Route path="/admin/usuarios/:id" element={<FormUsuario />} />
        <Route path="/admin/cargos" element={<Cargos />} />
        <Route
          path="/configuracoes/emitente"
          element={(
            <PermissionGuard
              permission="emitente.configurar"
              fallback={<div className="p-6 text-center text-muted-foreground">Você não possui permissão para acessar esta página.</div>}
            >
              <ConfiguracaoEmitente />
            </PermissionGuard>
          )}
        />

        {/* Fornecedores */}
        <Route path="/fornecedores" element={<ListarFornecedores />} />
        <Route path="/fornecedores/novo" element={<FornecedorForm />} />
        <Route path="/fornecedores/:id/editar" element={<FornecedorForm />} />

        {/* Manutenções */}
        <Route path="/manutencoes" element={<ListarManutencoes />} />
        <Route path="/manutencoes/nova" element={<FormManutencao />} />
        <Route path="/manutencoes/editar/:id" element={<FormManutencao />} />

        {/* Relatórios */}
        <Route path="/relatorios/manutencao" element={<RelatorioManutencao />} />
        <Route path="/relatorios/despesas" element={<RelatorioFinanceiroViagens />} />

        {/* Viagens */}
        <Route path="/viagens/nova" element={<FormViagem />} />
        <Route path="/viagens/editar/:id" element={<FormViagem />} />
      </Route>

      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
