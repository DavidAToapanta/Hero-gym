import { Component, EventEmitter, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-clientes-busqueda',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './clientes-busqueda.component.html',
  styleUrls: ['./clientes-busqueda.component.css'],
})
export class ClientesBusquedaComponent {
  @Output() buscar = new EventEmitter<string>();
  termino: string = '';

  onBuscar() {
    this.buscar.emit(this.termino.trim());
  }

  limpiarBusqueda() {
    this.termino = '';
    this.buscar.emit('');
  }
}
