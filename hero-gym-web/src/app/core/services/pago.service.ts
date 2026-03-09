import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface Pago {
  id: number;
  monto: number;
  fecha: string;
  clientePlan: {
    plan: { nombre: string };
    cliente: {
      usuario: { nombres: string; apellidos: string };
    };
  };
}

interface IngresosMesResponse {
  ingresos: number | string;
}

@Injectable({ providedIn: 'root' })
export class PagoService {
  private apiUrl = `${environment.apiUrl}/pago`;
  private clientePlanUrl = `${environment.apiUrl}/cliente-plan`;
  private planUrl = `${environment.apiUrl}/plan`;

  constructor(private http: HttpClient) {}

  getPagos(page = 1, limit = 10, searchTerm = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
      
    if (searchTerm) {
        params = params.set('search', searchTerm);
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  createPago(data: { clientePlanId: number; monto: number; fecha: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  getClientePlanes(): Observable<any[]> {
    return this.http.get<any[]>(this.clientePlanUrl);
  }

  getPlanes(page = 1, limit = 100): Observable<any[]> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<any>(this.planUrl, { params }).pipe(
      map(response => response.data || [])
    );
  }

  createClientePlan(data: {
    clienteId: number;
    planId: number;
    fechaInicio: string; // ISO yyyy-MM-dd
    fechaFin: string;    // ISO yyyy-MM-dd
    diaPago: number;
    activado: boolean;
  }): Observable<any> {
    return this.http.post<any>(this.clientePlanUrl, data);
  }

  getPlanById(id: number): Observable<any> {
    return this.http.get<any>(`${this.planUrl}/${id}`);
  }

  getIngresosDelMes() {
    return this.http.get<IngresosMesResponse>(`${this.apiUrl}/Ingresos-mes`).pipe(
      map((res) => Number((res as any)?.ingresos ?? res))
    );
  }

  deletePago(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
