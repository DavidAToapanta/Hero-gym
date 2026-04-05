import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './cliente-layout.component.html',
  styleUrl: './cliente-layout.component.css',
})
export class ClienteLayoutComponent implements OnInit {
  tenantDisplayName = 'Hero Gym';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.tenantDisplayName = this.authService.getTenantDisplayName() ?? 'Hero Gym';
  }

  logout() {
    this.authService.logout();
  }
}
