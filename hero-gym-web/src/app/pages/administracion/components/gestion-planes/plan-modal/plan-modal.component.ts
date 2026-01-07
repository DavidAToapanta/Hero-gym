import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-plan-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './plan-modal.component.html',
  styleUrl: './plan-modal.component.css',
})
export class PlanModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  plan = {
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    unidadDuracion: 'MESES' as 'MESES' | 'DIAS'
  };

  guardar() {
    this.save.emit(this.plan);
  }

  resetear() {
    this.plan = {
      nombre: '',
      descripcion: '',
      precio: '',
      duracion: '',
      unidadDuracion: 'MESES' as 'MESES' | 'DIAS'
    };
  }
}
