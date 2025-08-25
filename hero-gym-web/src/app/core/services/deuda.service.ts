import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root'})
export class DeudaService {
    private apiUrl = 'http://localhost:3000/deuda'; // Cambia esto según tu configuración

    constructor(private http: HttpClient){}

    getDeudoresCount(){
        return this.http.get<{ total: number}>(`${this.apiUrl}/deudores/count`);
    }
}