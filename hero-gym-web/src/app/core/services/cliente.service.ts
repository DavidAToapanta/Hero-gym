import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ClientePlanPayload } from './cliente-plan.service';
import { normalizeDateOnly } from '../utils/plan-date.utils';

interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  perPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface RegisterClientePayload {
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: string;
  userName: string;
  email?: string;
  password: string;
  horario: string;
  sexo: string;
  observaciones: string;
  objetivos: string;
  tiempoEntrenar: number;
}

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/cliente`;
  private clientePlanUrl = `${environment.apiUrl}/cliente-plan`;
  private cache = new Map<string, PaginatedResponse<any>>();

  constructor(private http: HttpClient) {}

  getClientes(
    page = 1,
    limit = 10,
    search?: string,
    forceRefresh = false,
  ): Observable<PaginatedResponse<any>> {
    const cacheKey = this.buildCacheKey(page, limit, search, 'active');
    const searchTerm = search?.trim() || '';

    if (forceRefresh) {
      this.cache.delete(cacheKey);
      console.log('[ClienteService] Force refresh - cache eliminado para:', cacheKey);
    } else if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (cached && cached.data !== undefined && cached.meta) {
        console.log('[ClienteService] Retornando desde cache:', cacheKey);
        return of(cached);
      }

      this.cache.delete(cacheKey);
      console.log('[ClienteService] Cache corrupto eliminado:', cacheKey);
    }

    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    console.log('[ClienteService] Haciendo petición HTTP:', {
      page,
      limit,
      search: searchTerm,
      forceRefresh,
    });
    const startTime = Date.now();

    return this.http.get<PaginatedResponse<any>>(this.apiUrl, { params }).pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        console.log(`[ClienteService] Respuesta recibida en ${duration}ms:`, {
          items: response?.data?.length || 0,
          totalItems: response?.meta?.totalItems || 0,
        });

        if (response && response.meta !== undefined) {
          this.cache.set(cacheKey, response);
          console.log('[ClienteService] Respuesta cacheada:', cacheKey);
        }
      }),
    );
  }

  getClientesInactivos(
    page = 1,
    limit = 10,
    search?: string,
    forceRefresh = false,
  ): Observable<PaginatedResponse<any>> {
    const cacheKey = this.buildCacheKey(page, limit, search, 'inactive');
    const searchTerm = search?.trim() || '';

    if (forceRefresh) {
      this.cache.delete(cacheKey);
      console.log('[ClienteService] Force refresh inactivos - cache eliminado para:', cacheKey);
    } else if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (cached && cached.data !== undefined && cached.meta) {
        console.log('[ClienteService] Retornando inactivos desde cache:', cacheKey);
        return of(cached);
      }

      this.cache.delete(cacheKey);
      console.log('[ClienteService] Cache de inactivos corrupto eliminado:', cacheKey);
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('activo', 'false');

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.http.get<PaginatedResponse<any>>(this.apiUrl, { params }).pipe(
      tap((response) => {
        if (response && response.meta !== undefined) {
          this.cache.set(cacheKey, response);
        }
      }),
    );
  }

  createCliente(data: RegisterClientePayload): Observable<unknown> {
    return this.http
      .post<unknown>(`${this.apiUrl}/registro`, data)
      .pipe(tap(() => this.invalidateCache()));
  }

  desactivarCliente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(tap(() => this.invalidateCache()));
  }

  reactivarCliente(id: number): Observable<any> {
    return this.http
      .patch(`${this.apiUrl}/${id}/reactivar`, {})
      .pipe(tap(() => this.invalidateCache()));
  }

  updateCliente(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data).pipe(tap(() => this.invalidateCache()));
  }

  getClienteById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getRecentClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recientes`);
  }

  renovarPlan(planData: ClientePlanPayload): Observable<any> {
    const payload: ClientePlanPayload = {
      ...planData,
      fechaInicio: normalizeDateOnly(planData.fechaInicio),
      fechaFin: normalizeDateOnly(planData.fechaFin),
    };

    console.log('[ClienteService] Renovando plan para cliente:', payload.clienteId, payload);

    return this.http
      .post<any>(`${this.clientePlanUrl}/renovar/${payload.clienteId}`, payload)
      .pipe(tap(() => this.invalidateCache()));
  }

  private buildCacheKey(
    page: number,
    limit: number,
    search?: string,
    scope: 'active' | 'inactive' = 'active',
  ): string {
    return `${scope}|${page}|${limit}|${search?.trim().toLowerCase() ?? ''}`;
  }

  private invalidateCache(): void {
    this.cache.clear();
  }
}
