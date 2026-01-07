import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { PagosComponent } from './pages/pagos/pagos.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { AdministracionComponent } from './pages/administracion/administracion.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Este es el dashboard simple
  {
    path: 'cliente',
    loadChildren: () =>
      import('./pages/clientes/cliente.routes').then(m => m.CLIENTE_ROUTES)
  },
  // Rutas del portal de clientes
  { path: 'dashboard', 
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { 
        path: 'clientes', 
        component: ClientesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA'] }
      },
      { 
        path: 'productos', 
        component: ProductosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      { 
        path: 'pagos', 
        component: PagosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      { 
        path: 'usuarios', 
        component: UsuariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      { 
        path: 'administracion', 
        component: AdministracionComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      { 
        path: 'facturas', 
        loadComponent: () => import('./pages/facturas/facturas.component').then(m => m.FacturasComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },

  { path: '**', redirectTo: 'login' }

];
