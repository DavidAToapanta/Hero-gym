import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ClienteService } from '../../../../core/services/cliente.service';

@Component({
  selector: 'app-clientes-formulario',
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-formulario.component.html',
  styleUrl: './clientes-formulario.component.css',
})
export class ClientesFormularioComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @ViewChild('clienteForm') clienteForm?: NgForm;

  isSubmitting = false;
  errorMessage = '';

  cliente = this.crearClienteInicial();

  constructor(private clienteService: ClienteService) {}

  guardar() {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const payload = {
      userName: this.cliente.usuario.trim(),
      password: this.cliente.contrasena,
      nombres: this.cliente.nombres.trim(),
      apellidos: this.cliente.apellidos.trim(),
      cedula: this.cliente.cedula.trim(),
      fechaNacimiento: this.cliente.fechaNacimiento,
      rol: 'cliente',
      horario: this.cliente.horario.trim(),
      sexo: this.cliente.sexo,
      observaciones: this.cliente.observaciones.trim(),
      objetivos: this.cliente.objetivos.trim(),
      tiempoEntrenar: Number(this.cliente.tiempoEntrenamiento),
    };

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

  cerrar() {
    this.errorMessage = '';
    this.isSubmitting = false;
    this.resetFormulario();
    this.close.emit();
  }

  private crearClienteInicial() {
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

  private resetFormulario() {
    this.cliente = this.crearClienteInicial();
    this.clienteForm?.resetForm(this.cliente);
  }
}
