import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

interface IngresosMesResponse {
  ingresos: number | string; // por si el backend devuelve string
}

@Injectable({ providedIn: 'root' })
export class PagoService {
  private apiUrl = 'http://localhost:3000/pago';

  constructor(private http: HttpClient) {}

  getIngresosDelMes() {
    // URL correcta: /pago/ingresos-mes (sin repetir /pago)
    return this.http.get<IngresosMesResponse>(`${this.apiUrl}/ingresos-mes`).pipe(
      map((res) => Number((res as any)?.ingresos ?? res)) // garantiza number
    );
  }
}
