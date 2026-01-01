import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent {
  userName = '';
  roleLabel = 'Usuario';
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ){
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.userName || '';
        this.roleLabel = this.mapRole(payload.rol);
      } catch {}
    }
    this.isAdmin = this.authService.hasRole(['ADMIN']);
  }
  
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true});
  }

  private mapRole(roleCode?: string | null): string {
    switch (roleCode) {
      case 'ADMIN':
        return 'Administrador';
      case 'RECEPCIONISTA':
        return 'Recepcionista';
      case 'ENTRENADOR':
        return 'Entrenador';
      default:
        return 'Usuario';
    }
  }
  
}
