import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface CreateIngresoRapidoPayload {
  concepto: string;
  monto: number;
}

export interface IngresoRapido {
  id: number;
  concepto: string;
  monto: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class IngresosRapidosService {
  private apiUrl = `${environment.apiUrl}/ingresos-rapidos`;

  constructor(private http: HttpClient) {}

  createIngresoRapido(payload: CreateIngresoRapidoPayload): Observable<IngresoRapido> {
    return this.http.post<IngresoRapido>(this.apiUrl, payload);
  }

  getIngresosRapidos(): Observable<IngresoRapido[]> {
    return this.http.get<IngresoRapido[]>(this.apiUrl);
  }

  updateIngresoRapido(id: number, payload: Partial<CreateIngresoRapidoPayload>): Observable<IngresoRapido> {
    return this.http.patch<IngresoRapido>(`${this.apiUrl}/${id}`, payload);
  }

  deleteIngresoRapido(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
