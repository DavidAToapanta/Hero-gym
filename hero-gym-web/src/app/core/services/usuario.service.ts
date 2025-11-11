import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioBasico {
  id: number; // id del usuario
  userName: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  rol: 'administrador' | 'entrenador' | 'recepcionista';
}

export interface CrearUsuarioDto {
  userName: string;
  password: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: string;
  rol: 'administrador' | 'entrenador' | 'recepcionista';
  horario?: string;
  sueldo?: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private baseUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) {}

  getUsuarios(rol?: 'administrador' | 'entrenador' | 'recepcionista'): Observable<UsuarioBasico[]> {
    let params = new HttpParams();
    if (rol) params = params.set('rol', rol);
    return this.http.get<UsuarioBasico[]>(this.baseUrl, { params });
  }

  getConteos(): Observable<{ administradores: number; entrenadores: number; recepcionistas: number }>{
    return this.http.get<{ administradores: number; entrenadores: number; recepcionistas: number }>(`${this.baseUrl}/counts`);
  }

  crearUsuario(dto: CrearUsuarioDto): Observable<any> {
    return this.http.post<any>(this.baseUrl, dto);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
