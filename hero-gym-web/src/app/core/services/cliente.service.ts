import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

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

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/cliente`;
  private usuariosUrl = `${environment.apiUrl}/usuarios`;
  private clientePlanUrl = `${environment.apiUrl}/cliente-plan`;
  private cache = new Map<string, PaginatedResponse<any>>();

  constructor(private http: HttpClient) {}

  // 🔹 Obtener clientes (paginado + búsqueda opcional)
  getClientes(
    page = 1,
    limit = 10,
    search?: string,
    forceRefresh = false,
  ): Observable<PaginatedResponse<any>> {
    const cacheKey = this.buildCacheKey(page, limit, search, 'active');
    const searchTerm = search?.trim() || '';

    // Si forceRefresh es true, limpiar el cache para esta clave específica
    if (forceRefresh) {
      this.cache.delete(cacheKey);
      console.log('[ClienteService] Force refresh - cache eliminado para:', cacheKey);
    } else if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      // Verificar que el cache tenga datos válidos (puede ser un array vacío válido)
      if (cached && cached.data !== undefined && cached.meta) {
        console.log('[ClienteService] Retornando desde cache:', cacheKey);
        return of(cached);
      }
      // Si el cache está corrupto o incompleto, eliminarlo y hacer una nueva petición
      this.cache.delete(cacheKey);
      console.log('[ClienteService] Cache corrupto eliminado:', cacheKey);
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    console.log('[ClienteService] Haciendo petición HTTP:', { page, limit, search: searchTerm, forceRefresh });
    const startTime = Date.now();

    return this.http
      .get<PaginatedResponse<any>>(this.apiUrl, { params })
      .pipe(
        tap((response) => {
          const duration = Date.now() - startTime;
          console.log(`[ClienteService] Respuesta recibida en ${duration}ms:`, {
            items: response?.data?.length || 0,
            totalItems: response?.meta?.totalItems || 0,
          });
          // Cachear la respuesta solo si tiene la estructura correcta
          if (response && response.meta !== undefined) {
            this.cache.set(cacheKey, response);
            console.log('[ClienteService] Respuesta cacheada:', cacheKey);
          }
        })
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

    return this.http
      .get<PaginatedResponse<any>>(this.apiUrl, { params })
      .pipe(
        tap((response) => {
          if (response && response.meta !== undefined) {
            this.cache.set(cacheKey, response);
          }
        })
      );
  }

  // 🔹 Crear nuevo cliente
  createCliente(data: any): Observable<any> {
    return this.http
      .post<any>(this.usuariosUrl, data)
      .pipe(tap(() => this.invalidateCache()));
  }

  // 🔹 Desactivar cliente (Soft Delete)
  desactivarCliente(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.invalidateCache()));
  }

  reactivarCliente(id: number): Observable<any> {
    return this.http
      .patch(`${this.apiUrl}/${id}/reactivar`, {})
      .pipe(tap(() => this.invalidateCache()));
  }

  // 🔹 Actualizar cliente
  updateCliente(id: number, data: any): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/${id}`, data)
      .pipe(tap(() => this.invalidateCache()));
  }

  // 🔹 Obtener cliente por ID
  getClienteById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // 🔹 Obtener clientes recientes
  getRecentClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recientes`);
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

  // 🔹 Renovar plan de cliente
  renovarPlan(clienteId: number, planData: {
    planId: number;
    fechaInicio: string;
    duracion: number;
    unidad: 'MESES' | 'DIAS';
    diaPago?: number;
  }): Observable<any> {
    console.log('[ClienteService] Renovando plan para cliente:', clienteId, planData);
    
    // Calcular fecha fin basada en la duración y unidad
    const fechaInicio = new Date(planData.fechaInicio);
    const fechaFin = new Date(fechaInicio);

    if (planData.unidad === 'DIAS') {
      fechaFin.setDate(fechaFin.getDate() + planData.duracion);
    } else {
      // Por defecto MESES
      fechaFin.setMonth(fechaFin.getMonth() + planData.duracion);
    }
    
    const dto = {
      clienteId: clienteId,
      planId: planData.planId,
      fechaInicio: planData.fechaInicio,
      fechaFin: fechaFin.toISOString().split('T')[0],
      diaPago: planData.diaPago || fechaInicio.getDate(),
      activado: true
    };

    console.log('[ClienteService] DTO de renovación:', dto);
    
    return this.http
      .post<any>(`${this.clientePlanUrl}/renovar/${clienteId}`, dto)
      .pipe(tap(() => this.invalidateCache()));
  }
}
