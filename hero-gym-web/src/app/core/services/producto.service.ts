import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
export class ProductoService {
  private apiUrl = 'http://localhost:3000/producto'; // URL del backend NestJS

  constructor(private http: HttpClient) {}

  // 🔹 Obtener productos con paginación
  getProductos(page = 1, limit = 10): Observable<PaginatedResponse<any>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PaginatedResponse<any>>(this.apiUrl, { params });
  }

  // 🔹 Crear nuevo producto
  createProducto(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // 🔹 Obtener un producto por ID
  getProductoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Actualizar producto
  updateProducto(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data);
  }

  // 🔹 Eliminar producto
  deleteProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
