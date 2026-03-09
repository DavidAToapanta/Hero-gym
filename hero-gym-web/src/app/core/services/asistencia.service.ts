import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/asistencia`;

  constructor(private http: HttpClient) {}

  registrarAsistencia(clienteId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/registrar/${clienteId}`,
      {}
    );
  }

  getHistorial(clienteId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/historial/${clienteId}`
    );
  }

  getTodas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getEstadisticas(clienteId: number): Observable<AsistenciaStats> {
    return this.http.get<AsistenciaStats>(
      `${this.apiUrl}/estadisticas/${clienteId}`
    );
  }
}
