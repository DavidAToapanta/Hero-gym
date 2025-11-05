import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000/clientes'; // URL del backend NestJS
  private usuariosUrl = 'http://localhost:3000/usuarios';
  private cache = new Map<string, PaginatedResponse<any>>();

  constructor(private http: HttpClient) {}

  // 🔹 Obtener clientes (paginado + búsqueda opcional)
  getClientes(
    page = 1,
    limit = 10,
    search?: string,
    forceRefresh = false,
  ): Observable<PaginatedResponse<any>> {
    const cacheKey = this.buildCacheKey(page, limit, search);

    // Si forceRefresh es true, limpiar el cache para esta clave específica
    if (forceRefresh) {
      this.cache.delete(cacheKey);
    } else if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      // Verificar que el cache no esté vacío
      if (cached && cached.data && cached.data.length > 0) {
        return of(cached);
      }
      // Si el cache está vacío, eliminarlo y hacer una nueva petición
      this.cache.delete(cacheKey);
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    return this.http
      .get<PaginatedResponse<any>>(this.apiUrl, { params })
      .pipe(tap((response) => {
        // Solo cachear si la respuesta tiene datos válidos
        if (response && response.data) {
          this.cache.set(cacheKey, response);
        }
      }));
  }

  // 🔹 Crear nuevo cliente
  createCliente(data: any): Observable<any> {
    return this.http
      .post<any>(this.usuariosUrl, data)
      .pipe(tap(() => this.invalidateCache()));
  }

  // 🔹 Eliminar cliente
  deleteCliente(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${id}`)
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

  private buildCacheKey(page: number, limit: number, search?: string): string {
    return `${page}|${limit}|${search?.trim().toLowerCase() ?? ''}`;
  }

  private invalidateCache(): void {
    this.cache.clear();
  }
}
