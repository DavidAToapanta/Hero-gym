import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './cliente-layout.component.html',
  styleUrl: './cliente-layout.component.css',
})
export class ClienteLayoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true});
  }
}
