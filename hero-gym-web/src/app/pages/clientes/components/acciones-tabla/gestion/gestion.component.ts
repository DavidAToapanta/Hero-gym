import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService, AsistenciaStats } from '../../../../../core/services/asistencia.service';
import { ClientePlanService, CambioPlanResponse } from '../../../../../core/services/cliente-plan.service';
import { PlanService, Plan } from '../../../../../core/services/plan.service';

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
  /** Emitido cuando el usuario pulsa Desactivar desde esta vista */
  @Output() desactivar = new EventEmitter<number>();
  /** Emitido cuando el plan se cambia exitosamente */
  @Output() planCambiado = new EventEmitter<void>();

  stats: AsistenciaStats | null = null;
  loadingStats = false;

  // ── Estado cambio de plan ─────────────────────────────────────
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
    private planService: PlanService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    // Cargar estadísticas cada vez que el modal se abre con un cliente válido
    if (changes['show'] && this.show && this.cliente?.id) {
      this.cargarEstadisticas();
    }
    if (changes['cliente'] && this.show && this.cliente?.id) {
      this.cargarEstadisticas();
    }
    // Limpiar estado de cambio de plan al cerrar el modal
    if (changes['show'] && !this.show) {
      this.resetCambioPlan();
    }
  }

  private cargarEstadisticas() {
    this.loadingStats = true;
    this.stats = null;
    this.asistenciaService.getEstadisticas(this.cliente.id).subscribe({
      next: (s) => {
        this.stats = s;
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

  // ── Helpers de plan ────────────────────────────────────────────
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
    const cp = this.getPlanActual();
    if (!cp?.deudas || !Array.isArray(cp.deudas)) return 0;
    return cp.deudas
      .filter((d: any) => !d.solventada)
      .reduce((sum: number, d: any) => sum + (Number(d.monto) || 0), 0);
  }

  // ── Helpers de asistencia ──────────────────────────────────────
  getPorcentaje(): number {
    return this.stats?.porcentajeAsistencia ?? 0;
  }

  getBarColor(): string {
    const p = this.getPorcentaje();
    if (p >= 70) return 'bg-green-500';
    if (p >= 40) return 'bg-yellow-400';
    return 'bg-red-400';
  }

  getTextColor(): string {
    const p = this.getPorcentaje();
    if (p >= 70) return 'text-green-600';
    if (p >= 40) return 'text-yellow-600';
    return 'text-red-500';
  }

  // ── Cambio de plan ─────────────────────────────────────────────
  abrirCambioPlan() {
    this.resetCambioPlan();
    this.showCambioPlan = true;
    const planActual = this.getPlanActual();
    this.fechaInicio = new Date().toISOString().split('T')[0];
    // Cargar planes disponibles
    this.planService.getPlanes(1, 100).subscribe({
      next: (res) => {
        const planActualId = planActual?.planId ?? planActual?.plan?.id;
        this.planesDisponibles = (res.data || []).filter(
          (p: Plan) => p.id !== planActualId
        );
      },
      error: () => {
        this.planesDisponibles = [];
      }
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
    // Calcular fechaFin basada en el plan seleccionado
    const planSeleccionado = this.planesDisponibles.find(p => p.id === Number(this.nuevoPlanId));
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(inicio);
    if (planSeleccionado?.unidadDuracion === 'DIAS') {
      fin.setDate(fin.getDate() + (planSeleccionado.duracion || 30));
    } else {
      fin.setMonth(fin.getMonth() + (planSeleccionado?.duracion || 1));
    }

    const dto = {
      nuevoPlanId: Number(this.nuevoPlanId),
      fechaInicio: this.fechaInicio,
      fechaFin: fin.toISOString().split('T')[0],
      motivo: this.motivo || undefined
    };

    this.isChangingPlan = true;
    this.cambioPlanError = '';

    this.clientePlanService.cambiarPlan(planActual.id, dto).subscribe({
      next: (res) => {
        this.isChangingPlan = false;
        this.resultadoCambio = res;
        this.showCambioPlan = false;
        // Emitir evento para refrescar la tabla
        this.planCambiado.emit();
        // Cerrar el modal después de mostrar el resumen brevemente
        setTimeout(() => {
          this.cerrar();
        }, 4000);
      },
      error: (err) => {
        this.isChangingPlan = false;
        const mensaje = err?.error?.message || '';
        if (
          mensaje.toLowerCase().includes('72') ||
          mensaje.toLowerCase().includes('horas') ||
          mensaje.toLowerCase().includes('límite') ||
          mensaje.toLowerCase().includes('limite')
        ) {
          this.cambioPlanError =
            'Ya no se puede cambiar este plan porque superó el límite de 72 horas.';
        } else {
          this.cambioPlanError =
            mensaje || 'Ocurrió un error al intentar cambiar el plan. Inténtalo de nuevo.';
        }
      }
    });
  }
}
