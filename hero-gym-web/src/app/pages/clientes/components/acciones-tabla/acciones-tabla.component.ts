import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ClientePlanService } from '../../../../core/services/cliente-plan.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { GestionComponent } from './gestion/gestion.component';
import { ProductosCienteComponent } from './productos-cliente/productos-cliente.component';
import { RegistroAsistenciaComponent } from './registro-asistencia/registro-asistencia.component';
import { RenovarComponent } from './renovar/renovar.component';

@Component({
  selector: 'app-acciones-tabla',
  standalone: true,
  imports: [
    CommonModule,
    RenovarComponent,
    ProductosCienteComponent,
    GestionComponent,
    RegistroAsistenciaComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './acciones-tabla.component.html',
  styleUrl: './acciones-tabla.component.css',
})
export class AccionesTablaComponent {
  @Input() cliente: any = null;

  @Output() desactivar = new EventEmitter<number>();
  @Output() cerrado = new EventEmitter<void>();
  @Output() renovado = new EventEmitter<void>();
  @Output() planCambiado = new EventEmitter<void>();
  @Output() planQuitado = new EventEmitter<void>();
  @Output() asistenciaRegistrada = new EventEmitter<void>();

  showRenovarModal = false;
  showProductosModal = false;
  showGestionModal = false;
  showRegistroAsistenciaModal = false;
  showQuitarPlanConfirm = false;
  isRemovingPlan = false;
  removePlanError = '';

  constructor(private clientePlanService: ClientePlanService) {}

  abrirRenovar(): void {
    this.showRenovarModal = true;
  }

  cerrarRenovar(): void {
    this.showRenovarModal = false;
  }

  onRenovacionConfirmada(_response: unknown): void {
    this.cerrarRenovar();
    this.renovado.emit();
    this.cerrado.emit();
  }

  abrirProductos(): void {
    this.showProductosModal = true;
  }

  cerrarProductos(): void {
    this.showProductosModal = false;
  }

  abrirGestion(): void {
    this.showGestionModal = true;
  }

  cerrarGestion(): void {
    this.showGestionModal = false;
  }

  onPlanCambiado(): void {
    this.planCambiado.emit();
    this.cerrarGestion();
    this.cerrado.emit();
  }

  abrirRegistroAsistencia(): void {
    this.showRegistroAsistenciaModal = true;
  }

  cerrarRegistroAsistencia(): void {
    this.showRegistroAsistenciaModal = false;
  }

  onAsistenciaRegistrada(): void {
    this.asistenciaRegistrada.emit();
    this.cerrarRegistroAsistencia();
    this.cerrado.emit();
  }

  getClientePlanIdActual(): number | null {
    const planId = Number(this.cliente?.planes?.[0]?.id);
    return Number.isFinite(planId) && planId > 0 ? planId : null;
  }

  tienePlanActual(): boolean {
    return this.getClientePlanIdActual() !== null;
  }

  abrirConfirmacionQuitarPlan(): void {
    if (!this.tienePlanActual()) {
      return;
    }

    this.removePlanError = '';
    this.showQuitarPlanConfirm = true;
  }

  cancelarQuitarPlan(): void {
    if (this.isRemovingPlan) {
      return;
    }

    this.showQuitarPlanConfirm = false;
    this.removePlanError = '';
  }

  confirmarQuitarPlan(): void {
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

  solicitarDesactivar(clienteId?: number): void {
    const id = clienteId ?? this.cliente?.id;
    if (id) {
      this.desactivar.emit(id);
      this.cerrarGestion();
      this.cerrado.emit();
    }
  }

  cerrarMenu(): void {
    if (this.isRemovingPlan) {
      return;
    }

    this.cerrado.emit();
  }

  getNombreCliente(): string {
    const nombres = this.cliente?.usuario?.nombres?.trim() ?? '';
    const apellidos = this.cliente?.usuario?.apellidos?.trim() ?? '';
    return `${nombres} ${apellidos}`.trim() || 'Cliente sin nombre';
  }

  getCedulaCliente(): string {
    return this.cliente?.usuario?.cedula || 'Sin cedula';
  }

  getPlanActualNombre(): string {
    return this.cliente?.planes?.[0]?.plan?.nombre || 'Sin plan asignado';
  }

  getEstadoCliente(): string {
    const fechaFin = this.cliente?.planes?.[0]?.fechaFin;
    if (!fechaFin) {
      return 'Sin plan';
    }

    return new Date(fechaFin) >= new Date() ? 'Activo' : 'Vencido';
  }

  tieneModalHijoAbierto(): boolean {
    return (
      this.showRenovarModal ||
      this.showProductosModal ||
      this.showGestionModal ||
      this.showRegistroAsistenciaModal ||
      this.showQuitarPlanConfirm
    );
  }
}
