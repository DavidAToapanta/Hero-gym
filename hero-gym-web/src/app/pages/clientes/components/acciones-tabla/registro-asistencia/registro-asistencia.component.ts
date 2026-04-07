import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AsistenciaService,
  RegistrarAsistenciaHistoricaPayload,
} from '../../../../../core/services/asistencia.service';
import { extractErrorMessage } from '../../../../../core/utils/http-error.utils';

type RegistroAsistenciaModo = 'NORMAL' | 'HISTORICA';

@Component({
  selector: 'app-registro-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-asistencia.component.html',
  styleUrl: './registro-asistencia.component.css',
})
export class RegistroAsistenciaComponent implements OnChanges {
  @Input() show = false;
  @Input() cliente: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() asistenciaRegistrada = new EventEmitter<void>();

  modo: RegistroAsistenciaModo = 'NORMAL';
  fechaHistorica = '';
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']?.currentValue === true) {
      this.resetState();
    }
  }

  constructor(private asistenciaService: AsistenciaService) {}

  cerrar(): void {
    if (this.isSubmitting) {
      return;
    }

    this.resetState();
    this.close.emit();
  }

  setModo(modo: RegistroAsistenciaModo): void {
    if (this.isSubmitting) {
      return;
    }

    this.modo = modo;
    this.errorMessage = '';
    this.successMessage = '';
  }

  registrar(): void {
    if (this.isSubmitting || !this.cliente?.id) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (this.modo === 'HISTORICA') {
      this.registrarHistorica();
      return;
    }

    this.registrarNormal();
  }

  isModo(modo: RegistroAsistenciaModo): boolean {
    return this.modo === modo;
  }

  getClienteNombreCompleto(): string {
    const nombres = this.cliente?.usuario?.nombres?.trim() ?? '';
    const apellidos = this.cliente?.usuario?.apellidos?.trim() ?? '';
    return `${nombres} ${apellidos}`.trim() || 'Cliente sin nombre';
  }

  getFechaHoy(): string {
    return new Intl.DateTimeFormat('es-EC', {
      dateStyle: 'full',
    }).format(new Date());
  }

  getMaxHistoricalDate(): string {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }

  private registrarNormal(): void {
    this.isSubmitting = true;

    this.asistenciaService.registrarAsistencia(this.cliente.id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'La asistencia de hoy quedó registrada para este cliente.';
        this.asistenciaRegistrada.emit();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = extractErrorMessage(
          error,
          'No se pudo registrar la asistencia de hoy. Intenta nuevamente.',
        );
      },
    });
  }

  private registrarHistorica(): void {
    if (!this.fechaHistorica) {
      this.errorMessage = 'Debes seleccionar la fecha que quieres registrar.';
      return;
    }

    this.isSubmitting = true;
    const payload: RegistrarAsistenciaHistoricaPayload = {
      clienteId: Number(this.cliente.id),
      fecha: this.fechaHistorica,
    };

    this.asistenciaService.registrarAsistenciaHistorica(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'La asistencia histórica quedó registrada para este cliente.';
        this.asistenciaRegistrada.emit();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = extractErrorMessage(
          error,
          'No se pudo registrar la asistencia histórica. Revisa la fecha e inténtalo de nuevo.',
        );
      },
    });
  }

  private resetState(): void {
    this.modo = 'NORMAL';
    this.fechaHistorica = '';
    this.isSubmitting = false;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
