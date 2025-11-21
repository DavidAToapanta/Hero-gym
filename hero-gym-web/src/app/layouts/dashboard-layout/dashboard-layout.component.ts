import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent {
  userName = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ){
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.userName || '';
      } catch {}
    }
  }
  
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true});
  }

  hasRole(roles: string[]): boolean {
    const hasPermission = this.authService.hasRole(roles);
    // console.log(`DashboardLayout: Checking roles ${roles}, Result: ${hasPermission}`);
    return hasPermission;
  }
  
}
