import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Factura {
  id: number;
  numero: string;
  clientePlanId: number;
  subtotal: number;
  iva: number;
  total: number;
  totalPagado: number;
  saldo: number;
  estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
  estadoDevolucion?: 'PENDIENTE' | 'PARCIAL' | 'COMPLETADO' | 'NO_APLICA';
  fechaEmision: string;
  devolucionPendiente: number;
  devolucionDevueltaAcumulada: number;
  clientePlan: {
    cliente: {
      usuario: {
        nombres: string;
        apellidos: string;
        cedula?: string;
      };
    };
    plan: {
      nombre: string;
      precio: number;
    };
  };
}

export interface DevolucionFacturaResponse {
  facturaId: number;
  cambioPlanId: number;
  devolucionPendiente: number;
  devolucionDevueltaAcumulada: number;
  estadoDevolucion: 'PENDIENTE' | 'PARCIAL' | 'COMPLETADO' | 'NO_APLICA';
}

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) {}

  findAll(
    filters?: {
      estado?: string;
      clienteId?: number;
      cedula?: string;
      desde?: string;
      hasta?: string;
    },
    page: number = 1,
    limit: number = 10
  ): Observable<{ data: Factura[]; meta: any }> {
    let params = new HttpParams();
    if (filters) {
      if (filters.estado) params = params.set('estado', filters.estado);
      if (filters.clienteId) params = params.set('clienteId', filters.clienteId.toString());
      if (filters.cedula) params = params.set('cedula', filters.cedula);
      if (filters.desde) params = params.set('desde', filters.desde);
      if (filters.hasta) params = params.set('hasta', filters.hasta);
    }
    
    // Pagination params
    params = params.set('page', page.toString());
    params = params.set('limit', limit.toString());

    return this.http.get<{ data: Factura[]; meta: any }>(this.apiUrl, { params });
  }

  getResumen(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/resumen`);
  }

  findOne(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.apiUrl}/${id}`);
  }

  devolver(
    facturaId: number,
    monto: number,
    motivo?: string,
  ): Observable<DevolucionFacturaResponse> {
    const payload: { monto: number; motivo?: string } = { monto };

    if (motivo?.trim()) {
      payload.motivo = motivo.trim();
    }

    return this.http.post<DevolucionFacturaResponse>(
      `${this.apiUrl}/${facturaId}/devolver`,
      payload,
    );
  }
}
