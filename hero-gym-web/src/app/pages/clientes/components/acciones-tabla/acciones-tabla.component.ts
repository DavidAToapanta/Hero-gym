import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RenovarComponent } from './renovar/renovar.component';
import { ProductosCienteComponent } from './productos-cliente/productos-cliente.component';
import { GestionComponent } from './gestion/gestion.component';

@Component({
  selector: 'app-acciones-tabla',
  standalone: true,
  imports: [CommonModule, RenovarComponent, ProductosCienteComponent, GestionComponent],
  templateUrl: './acciones-tabla.component.html',
  styleUrl: './acciones-tabla.component.css',
})
export class AccionesTablaComponent {
  /** Cliente sobre el que aplican las acciones */
  @Input() cliente: any = null;

  /** Emitido cuando el usuario elige Desactivar (el padre maneja la lógica) */
  @Output() desactivar = new EventEmitter<number>();

  /** Emitido cuando se cierra el menú sin acción (o tras completar una acción) */
  @Output() cerrado = new EventEmitter<void>();

  /** Emitido cuando se completó una renovación (para que clientes-lista recargue) */
  @Output() renovado = new EventEmitter<void>();

  /** Emitido cuando se completó un cambio de plan (para que clientes-lista recargue) */
  @Output() planCambiado = new EventEmitter<void>();

  // Estado de modales hijos
  showRenovarModal = false;
  showProductosModal = false;
  showGestionModal = false;

  // --- Renovar ---
  abrirRenovar() {
    this.showRenovarModal = true;
  }

  cerrarRenovar() {
    this.showRenovarModal = false;
  }

  onRenovacionConfirmada(_response: any) {
    this.cerrarRenovar();
    this.renovado.emit();
    this.cerrado.emit();
  }

  // --- Productos ---
  abrirProductos() {
    this.showProductosModal = true;
  }

  cerrarProductos() {
    this.showProductosModal = false;
  }

  // --- Gestión ---
  abrirGestion() {
    this.showGestionModal = true;
  }

  cerrarGestion() {
    this.showGestionModal = false;
  }

  /** Llamado cuando GestionComponent emite planCambiado */
  onPlanCambiado() {
    this.planCambiado.emit();
    this.cerrarGestion();
    this.cerrado.emit();
  }

  // --- Desactivar ---
  /** Puede ser llamado directamente (desde el menú) o vía evento de gestion (pasa el id) */
  solicitarDesactivar(clienteId?: number) {
    const id = clienteId ?? this.cliente?.id;
    if (id) {
      this.desactivar.emit(id);
      this.cerrarGestion();
      this.cerrado.emit();
    }
  }

  // --- Cerrar menú ---
  cerrarMenu() {
    this.cerrado.emit();
  }
}
