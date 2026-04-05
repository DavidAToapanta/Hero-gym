import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { ClienteService } from '../../../../../core/services/cliente.service';
import { ClientePlanPayload } from '../../../../../core/services/cliente-plan.service';
import { PagoService } from '../../../../../core/services/pago.service';
import { extractErrorMessage } from '../../../../../core/utils/http-error.utils';
import {
  buildPlanDateRange,
  getTodayDateOnly,
  PlanDurationUnit,
} from '../../../../../core/utils/plan-date.utils';

@Component({
  selector: 'app-renovar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './renovar.component.html',
  styleUrl: './renovar.component.css',
})
export class RenovarComponent implements OnChanges, OnInit {
  @Input() show: boolean = false;
  @Input() cliente: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() renovado = new EventEmitter<any>();

  nuevoPlanId: number = 1;
  fechaInicio: string = '';
  isLoading: boolean = false;

  planesDisponibles: any[] = [];
  planSeleccionado: any = null;

  constructor(
    private clienteService: ClienteService,
    private pagoService: PagoService,
  ) {}

  ngOnInit() {
    this.cargarPlanes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.show && this.cliente) {
      this.cargarPlanes();
      this.fechaInicio = getTodayDateOnly();

      const planActual = this.getPlanActual();
      if (planActual?.plan?.id) {
        this.nuevoPlanId = planActual.plan.id;
      }

      setTimeout(() => this.onPlanChange(), 100);
    }
  }

  cargarPlanes() {
    this.pagoService.getPlanes().subscribe({
      next: (planes) => {
        this.planesDisponibles = Array.isArray(planes) ? planes : [];
        console.log('[RenovarComponent] Planes cargados:', this.planesDisponibles);
        this.onPlanChange();
      },
      error: (error) => {
        console.error('[RenovarComponent] Error al cargar planes:', error);
        this.planesDisponibles = [];
      },
    });
  }

  onPlanChange() {
    if (!this.planesDisponibles || this.planesDisponibles.length === 0) {
      console.warn('[RenovarComponent] No hay planes disponibles para seleccionar');
      return;
    }

    let plan = this.planesDisponibles.find((item) => item.id === +this.nuevoPlanId);

    if (!plan) {
      console.warn(
        `[RenovarComponent] Plan con ID ${this.nuevoPlanId} no encontrado. Seleccionando el primero.`,
      );
      plan = this.planesDisponibles[0];
      this.nuevoPlanId = plan.id;
    }

    this.planSeleccionado = plan;
    console.log('[RenovarComponent] Plan seleccionado:', this.planSeleccionado);
  }

  cerrarModal() {
    this.close.emit();
  }

  confirmarRenovacion() {
    if (!this.fechaInicio) {
      alert('Por favor selecciona una fecha de inicio');
      return;
    }

    if (!this.cliente?.id) {
      alert('Error: No se pudo identificar el cliente');
      return;
    }

    if (!this.planSeleccionado) {
      alert('Error: Por favor selecciona un plan');
      return;
    }

    this.isLoading = true;

    const rangoFechas = buildPlanDateRange(
      this.fechaInicio,
      Number(this.planSeleccionado.duracion || 1),
      this.getPlanUnit(this.planSeleccionado.unidadDuracion),
    );
    const datosRenovacion: ClientePlanPayload = {
      clienteId: this.cliente.id,
      planId: Number(this.nuevoPlanId),
      ...rangoFechas,
      activado: true,
    };

    this.clienteService.renovarPlan(datosRenovacion).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert(`Plan renovado exitosamente para ${this.cliente?.usuario?.nombres}`);
        this.renovado.emit(response);
        this.cerrarModal();
      },
      error: (error) => {
        console.error('[RenovarComponent] Error en renovación:', error);
        this.isLoading = false;
        const mensaje = extractErrorMessage(error, 'Error al renovar el plan');
        alert(`Error: ${mensaje}`);
      },
    });
  }

  getPrecioPlan(): number {
    return this.planSeleccionado?.precio || 0;
  }

  getFechaFinCalculada(): string {
    if (!this.fechaInicio || !this.planSeleccionado) return 'N/A';

    const rangoFechas = buildPlanDateRange(
      this.fechaInicio,
      Number(this.planSeleccionado.duracion || 1),
      this.getPlanUnit(this.planSeleccionado.unidadDuracion),
    );
    const fechaFin = new Date(`${rangoFechas.fechaFin}T00:00:00`);
    return fechaFin.toLocaleDateString('es-ES');
  }

  getPlanActual(): any {
    return this.cliente?.planes?.[0] || null;
  }

  getFechaFinPlan(): string {
    const plan = this.getPlanActual();
    if (!plan?.fechaFin) return 'N/A';
    return new Date(plan.fechaFin).toLocaleDateString('es-ES');
  }

  tienePlanActivo(): boolean {
    const plan = this.getPlanActual();
    if (!plan?.fechaFin) return false;

    const fechaFin = new Date(plan.fechaFin);
    fechaFin.setHours(23, 59, 59, 999);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return fechaFin >= hoy;
  }

  private getPlanUnit(unidadDuracion: unknown): PlanDurationUnit {
    return unidadDuracion === 'DIAS' ? 'DIAS' : 'MESES';
  }
}
