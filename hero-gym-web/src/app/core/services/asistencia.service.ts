import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AsistenciaStats {
  tienePlanActivo: boolean;
  diasAsistidos?: number;
  diasTotales?: number;
  porcentajeAsistencia?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  nombrePlan?: string;
  precioPlan?: number;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AsistenciaService {
  private apiUrl = 'http://localhost:3000'; // cambia si usas env

  constructor(private http: HttpClient) {}

  registrarAsistencia(clienteId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/asistencia/registrar/${clienteId}`,
      {}
    );
  }

  getHistorial(clienteId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/asistencia/historial/${clienteId}`
    );
  }

  getTodas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/asistencia`);
  }

  getEstadisticas(clienteId: number): Observable<AsistenciaStats> {
    return this.http.get<AsistenciaStats>(
      `${this.apiUrl}/asistencia/estadisticas/${clienteId}`
    );
  }
}
