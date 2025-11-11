import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pagos-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './pagos-busqueda.component.html',
  styleUrl: './pagos-busqueda.component.css',
})
export class PagosBusquedaComponent {
  @Output() buscar = new EventEmitter<string>();
  termino: string = '';

  onBuscar() {
    this.buscar.emit(this.termino.trim());
  }

  limpiar() {
    this.termino = '';
    this.buscar.emit('');
  }
}
