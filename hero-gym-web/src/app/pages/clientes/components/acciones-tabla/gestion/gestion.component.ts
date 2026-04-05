import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AsistenciaService,
  AsistenciaStats,
} from '../../../../../core/services/asistencia.service';
import {
  CambioPlanResponse,
  ClientePlanService,
} from '../../../../../core/services/cliente-plan.service';
import { Plan, PlanService } from '../../../../../core/services/plan.service';
import { extractErrorMessage } from '../../../../../core/utils/http-error.utils';
import {
  buildPlanDateRange,
  getTodayDateOnly,
  PlanDurationUnit,
} from '../../../../../core/utils/plan-date.utils';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.css',
})
export class GestionComponent implements OnChanges {
  @Input() show: boolean = false;
  @Input() cliente: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() desactivar = new EventEmitter<number>();
  @Output() planCambiado = new EventEmitter<void>();

  stats: AsistenciaStats | null = null;
  loadingStats = false;

  showCambioPlan = false;
  planesDisponibles: Plan[] = [];
  nuevoPlanId: number | null = null;
  fechaInicio: string = '';
  motivo: string = '';
  isChangingPlan = false;
  cambioPlanError = '';
  resultadoCambio: CambioPlanResponse | null = null;

  constructor(
    private asistenciaService: AsistenciaService,
    private clientePlanService: ClientePlanService,
    private planService: PlanService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && this.show && this.cliente?.id) {
      this.cargarEstadisticas();
    }

    if (changes['cliente'] && this.show && this.cliente?.id) {
      this.cargarEstadisticas();
    }

    if (changes['show'] && !this.show) {
      this.resetCambioPlan();
    }
  }

  private cargarEstadisticas() {
    this.loadingStats = true;
    this.stats = null;
    this.asistenciaService.getEstadisticas(this.cliente.id).subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadingStats = false;
      },
      error: () => {
        this.loadingStats = false;
      },
    });
  }

  solicitarDesactivar() {
    if (this.cliente?.id) {
      this.desactivar.emit(this.cliente.id);
      this.close.emit();
    }
  }

  cerrar() {
    this.close.emit();
  }

  getPlanActual(): any {
    return this.cliente?.planes?.[0] ?? null;
  }

  getEstadoPlan(): string {
    const plan = this.getPlanActual();
    if (!plan?.fechaFin) return 'Sin plan';
    const fin = new Date(plan.fechaFin);
    return fin >= new Date() ? 'Activo' : 'Vencido';
  }

  getFechaFin(): string {
    const plan = this.getPlanActual();
    if (!plan?.fechaFin) return 'N/A';
    return new Date(plan.fechaFin).toLocaleDateString('es-ES');
  }

  getDeudaTotal(): number {
    const clientePlan = this.getPlanActual();
    if (!clientePlan?.deudas || !Array.isArray(clientePlan.deudas)) return 0;
    return clientePlan.deudas
      .filter((deuda: any) => !deuda.solventada)
      .reduce((sum: number, deuda: any) => sum + (Number(deuda.monto) || 0), 0);
  }

  getPorcentaje(): number {
    return this.stats?.porcentajeAsistencia ?? 0;
  }

  getBarColor(): string {
    const porcentaje = this.getPorcentaje();
    if (porcentaje >= 70) return 'bg-green-500';
    if (porcentaje >= 40) return 'bg-yellow-400';
    return 'bg-red-400';
  }

  getTextColor(): string {
    const porcentaje = this.getPorcentaje();
    if (porcentaje >= 70) return 'text-green-600';
    if (porcentaje >= 40) return 'text-yellow-600';
    return 'text-red-500';
  }

  abrirCambioPlan() {
    this.resetCambioPlan();
    this.showCambioPlan = true;
    const planActual = this.getPlanActual();
    this.fechaInicio = getTodayDateOnly();

    this.planService.getPlanes(1, 100).subscribe({
      next: (response) => {
        const planActualId = planActual?.planId ?? planActual?.plan?.id;
        this.planesDisponibles = (response.data || []).filter(
          (plan: Plan) => plan.id !== planActualId,
        );
      },
      error: () => {
        this.planesDisponibles = [];
      },
    });
  }

  cancelarCambioPlan() {
    this.showCambioPlan = false;
    this.resultadoCambio = null;
    this.cambioPlanError = '';
  }

  private resetCambioPlan() {
    this.showCambioPlan = false;
    this.planesDisponibles = [];
    this.nuevoPlanId = null;
    this.fechaInicio = '';
    this.motivo = '';
    this.isChangingPlan = false;
    this.cambioPlanError = '';
    this.resultadoCambio = null;
  }

  confirmarCambioPlan() {
    const planActual = this.getPlanActual();
    if (!planActual?.id) {
      this.cambioPlanError = 'No se encontró un plan activo para cambiar.';
      return;
    }

    if (!this.nuevoPlanId) {
      this.cambioPlanError = 'Debes seleccionar un nuevo plan.';
      return;
    }

    if (!this.fechaInicio) {
      this.cambioPlanError = 'Debes indicar la fecha de inicio.';
      return;
    }

    const planSeleccionado = this.planesDisponibles.find(
      (plan) => plan.id === Number(this.nuevoPlanId),
    );
    const rangoFechas = buildPlanDateRange(
      this.fechaInicio,
      Number(planSeleccionado?.duracion || 1),
      this.getPlanUnit(planSeleccionado?.unidadDuracion),
    );
    const dto = {
      nuevoPlanId: Number(this.nuevoPlanId),
      ...rangoFechas,
      motivo: this.motivo || undefined,
    };

    this.isChangingPlan = true;
    this.cambioPlanError = '';

    this.clientePlanService.cambiarPlan(planActual.id, dto).subscribe({
      next: (response) => {
        this.isChangingPlan = false;
        this.resultadoCambio = response;
        this.showCambioPlan = false;
        this.planCambiado.emit();
      },
      error: (error) => {
        this.isChangingPlan = false;
        const mensaje = extractErrorMessage(
          error,
          'Ocurrió un error al intentar cambiar el plan. Inténtalo de nuevo.',
        );

        if (
          mensaje.toLowerCase().includes('72') ||
          mensaje.toLowerCase().includes('horas') ||
          mensaje.toLowerCase().includes('límite') ||
          mensaje.toLowerCase().includes('limite')
        ) {
          this.cambioPlanError =
            'Ya no se puede cambiar este plan porque superó el límite de 72 horas.';
          return;
        }

        this.cambioPlanError = mensaje;
      },
    });
  }

  private getPlanUnit(unidadDuracion: unknown): PlanDurationUnit {
    return unidadDuracion === 'DIAS' ? 'DIAS' : 'MESES';
  }
}
