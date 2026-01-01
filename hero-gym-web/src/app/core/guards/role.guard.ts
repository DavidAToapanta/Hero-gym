import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const userRole = this.authService.getUserRole();

    if (!userRole || !expectedRoles.includes(userRole)) {
      // Si no tiene rol o no está en la lista permitida, redirigir
      console.warn('🚫 RoleGuard: Acceso denegado. Rol:', userRole, 'Roles permitidos:', expectedRoles);
      
      if (this.authService.isAuthenticated()) {
        // Ya está logueado pero no tiene permiso
        // Redirigir según su rol
        if (userRole === 'CLIENTE') {
          this.router.navigate(['/cliente']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }
    return true;
  }
}
