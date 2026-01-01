import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CompraDetalle {
  productoId: number;
  cantidad: number;
}

export interface CreateCompraDto {
  clienteId: number;
  detalles: CompraDetalle[];
}

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = `${environment.apiUrl}/compra`;

  constructor(private http: HttpClient) { }

  create(compra: CreateCompraDto): Observable<any> {
    return this.http.post(this.apiUrl, compra);
  }
}
