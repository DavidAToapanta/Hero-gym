import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plan {
  id?: number;
  nombre: string;
  precio: number;
  duracion: number;
  unidadDuracion: 'MESES' | 'DIAS';
}

export interface PaginatedPlans {
  data: Plan[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class PlanService {
  private baseUrl = 'http://localhost:3000/plan';

  constructor(private http: HttpClient) {}

  getPlanes(page: number = 1, limit: number = 10): Observable<PaginatedPlans> {
    return this.http.get<PaginatedPlans>(`${this.baseUrl}?page=${page}&limit=${limit}`);
  }

  createPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(this.baseUrl, plan);
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  deletePlanWithCascade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/cascade`);
  }
}
