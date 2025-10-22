import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PrivateRoute } from '../components/Auth/PrivateRoute';
import { PermissionGuard } from '../components/Auth/PermissionGuard';
import { Login } from '../pages/Auth/Login/Login';
import { Dashboard } from '../pages/Dashboard';
import { ListarVeiculos } from '../pages/Veiculos/ListarVeiculos/ListarVeiculos';
import { FormVeiculo } from '../pages/Veiculos/FormVeiculo/FormVeiculo';
import { ListarReboques } from '../pages/Reboques/ListarReboques/ListarReboques';
import { FormReboque } from '../pages/Reboques/FormReboque/FormReboque';
import { ListarCondutores } from '../pages/Condutores/ListarCondutores/ListarCondutores';
import { FormCondutor } from '../pages/Condutores/FormCondutor/FormCondutor';
import { ListarContratantes } from '../pages/Contratantes/ListarContratantes/ListarContratantes';
import { FormContratante } from '../pages/Contratantes/FormContratante/FormContratante';
import { ListarSeguradoras } from '../pages/Seguradoras/ListarSeguradoras/ListarSeguradoras';
import { FormSeguradora } from '../pages/Seguradoras/FormSeguradora/FormSeguradora';
import { ListarMunicipios } from '../pages/Municipios/ListarMunicipios/ListarMunicipios';
import { FormMunicipio } from '../pages/Municipios/FormMunicipio/FormMunicipio';
import { Usuarios } from '../pages/Admin/Usuarios';
import { FormUsuario } from '../pages/Admin/Usuarios/FormUsuario/FormUsuario';
import { Cargos } from '../pages/Admin/Cargos/Cargos';
import { FormPermissoes } from '../pages/Admin/Cargos/FormPermissoes/FormPermissoes';
import { ListarManutencoes, FormManutencao } from '../pages/Manutencoes';
import { ListarViagens } from '../pages/Viagens/ListarViagens/ListarViagens';
import { ListarFornecedores } from '../pages/Fornecedores/ListarFornecedores/ListarFornecedores';
import { FornecedorForm } from '../pages/Fornecedores/FornecedorForm/FornecedorForm';
import { FormViagem } from '../pages/Viagens/FormViagem/FormViagem';
import { ConfiguracaoEmitente } from '../pages/Configuracoes/Emitente/ConfiguracaoEmitente';
import { MdfeVisaoGeral } from '../pages/Documentos';
import { FormularioMDFe } from '../pages/MDFe/FormularioMDFe/FormularioMDFe';

const withPermission = (element: ReactElement, permission?: string) =>
  permission ? (
    <PermissionGuard permission={permission}>{element}</PermissionGuard>
  ) : (
    element
  );

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
        <Route path="/veiculos" element={withPermission(<ListarVeiculos />, 'veiculos.listar')} />
        <Route path="/veiculos/novo" element={withPermission(<FormVeiculo />, 'veiculos.criar')} />
        <Route path="/veiculos/:id/editar" element={withPermission(<FormVeiculo />, 'veiculos.editar')} />

        <Route path="/reboques" element={withPermission(<ListarReboques />, 'reboques.listar')} />
        <Route path="/reboques/novo" element={withPermission(<FormReboque />, 'reboques.criar')} />
        <Route path="/reboques/:id/editar" element={withPermission(<FormReboque />, 'reboques.editar')} />

        <Route path="/condutores" element={withPermission(<ListarCondutores />, 'condutores.listar')} />
        <Route path="/condutores/novo" element={withPermission(<FormCondutor />, 'condutores.criar')} />
        <Route path="/condutores/:id/editar" element={withPermission(<FormCondutor />, 'condutores.editar')} />

        <Route path="/contratantes" element={withPermission(<ListarContratantes />, 'contratantes.listar')} />
        <Route path="/contratantes/novo" element={withPermission(<FormContratante />, 'contratantes.criar')} />
        <Route path="/contratantes/:id/editar" element={withPermission(<FormContratante />, 'contratantes.editar')} />

        <Route path="/seguradoras" element={withPermission(<ListarSeguradoras />, 'seguradoras.listar')} />
        <Route path="/seguradoras/novo" element={withPermission(<FormSeguradora />, 'seguradoras.criar')} />
        <Route path="/seguradoras/:id/editar" element={withPermission(<FormSeguradora />, 'seguradoras.editar')} />

        <Route path="/municipios" element={withPermission(<ListarMunicipios />, 'municipios.listar')} />
        <Route path="/municipios/novo" element={withPermission(<FormMunicipio />, 'municipios.criar')} />
        <Route path="/municipios/:id/editar" element={withPermission(<FormMunicipio />, 'municipios.editar')} />

        {/* Documentos fiscais */}
        <Route path="/documentos/mdfe" element={withPermission(<MdfeVisaoGeral />, 'mdfe.listar')} />
        <Route path="/mdfe/novo" element={withPermission(<FormularioMDFe />, 'mdfe.criar')} />
        <Route path="/mdfe/:id/editar" element={withPermission(<FormularioMDFe />, 'mdfe.editar')} />

        {/* Administração */}
        <Route path="/admin/usuarios" element={withPermission(<Usuarios />, 'usuarios.listar')} />
        <Route path="/admin/usuarios/novo" element={withPermission(<FormUsuario />, 'usuarios.criar')} />
        <Route path="/admin/usuarios/:id" element={withPermission(<FormUsuario />, 'usuarios.visualizar')} />
        <Route path="/admin/usuarios/:id/editar" element={withPermission(<FormUsuario />, 'usuarios.editar')} />

        <Route path="/admin/cargos" element={withPermission(<Cargos />, 'cargos.listar')} />
        <Route path="/admin/cargos/:cargoId/permissoes" element={withPermission(<FormPermissoes />, 'cargos.gerenciar_permissoes')} />
        <Route path="/configuracoes/emitente" element={withPermission(<ConfiguracaoEmitente />, 'emitente.configurar')} />

        {/* Fornecedores */}
        <Route path="/fornecedores" element={withPermission(<ListarFornecedores />, 'fornecedores.listar')} />
        <Route path="/fornecedores/novo" element={withPermission(<FornecedorForm />, 'fornecedores.criar')} />
        <Route path="/fornecedores/:id/editar" element={withPermission(<FornecedorForm />, 'fornecedores.editar')} />

        {/* Gestão Operacional */}
        <Route path="/manutencoes" element={withPermission(<ListarManutencoes />, 'relatorios.manutencao')} />
        <Route path="/manutencoes/novo" element={withPermission(<FormManutencao />, 'relatorios.manutencao')} />
        <Route path="/manutencoes/:id/editar" element={withPermission(<FormManutencao />, 'relatorios.manutencao')} />

        <Route path="/viagens" element={withPermission(<ListarViagens />, 'relatorios.despesas')} />

        {/* Viagens */}
        <Route path="/viagens/nova" element={withPermission(<FormViagem />, 'viagens.criar')} />
        <Route path="/viagens/editar/:id" element={withPermission(<FormViagem />, 'viagens.editar')} />

        {/* Redirecionamentos legados */}
        <Route path="/relatorios/manutencoes-veiculos" element={<Navigate to="/manutencoes" replace />} />
        <Route path="/relatorios/viagens" element={<Navigate to="/viagens" replace />} />
      </Route>

      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
