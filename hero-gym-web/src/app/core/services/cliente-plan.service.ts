import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientePlanService {
  private apiUrl = 'http://localhost:3000/cliente-plan'

  constructor(private http: HttpClient) {}

  getClientesActivos(): Observable<{ activos: number }> {
    return this.http.get<{ activos: number }>('http://localhost:3000/cliente-plan/activos');
  }
}
