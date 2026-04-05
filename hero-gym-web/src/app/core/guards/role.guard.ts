import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const tenantRoles = this.readRoles(route.data['tenantRoles']);

    if (tenantRoles.length > 0) {
      if (this.authService.hasTenantRole(tenantRoles)) {
        return true;
      }

      this.handleForbiddenAccess(state.url, {
        tenantRoles,
      });
      return false;
    }

    if (route.data['clientPortal'] === true) {
      if (this.authService.isClientePortalUser()) {
        return true;
      }

      this.handleForbiddenAccess(state.url, {
        clientPortal: true,
      });
      return false;
    }

    const legacyRoles = this.readRoles(route.data['roles']);

    if (legacyRoles.length > 0) {
      if (this.authService.hasRole(legacyRoles)) {
        return true;
      }

      this.handleForbiddenAccess(state.url, {
        legacyRoles,
      });
      return false;
    }

    return true;
  }

  private handleForbiddenAccess(
    url: string,
    context: {
      tenantRoles?: string[];
      clientPortal?: boolean;
      legacyRoles?: string[];
    },
  ): void {
    console.warn('[RoleGuard] Acceso denegado.', {
      url,
      tenantRole: this.authService.getTenantRole(),
      userRole: this.authService.getUserRole(),
      ...context,
    });

    this.router.navigate([this.authService.getPostLoginRoute()], { replaceUrl: true });
  }

  private readRoles(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (role): role is string => typeof role === 'string' && role.trim() !== '',
    );
  }
}
