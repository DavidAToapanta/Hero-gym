import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeudaService {
  private apiUrl = `${environment.apiUrl}/deuda`;

  constructor(private http: HttpClient) {}

  getDeudoresCount() {
    return this.http.get<{ total: number }>(`${this.apiUrl}/deudores/count`);
  }
}
