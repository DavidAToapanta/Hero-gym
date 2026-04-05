import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterOwnerComponent } from './auth/register-owner/register-owner.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { AdministracionComponent } from './pages/administracion/administracion.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ClientesAnuladosComponent } from './pages/clientes/clientes-anulados/clientes-anulados.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { PagosComponent } from './pages/pagos/pagos.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

const STAFF_TENANT_ROLES = ['OWNER', 'ADMIN', 'RECEPCIONISTA', 'ENTRENADOR'];
const CLIENTES_TENANT_ROLES = ['OWNER', 'ADMIN', 'RECEPCIONISTA', 'ENTRENADOR'];
const CLIENTES_ANULADOS_TENANT_ROLES = ['OWNER', 'ADMIN', 'RECEPCIONISTA'];
const ADMIN_TENANT_ROLES = ['OWNER', 'ADMIN'];
const CAJA_TENANT_ROLES = ['OWNER', 'ADMIN', 'RECEPCIONISTA'];

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterOwnerComponent },
  { path: 'register-owner', redirectTo: 'registro', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login', redirectTo: '/login', pathMatch: 'full' },
      { path: 'registro', redirectTo: '/registro', pathMatch: 'full' },
      { path: 'register-owner', redirectTo: '/registro', pathMatch: 'full' },
    ],
  },
  {
    path: 'cliente',
    loadChildren: () => import('./pages/clientes/cliente.routes').then((m) => m.CLIENTE_ROUTES),
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { tenantRoles: STAFF_TENANT_ROLES },
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'clientes',
        component: ClientesComponent,
        canActivate: [RoleGuard],
        data: { tenantRoles: CLIENTES_TENANT_ROLES },
      },
      {
        path: 'clientes-anulados',
        component: ClientesAnuladosComponent,
        canActivate: [RoleGuard],
        data: { tenantRoles: CLIENTES_ANULADOS_TENANT_ROLES },
      },
      {
        path: 'productos',
        component: ProductosComponent,
        canActivate: [RoleGuard],
        data: { tenantRoles: ADMIN_TENANT_ROLES },
      },
      {
        path: 'pagos',
        component: PagosComponent,
        canActivate: [RoleGuard],
        data: { tenantRoles: CAJA_TENANT_ROLES },
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [RoleGuard],
        data: { tenantRoles: ADMIN_TENANT_ROLES },
      },
      {
        path: 'administracion',
        component: AdministracionComponent,
        canActivate: [RoleGuard],
        data: { tenantRoles: ADMIN_TENANT_ROLES },
      },
      {
        path: 'facturas',
        loadComponent: () =>
          import('./pages/facturas/facturas.component').then((m) => m.FacturasComponent),
        canActivate: [RoleGuard],
        data: { tenantRoles: CAJA_TENANT_ROLES },
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
