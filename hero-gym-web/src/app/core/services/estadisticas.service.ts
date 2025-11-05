import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private apiUrl = 'http://localhost:3000/estadisticas';

  constructor(private http: HttpClient) {}

  getIngresos(periodo: 'dia' | 'mes' | 'anio') {
    return this.http.get<{ labels: string[]; data: number[] }>(
      `${this.apiUrl}/ingresos?periodo=${periodo}`
    );
  }
}
