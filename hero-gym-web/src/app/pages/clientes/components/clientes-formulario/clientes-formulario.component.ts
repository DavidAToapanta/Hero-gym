import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import {
  ClienteService,
  RegisterClientePayload,
} from '../../../../core/services/cliente.service';

interface ClienteFormModel {
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: string;
  usuario: string;
  contrasena: string;
  horario: string;
  sexo: string;
  observaciones: string;
  objetivos: string;
  tiempoEntrenamiento: number | null;
}

@Component({
  selector: 'app-clientes-formulario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clientes-formulario.component.html',
  styleUrls: ['./clientes-formulario.component.css'],
})
export class ClientesFormularioComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<unknown>();
  @ViewChild('clienteForm') clienteForm?: NgForm;

  isSubmitting = false;
  errorMessage = '';

  cliente = this.crearClienteInicial();

  constructor(private clienteService: ClienteService) {}

  guardar(): void {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    if (this.clienteForm?.invalid) {
      this.clienteForm.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.isSubmitting = true;

    this.clienteService.createCliente(payload).subscribe({
      next: (response) => {
        this.save.emit(response);
        this.isSubmitting = false;
        this.cerrar();
      },
      error: (error) => {
        const mensaje = error?.error?.message;
        this.errorMessage =
          typeof mensaje === 'string'
            ? mensaje
            : Array.isArray(mensaje) && mensaje.length > 0
            ? mensaje.join('. ')
            : 'Ocurrió un error al registrar el cliente';
        this.isSubmitting = false;
      },
    });
  }

  cerrar(): void {
    this.errorMessage = '';
    this.isSubmitting = false;
    this.resetFormulario();
    this.close.emit();
  }

  private buildPayload(): RegisterClientePayload | null {
    const fechaNacimiento = this.cliente.fechaNacimiento.trim();
    if (!fechaNacimiento || Number.isNaN(Date.parse(fechaNacimiento))) {
      this.errorMessage = 'La fecha de nacimiento no es válida';
      return null;
    }

    if (this.cliente.contrasena.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return null;
    }

    const tiempoEntrenar = Number(this.cliente.tiempoEntrenamiento);
    if (Number.isNaN(tiempoEntrenar)) {
      this.errorMessage = 'El tiempo de entrenamiento debe ser un número válido';
      return null;
    }

    return {
      nombres: this.cliente.nombres.trim(),
      apellidos: this.cliente.apellidos.trim(),
      cedula: this.cliente.cedula.trim(),
      fechaNacimiento,
      userName: this.cliente.usuario.trim(),
      password: this.cliente.contrasena,
      horario: this.cliente.horario.trim(),
      sexo: this.cliente.sexo,
      observaciones: this.cliente.observaciones.trim(),
      objetivos: this.cliente.objetivos.trim(),
      tiempoEntrenar,
    };
  }

  private crearClienteInicial(): ClienteFormModel {
    return {
      nombres: '',
      apellidos: '',
      cedula: '',
      fechaNacimiento: '',
      usuario: '',
      contrasena: '',
      horario: '',
      sexo: '',
      observaciones: '',
      objetivos: '',
      tiempoEntrenamiento: null,
    };
  }

  private resetFormulario(): void {
    this.cliente = this.crearClienteInicial();
    this.clienteForm?.resetForm(this.cliente);
  }
}
