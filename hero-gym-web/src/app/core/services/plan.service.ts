import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plan {
  id?: number;
  nombre: string;
  precio: number;
  mesesPagar: number;
}

@Injectable({ providedIn: 'root' })
export class PlanService {
  private baseUrl = 'http://localhost:3000/plan';

  constructor(private http: HttpClient) {}

  getPlanes(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.baseUrl);
  }

  createPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(this.baseUrl, plan);
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
