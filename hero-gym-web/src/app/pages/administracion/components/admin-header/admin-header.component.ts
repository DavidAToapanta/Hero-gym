import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-admin-header',
  imports: [],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css',
})
export class AdminHeaderComponent implements OnInit {
  admin = {
    nombre: '',
    rol: 'Administrador',
    estadoSistema: 'Activo',
    acceso: 'Total',
    ultimoAcceso: ''
  };

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const token = this.auth.getToken();
    let userName = 'Administrador';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userName = payload.userName || userName;
      } catch {}
    }
    const last = localStorage.getItem('ultimoAcceso');
    const fecha = last ? new Date(last) : new Date();
    this.admin.nombre = userName;
    this.admin.ultimoAcceso = this.formatearFechaHora(fecha);
  }

  private formatearFechaHora(d: Date): string {
    const opcionesFecha: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const opcionesHora: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    return `${d.toLocaleDateString(undefined, opcionesFecha)} ${d.toLocaleTimeString(undefined, opcionesHora)}`;
  }
}
