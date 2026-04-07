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

export type AsistenciaHistorialItem = Record<string, unknown>;

export interface RegistrarAsistenciaHistoricaPayload {
  clienteId: number;
  fecha: string;
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

  registrarAsistenciaHistorica(payload: RegistrarAsistenciaHistoricaPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/historica`, payload);
  }

  marcarMiAsistencia(usuarioId: number): Observable<any> {
    return this.http.post(this.apiUrl, { usuarioId });
  }

  getHistorial(clienteId: number): Observable<AsistenciaHistorialItem[]> {
    return this.http.get<AsistenciaHistorialItem[]>(
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

  getMiEstadisticas(): Observable<AsistenciaStats> {
    return this.http.get<AsistenciaStats>(
      `${this.apiUrl}/mi-estadisticas`
    );
  }

  getMiHistorial(): Observable<AsistenciaHistorialItem[]> {
    return this.http.get<AsistenciaHistorialItem[]>(
      `${this.apiUrl}/mi-historial`
    );
  }
}
