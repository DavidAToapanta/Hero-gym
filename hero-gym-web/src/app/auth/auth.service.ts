// src/app/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Envía usuario y contraseña al backend.
   * Guarda el token si la respuesta es exitosa.
   */
  login(cedula: string, password: string): Observable<any> {
    return this.http.post<{ access_token: string }>(this.apiUrl, { cedula, password })
      .pipe(
        tap(res => {
          this.handleLoginSuccess(res); // 👈 Redirección
        })
      );
  }

  /**
   * Guarda el token y redirige al dashboard
   */
  handleLoginSuccess(response: { access_token: string }): void {
    localStorage.setItem('access_token', response.access_token);
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
  
  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/dashboard'], { replaceUrl: true})
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
      return payload.role || null;
    } catch (e) {
      return null;
    }
  }
}
