import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css'],
})
export class DashboardLayoutComponent implements OnDestroy {
  @ViewChild('settingsMenuContainer') settingsMenuContainer?: ElementRef<HTMLElement>;

  userName = '';
  roleLabel = 'Usuario';
  tenantDisplayName = 'Hero Gym';
  isOwner = false;
  isAdminLike = false;
  canManageClientes = false;
  canViewClientesAnulados = false;
  canManageProductos = false;
  canManagePagos = false;
  canManageFacturas = false;
  canManageAdministracion = false;
  showSettingsMenu = false;
  showMobileMenu = false;

  private readonly routerEventsSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.setAccessState();

    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.closeSettingsMenu();
        this.closeMobileMenu();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
  }

  toggleSettingsMenu(): void {
    this.showMobileMenu = false;
    this.showSettingsMenu = !this.showSettingsMenu;
  }

  closeSettingsMenu(): void {
    this.showSettingsMenu = false;
  }

  toggleMobileMenu(): void {
    this.closeSettingsMenu();
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  logout(): void {
    this.closeSettingsMenu();
    this.closeMobileMenu();
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showSettingsMenu) {
      return;
    }

    const target = event.target as Node | null;
    const menuContainer = this.settingsMenuContainer?.nativeElement;

    if (target && menuContainer && !menuContainer.contains(target)) {
      this.closeSettingsMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeSettingsMenu();
    this.closeMobileMenu();
  }

  private setAccessState(): void {
    const decodedToken = this.authService.getDecodedToken();

    this.userName = decodedToken?.userName ?? '';
    this.tenantDisplayName = this.authService.getTenantDisplayName() ?? 'Hero Gym';
    this.roleLabel = this.mapRoleLabel(
      this.authService.getTenantRole(),
      this.authService.getUserRole(),
    );

    this.isOwner = this.authService.isOwner();
    this.isAdminLike = this.authService.hasTenantRole(['OWNER', 'ADMIN']);
    this.canManageClientes = this.authService.hasTenantRole([
      'OWNER',
      'ADMIN',
      'RECEPCIONISTA',
      'ENTRENADOR',
    ]);
    this.canViewClientesAnulados = this.authService.hasTenantRole([
      'OWNER',
      'ADMIN',
      'RECEPCIONISTA',
    ]);
    this.canManageProductos = this.authService.hasTenantRole(['OWNER', 'ADMIN']);
    this.canManagePagos = this.authService.hasTenantRole(['OWNER', 'ADMIN', 'RECEPCIONISTA']);
    this.canManageFacturas = this.authService.hasTenantRole(['OWNER', 'ADMIN', 'RECEPCIONISTA']);
    this.canManageAdministracion = this.authService.hasTenantRole(['OWNER', 'ADMIN']);
  }

  private mapRoleLabel(tenantRole?: string | null, legacyRole?: string | null): string {
    const roleCode = tenantRole ?? legacyRole;

    switch (roleCode) {
      case 'OWNER':
        return 'Owner';
      case 'ADMIN':
        return 'Administrador';
      case 'RECEPCIONISTA':
        return 'Recepcionista';
      case 'ENTRENADOR':
        return 'Entrenador';
      case 'CLIENTE':
        return 'Cliente';
      default:
        return 'Usuario';
    }
  }
}
