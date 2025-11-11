import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private apiUrl = 'http://localhost:3000/pago';

  constructor(private http: HttpClient) {}

  getPagos(searchTerm = ''): Observable<Pago[]> {
    const params = searchTerm ? new HttpParams().set('search', searchTerm) : undefined;
    return this.http.get<Pago[]>(this.apiUrl, { params });
  }

  createPago(data: { clientePlanId: number; monto: number; fecha: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  getClientePlanes(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/cliente-plan');
  }

  getPlanes(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/plan');
  }

  createClientePlan(data: {
    clienteId: number;
    planId: number;
    fechaInicio: string; // ISO yyyy-MM-dd
    fechaFin: string;    // ISO yyyy-MM-dd
    diaPago: number;
    activado: boolean;
  }): Observable<any> {
    return this.http.post<any>('http://localhost:3000/cliente-plan', data);
  }

  getPlanById(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/plan/${id}`);
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
