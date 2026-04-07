import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import {
  CreateIngresoRapidoPayload,
  IngresosRapidosService,
} from '../../../../core/services/ingresos-rapidos.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.utils';

interface IngresoRapidoFormModel {
  concepto: string;
  monto: number | null;
}

@Component({
  selector: 'app-ingreso-rapido-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingreso-rapido-formulario.component.html',
  styleUrl: './ingreso-rapido-formulario.component.css',
})
export class IngresoRapidoFormularioComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<unknown>();
  @ViewChild('ingresoRapidoForm') ingresoRapidoForm?: NgForm;

  isSubmitting = false;
  errorMessage = '';
  statusMessage = '';

  ingreso = this.crearIngresoInicial();

  constructor(private ingresosRapidosService: IngresosRapidosService) {}

  guardar(): void {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.statusMessage = '';

    if (this.ingresoRapidoForm?.invalid) {
      this.ingresoRapidoForm.form.markAllAsTouched();
      this.errorMessage = 'Completa el concepto y un monto valido para registrar el ingreso.';
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.isSubmitting = true;
    this.statusMessage = 'Registrando ingreso rapido…';

    this.ingresosRapidosService.createIngresoRapido(payload).subscribe({
      next: (response) => {
        this.save.emit(response);
        this.isSubmitting = false;
        this.statusMessage = '';
        this.cerrar();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.statusMessage = '';
        this.errorMessage = extractErrorMessage(
          error,
          'No se pudo registrar el ingreso rapido. Revisa los datos e intentalo nuevamente.',
        );
      },
    });
  }

  cerrar(): void {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.statusMessage = '';
    this.resetFormulario();
    this.close.emit();
  }

  private buildPayload(): CreateIngresoRapidoPayload | null {
    const concepto = this.ingreso.concepto.trim();
    const monto = Number(this.ingreso.monto);

    if (!concepto) {
      this.errorMessage = 'Ingresa un concepto para identificar este ingreso.';
      return null;
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      this.errorMessage = 'El monto debe ser mayor a 0.';
      return null;
    }

    return {
      concepto,
      monto,
    };
  }

  private crearIngresoInicial(): IngresoRapidoFormModel {
    return {
      concepto: 'Pase diario',
      monto: null,
    };
  }

  private resetFormulario(): void {
    this.ingreso = this.crearIngresoInicial();
    this.ingresoRapidoForm?.resetForm(this.ingreso);
  }
}
