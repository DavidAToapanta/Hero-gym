import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientePlanService } from '../../../../core/services/cliente-plan.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RenovarComponent } from './renovar/renovar.component';
import { ProductosCienteComponent } from './productos-cliente/productos-cliente.component';
import { GestionComponent } from './gestion/gestion.component';

@Component({
  selector: 'app-acciones-tabla',
  standalone: true,
  imports: [
    CommonModule,
    RenovarComponent,
    ProductosCienteComponent,
    GestionComponent,
    ConfirmDialogComponent,
  ],
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
  @Output() planQuitado = new EventEmitter<void>();

  // Estado de modales hijos
  showRenovarModal = false;
  showProductosModal = false;
  showGestionModal = false;
  showQuitarPlanConfirm = false;
  isRemovingPlan = false;
  removePlanError = '';

  constructor(private clientePlanService: ClientePlanService) {}

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

  getClientePlanIdActual(): number | null {
    const planId = Number(this.cliente?.planes?.[0]?.id);
    return Number.isFinite(planId) && planId > 0 ? planId : null;
  }

  tienePlanActual(): boolean {
    return this.getClientePlanIdActual() !== null;
  }

  abrirConfirmacionQuitarPlan() {
    if (!this.tienePlanActual()) {
      return;
    }
    this.removePlanError = '';
    this.showQuitarPlanConfirm = true;
  }

  cancelarQuitarPlan() {
    if (this.isRemovingPlan) {
      return;
    }
    this.showQuitarPlanConfirm = false;
    this.removePlanError = '';
  }

  confirmarQuitarPlan() {
    if (this.isRemovingPlan) {
      return;
    }

    const clientePlanId = this.getClientePlanIdActual();
    if (!clientePlanId) {
      this.removePlanError = 'No se encontro un plan actual para quitar.';
      return;
    }

    this.isRemovingPlan = true;
    this.removePlanError = '';

    this.clientePlanService.quitarPlan(clientePlanId).subscribe({
      next: () => {
        this.isRemovingPlan = false;
        this.showQuitarPlanConfirm = false;
        this.planQuitado.emit();
        this.cerrado.emit();
      },
      error: (err) => {
        this.isRemovingPlan = false;
        const mensaje = err?.error?.message;
        this.removePlanError = Array.isArray(mensaje)
          ? mensaje.join(', ')
          : mensaje || 'No se pudo quitar el plan actual.';
      },
    });
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
