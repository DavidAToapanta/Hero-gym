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
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnDestroy {
  @ViewChild('settingsMenuContainer') settingsMenuContainer?: ElementRef<HTMLElement>;

  userName = '';
  roleLabel = 'Usuario';
  isAdmin = false;
  showSettingsMenu = false;
  showMobileMenu = false;

  private readonly routerEventsSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.userName || '';
        this.roleLabel = this.mapRole(payload.rol);
      } catch {}
    }
    this.isAdmin = this.authService.hasRole(['ADMIN']);

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

  goToClientesAnulados(): void {
    this.closeSettingsMenu();
    this.closeMobileMenu();
    this.router.navigate(['/dashboard/clientes-anulados']);
  }

  logout() {
    this.closeSettingsMenu();
    this.closeMobileMenu();
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
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
