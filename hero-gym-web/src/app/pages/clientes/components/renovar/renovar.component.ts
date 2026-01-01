import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ClienteService } from '../../../../core/services/cliente.service';
import { PagoService } from '../../../../core/services/pago.service';

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

  // Datos del formulario de renovación
  nuevoPlanId: number = 1;
  fechaInicio: string = '';
  observaciones: string = '';
  isLoading: boolean = false;

  // Planes disponibles desde el backend
  planesDisponibles: any[] = [];
  planSeleccionado: any = null;

  constructor(
    private clienteService: ClienteService,
    private pagoService: PagoService
  ) {}

  ngOnInit() {
    // Cargar planes desde el backend
    this.pagoService.getPlanes().subscribe({
      next: (planes) => {
        this.planesDisponibles = Array.isArray(planes) ? planes : [];
        console.log('[RenovarComponent] Planes cargados:', this.planesDisponibles);
        // Intentar seleccionar un plan una vez que se cargan
        this.onPlanChange();
      },
      error: (error) => {
        console.error('[RenovarComponent] Error al cargar planes:', error);
        this.planesDisponibles = [];
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.show && this.cliente) {
      // Inicializar fecha de inicio con la fecha actual
      const hoy = new Date();
      this.fechaInicio = hoy.toISOString().split('T')[0];
      
      // Intentar pre-seleccionar el mismo plan que tenía el cliente
      const planActual = this.getPlanActual();
      if (planActual?.plan?.id) {
        this.nuevoPlanId = planActual.plan.id;
      }
      
      // Siempre llamar onPlanChange para inicializar planSeleccionado
      setTimeout(() => this.onPlanChange(), 100);
    }
  }

  onPlanChange() {
    if (!this.planesDisponibles || this.planesDisponibles.length === 0) {
      console.warn('[RenovarComponent] No hay planes disponibles para seleccionar');
      return;
    }

    // Buscar el plan seleccionado
    let plan = this.planesDisponibles.find(p => p.id === +this.nuevoPlanId);

    // Si no se encuentra (o nuevoPlanId es inválido), seleccionar el primero por defecto
    if (!plan) {
      console.warn(`[RenovarComponent] Plan con ID ${this.nuevoPlanId} no encontrado. Seleccionando el primero.`);
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
    
    const datosRenovacion = {
      planId: +this.nuevoPlanId,
      fechaInicio: this.fechaInicio,
      duracionMeses: this.planSeleccionado.mesesPagar || 1,
      diaPago: new Date(this.fechaInicio).getDate()
    };
    
    this.clienteService.renovarPlan(this.cliente.id, datosRenovacion).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert(`Plan renovado exitosamente para ${this.cliente?.usuario?.nombres}`);
        this.renovado.emit(response);
        this.cerrarModal();
      },
      error: (error) => {
        console.error('[RenovarComponent] Error en renovación:', error);
        this.isLoading = false;
        const mensaje = error.error?.message || 'Error al renovar el plan';
        alert(`Error: ${mensaje}`);
      }
    });
  }

  getPrecioPlan(): number {
    return this.planSeleccionado?.precio || 0;
  }

  getFechaFinCalculada(): string {
    if (!this.fechaInicio || !this.planSeleccionado) return 'N/A';
    const inicio = new Date(this.fechaInicio);
    const meses = this.planSeleccionado.mesesPagar || 1;
    const fin = new Date(inicio);
    fin.setMonth(fin.getMonth() + meses);
    return fin.toLocaleDateString('es-ES');
  }

  getPlanActual(): any {
    return this.cliente?.planes?.[0] || null;
  }

  getFechaFinPlan(): string {
    const plan = this.getPlanActual();
    if (!plan?.fechaFin) return 'N/A';
    return new Date(plan.fechaFin).toLocaleDateString('es-ES');
  }
}
