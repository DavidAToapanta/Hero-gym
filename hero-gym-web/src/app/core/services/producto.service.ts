import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/producto`;

  constructor(private http: HttpClient) {}

  // 🔹 Obtener productos con filtro opcional por nombre y paginación
  getProductos(page = 1, limit = 10, searchTerm = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.http.get<any>(this.apiUrl, { params });
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
