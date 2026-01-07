import { Component, EventEmitter, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: 'app-productos-busqueda',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './productos-busqueda.component.html',
  styleUrls: ['./productos-busqueda.component.css'],
})
export class ProductosBusquedaComponent {
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
