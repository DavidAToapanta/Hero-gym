import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { PagosComponent } from './pages/pagos/pagos.component';
import { PlanesComponent } from './pages/planes/planes.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Este es el dashboard simple
  { path: 'dashboard', 
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'clientes', component: ClientesComponent},
      { path: 'productos', component: ProductosComponent},
      { path: 'pagos', component: PagosComponent},
      { path: 'planes', component: PlanesComponent},
      { path: 'usuarios', component: UsuariosComponent}


    ]
  },

  { path: '**', redirectTo: 'login' }

];
