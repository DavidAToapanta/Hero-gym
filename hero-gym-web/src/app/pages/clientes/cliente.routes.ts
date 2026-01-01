import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { ClienteLayoutComponent } from '../../layouts/cliente-layout/cliente-layout.component';
import { ClienteDashboardComponent } from './cliente-dashboard/cliente-dashboard.component';


/**
 * Rutas del portal de clientes
 * Estas rutas se cargan cuando un usuario con rol CLIENTE inicia sesión
 */
export const CLIENTE_ROUTES: Routes = [
  {
    path: '',
    component: ClienteLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: ['CLIENTE'] },
    children: [
      { path: '', component: ClienteDashboardComponent }
    ]
  },
];
