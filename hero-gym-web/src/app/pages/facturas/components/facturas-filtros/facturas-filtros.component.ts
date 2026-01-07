import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-facturas-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturas-filtros.component.html'
})
export class FacturasFiltrosComponent {
  @Output() filtrosChange = new EventEmitter<any>();

  filtroCedula: string = '';
  filtroEstado: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';

  onChange() {
    this.emitirFiltros();
  }

  limpiarFiltros() {
    this.filtroCedula = '';
    this.filtroEstado = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.emitirFiltros();
  }

  private emitirFiltros() {
    this.filtrosChange.emit({
      cedula: this.filtroCedula,
      estado: this.filtroEstado,
      desde: this.fechaDesde,
      hasta: this.fechaHasta
    });
  }
}
