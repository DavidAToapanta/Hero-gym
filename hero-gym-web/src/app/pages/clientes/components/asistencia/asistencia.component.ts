import { Component, OnInit } from '@angular/core';
import { AsistenciaService, AsistenciaStats } from '../../../../core/services/asistencia.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asistencia',
  imports: [CommonModule],
  templateUrl: './asistencia.component.html',
  styleUrl: './asistencia.component.css',
})
export class AsistenciaComponent implements OnInit {
  estadisticas: AsistenciaStats | null = null;
  cargando = true;
  error = false;

  constructor(private asistenciaService: AsistenciaService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    const clienteId = this.getClienteIdFromToken();
    
    if (!clienteId) {
      this.error = true;
      this.cargando = false;
      return;
    }

    this.asistenciaService.getEstadisticas(clienteId).subscribe({
      next: (data) => {
        this.estadisticas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  getClienteIdFromToken(): number | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.clienteId || null;
    } catch {
      return null;
    }
  }

  getMensajeMotivacional(): string {
    if (!this.estadisticas?.tienePlanActivo) return '';
    
    const porcentaje = this.estadisticas.porcentajeAsistencia || 0;
    
    if (porcentaje >= 80) return '¡Excelente constancia! 💪';
    if (porcentaje >= 60) return '¡Muy bien! Sigue así 🔥';
    if (porcentaje >= 40) return '¡Buen progreso! 👍';
    if (porcentaje >= 20) return 'Vamos, tú puedes mejorar 💪';
    return '¡Es hora de retomar el ritmo! 🚀';
  }
}
