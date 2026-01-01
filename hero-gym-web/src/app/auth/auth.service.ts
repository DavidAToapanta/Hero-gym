import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = 'http://localhost:3000/auth/login';
  private apiUrl = 'http://localhost:3000'; // <- para asistencia

  constructor(private http: HttpClient, private router: Router) {}

  login(cedula: string, password: string): Observable<any> {
    return this.http.post<{ access_token: string }>(this.loginUrl, { cedula, password })
      .pipe(
        tap(res => {
          this.handleLoginSuccess(res);
        })
      );
  }

  /**
   * Guarda el token, registra asistencia si es cliente y redirige
   */
  handleLoginSuccess(response: { access_token: string }): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('ultimoAcceso', new Date().toISOString());

    // Decodificar payload del token
    const token = response.access_token;
    const payload = JSON.parse(atob(token.split('.')[1]));

    const rol = payload.rol;
    const clienteId = payload.clienteId;

    console.log('Rol:', rol);
    console.log('Cliente ID:', clienteId);

    // ⭐ ASISTENCIA AUTOMÁTICA ⭐
    if (rol === 'CLIENTE' && clienteId) {
      this.http.post(`${this.apiUrl}/asistencia/registrar/${clienteId}`, {})
        .subscribe({
          next: () => console.log('📌 Asistencia registrada automáticamente'),
          error: (err) => console.error('❌ Error registrando asistencia:', err)
        });
    }

    // 🔀 Redirecciones según rol
    if (rol === 'CLIENTE') {
      this.router.navigate(['/cliente'], { replaceUrl: true });
    } else {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/dashboard'], { replaceUrl: true })
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol || null;
    } catch {
      return null;
    }
  }

  hasRole(allowedRoles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? allowedRoles.includes(userRole) : false;
  }
}
