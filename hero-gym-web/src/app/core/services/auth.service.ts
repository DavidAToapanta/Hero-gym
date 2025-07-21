import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

interface LoginResponse {
  access_token: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  login(cedula: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { cedula, password }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Credenciales incorrectas');
          alert('Credenciales incorrectas');
        } else {
          console.error('Error al iniciar sesión', error);
        }
        return throwError(() => error);
      })
    );
  }

  handleLoginSuccess(response: LoginResponse): void {
    if (response && response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      this.router.navigate(['/dashboard']);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

}