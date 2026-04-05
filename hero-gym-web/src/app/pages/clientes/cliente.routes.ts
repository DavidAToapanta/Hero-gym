import { Routes } from '@angular/router';

import { RoleGuard } from '../../core/guards/role.guard';
import { ClienteLayoutComponent } from '../../layouts/cliente-layout/cliente-layout.component';
import { ClienteDashboardComponent } from './cliente-dashboard/cliente-dashboard.component';

export const CLIENTE_ROUTES: Routes = [
  {
    path: '',
    component: ClienteLayoutComponent,
    canActivate: [RoleGuard],
    data: { clientPortal: true },
    children: [{ path: '', component: ClienteDashboardComponent }],
  },
];
