import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { catchError, forkJoin, of } from 'rxjs';

import {
  AsistenciaHistorialItem,
  AsistenciaService,
  AsistenciaStats,
} from '../../../../core/services/asistencia.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asistencia.component.html',
  styleUrl: './asistencia.component.css',
})
export class AsistenciaComponent implements OnInit {
  estadisticas: AsistenciaStats | null = null;
  historial: AsistenciaHistorialItem[] = [];
  cargando = true;
  error = false;
  historialError = false;

  constructor(private asistenciaService: AsistenciaService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.error = false;
    this.historialError = false;
    this.estadisticas = null;
    this.historial = [];

    forkJoin({
      estadisticas: this.asistenciaService.getMiEstadisticas().pipe(
        catchError((err) => {
          console.error('Error cargando estadísticas de asistencia:', err);
          this.error = true;
          return of(null);
        }),
      ),
      historial: this.asistenciaService.getMiHistorial().pipe(
        catchError((err) => {
          console.error('Error cargando historial de asistencia:', err);
          this.historialError = true;
          return of([] as AsistenciaHistorialItem[]);
        }),
      ),
    }).subscribe({
      next: ({ estadisticas, historial }) => {
        this.estadisticas = estadisticas;
        this.historial = historial;
        this.cargando = false;

        if (!estadisticas) {
          this.error = true;
        }
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      },
    });
  }

  getUltimaAsistenciaTexto(): string {
    const ultimaAsistencia = this.historial[0]?.['fecha'];

    return typeof ultimaAsistencia === 'string' || ultimaAsistencia instanceof Date
      ? new Date(ultimaAsistencia).toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'Sin registros';
  }

  getMensajeMotivacional(): string {
    if (!this.estadisticas?.tienePlanActivo) return '';

    const porcentaje = this.estadisticas.porcentajeAsistencia || 0;

    if (porcentaje >= 80) return '\u00a1Excelente constancia! Sigue as\u00ed.';
    if (porcentaje >= 60) return '\u00a1Muy bien! Mant\u00e9n el ritmo.';
    if (porcentaje >= 40) return 'Buen progreso, sigue adelante.';
    if (porcentaje >= 20) return 'Puedes mejorar tu asistencia, \u00e1nimo.';
    return 'Es hora de retomar el ritmo.';
  }
}
