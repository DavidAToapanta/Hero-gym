import { Component, EventEmitter, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './usuario-modal.component.html',
  styleUrl: './usuario-modal.component.css',
})
export class UsuarioModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  usuario = {
    nombre: '',
    apellidos: '',
    rol: 'Administrador',
    cedula: '',
    fechaNacimiento: '',
    userName: '',
    password: '',
    horario: '',
    sueldo: ''
  };

  guardar() {
    this.save.emit(this.usuario);
  }

  resetear() {
    this.usuario = {
      nombre: '',
      apellidos: '',
      rol: 'Administrador',
      cedula: '',
      fechaNacimiento: '',
      userName: '',
      password: '',
      horario: '',
      sueldo: ''
    };
  }
}
