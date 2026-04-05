import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface ClientePlanPayload {
  clienteId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  activado: boolean;
}

export interface CambiarPlanDto {
  nuevoPlanId: number;
  fechaInicio: string;
  fechaFin: string;
  motivo?: string;
}

export interface CambioPlanResponse {
  mensaje: string;
  planAnterior: {
    id: number;
    nombre: string;
    precio: number;
  };
  planNuevo: {
    id: number;
    nombre: string;
    precio: number;
  };
  financiero: {
    creditoTotal: number;
    creditoAplicado: number;
    devolucionPendiente: number;
    faltante: number;
    precioNuevoPlan: number;
  };
}

export interface QuitarPlanResponse {
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientePlanService {
  private apiUrl = `${environment.apiUrl}/cliente-plan`;

  constructor(private http: HttpClient) {}

  getClientesActivos(): Observable<{ activos: number }> {
    return this.http.get<{ activos: number }>(`${this.apiUrl}/activos`);
  }

  cambiarPlan(clientePlanId: number, dto: CambiarPlanDto): Observable<CambioPlanResponse> {
    return this.http.post<CambioPlanResponse>(
      `${this.apiUrl}/${clientePlanId}/cambiar-plan`,
      dto
    );
  }

  quitarPlan(clientePlanId: number): Observable<QuitarPlanResponse> {
    return this.http.delete<QuitarPlanResponse>(`${this.apiUrl}/${clientePlanId}`);
  }
}
