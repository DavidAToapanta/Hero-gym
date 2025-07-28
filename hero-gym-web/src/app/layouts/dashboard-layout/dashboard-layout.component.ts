import { Component } from '@angular/core';
import { AuthRoutingModule } from "../../auth/auth-routing.module";
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [AuthRoutingModule, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ){}
  
  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true});
  }
  
}
