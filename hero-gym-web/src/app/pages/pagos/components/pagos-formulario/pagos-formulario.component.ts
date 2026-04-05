import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { ClienteService } from '../../../../core/services/cliente.service';
import { PagoService } from '../../../../core/services/pago.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.utils';
import {
  buildPlanDateRange,
  getTodayDateOnly,
  PlanDurationUnit,
} from '../../../../core/utils/plan-date.utils';

@Component({
  selector: 'app-pagos-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos-formulario.component.html',
  styleUrl: './pagos-formulario.component.css',
})
export class PagosFormularioComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @ViewChild('pagoForm') pagoForm?: NgForm;

  isSubmitting = false;
  errorMessage = '';

  pago = this.crearPagoInicial();
  clientePlanes: any[] = [];
  clientes: { id: number; nombre: string; cedula: string }[] = [];
  todosLosClientes: { id: number; nombre: string; cedula: string }[] = [];
  searchTermCliente: string = '';
  showSuggestions = false;
  selectedClienteId: number | null = null;
  planes: any[] = [];
  selectedPlan: any | null = null;
  selectedPlanId: number | null = null;
  planActivoDelCliente: any | null = null;
  planActivoMensaje = '';
  detallesPlan:
    | { nombre: string; fechaInicio: string; fechaFin: string; activado: boolean; precio?: number }
    | null = null;
  deudaCalculada = 0;
  mensajeAdvertencia = '';

  constructor(
    private pagoService: PagoService,
    private clienteService: ClienteService,
  ) {}

  ngOnInit(): void {
    this.pago.fecha = getTodayDateOnly();

    this.clienteService.getClientes(1, 50).subscribe({
      next: (res: any) => {
        const page1 = Array.isArray(res?.data) ? res.data : [];
        const totalPages = Number(res?.meta?.totalPages ?? 1);

        if (totalPages > 1) {
          const requests = [] as any[];
          for (let page = 2; page <= totalPages; page++) {
            requests.push(this.clienteService.getClientes(page, 50));
          }

          forkJoin(requests.length ? requests : [of({ data: [] })]).subscribe({
            next: (pages: any[]) => {
              const rest = pages.flatMap((response) =>
                Array.isArray(response?.data) ? response.data : [],
              );
              const all = page1.concat(rest);
              this.clientes = all
                .map((cliente: any) => ({
                  id: cliente?.id,
                  nombre: `${cliente?.usuario?.nombres ?? ''} ${cliente?.usuario?.apellidos ?? ''}`.trim(),
                  cedula: cliente?.usuario?.cedula || '',
                }))
                .filter((cliente: any) => cliente.id)
                .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));

              this.todosLosClientes = [...this.clientes];
            },
            error: () => this.setClientes(page1),
          });
        } else {
          this.setClientes(page1);
        }
      },
      error: () => (this.clientes = []),
    });

    this.pagoService.getPlanes().subscribe({
      next: (planes) => (this.planes = Array.isArray(planes) ? planes : []),
      error: () => (this.planes = []),
    });

    this.pagoService.getClientePlanes().subscribe({
      next: (clientePlanes) =>
        (this.clientePlanes = Array.isArray(clientePlanes) ? clientePlanes : []),
      error: () => (this.clientePlanes = []),
    });
  }

  onClienteChange() {
    this.errorMessage = '';
    this.pago.clientePlanId = null as unknown as number;
    this.selectedPlan = null;
    this.selectedPlanId = null;
    this.detallesPlan = null;
    this.planActivoDelCliente = this.obtenerPlanVigente(this.selectedClienteId);

    if (this.planActivoDelCliente) {
      const nombrePlan = this.planActivoDelCliente?.plan?.nombre ?? 'el plan actual';
      const fechaFin = this.formatearFechaHumana(this.planActivoDelCliente?.fechaFin);
      this.planActivoMensaje = `No se puede asignar un nuevo plan porque ${nombrePlan} sigue activo hasta ${fechaFin}.`;
    } else {
      this.planActivoMensaje = '';
    }
  }

  onPlanChange() {
    const planId = Number(this.selectedPlanId);
    this.selectedPlan = this.planes.find((plan) => plan?.id === planId) ?? null;

    const existente = this.clientePlanes
      .filter((clientePlan) => clientePlan?.clienteId === this.selectedClienteId && clientePlan?.planId === planId)
      .sort(
        (a, b) =>
          new Date(b?.fechaInicio ?? 0).getTime() - new Date(a?.fechaInicio ?? 0).getTime(),
      )[0];

    if (existente) {
      this.pago.clientePlanId = existente.id;
      this.detallesPlan = {
        nombre: existente?.plan?.nombre ?? this.selectedPlan?.nombre ?? '—',
        fechaInicio: existente?.fechaInicio ?? '',
        fechaFin: existente?.fechaFin ?? '',
        activado: !!existente?.activado,
      };
    } else {
      const inicio = this.pago.fecha || getTodayDateOnly();
      const rangoFechas = buildPlanDateRange(
        inicio,
        Number(this.selectedPlan?.duracion ?? 1),
        this.getPlanUnit(this.selectedPlan?.unidadDuracion),
      );

      this.pago.clientePlanId = null as unknown as number;
      this.detallesPlan = {
        nombre: this.selectedPlan?.nombre ?? '—',
        fechaInicio: rangoFechas.fechaInicio,
        fechaFin: rangoFechas.fechaFin,
        activado: true,
      };
    }

    if (this.selectedPlan?.precio != null) {
      const precio = Number(this.selectedPlan.precio);
      if (!isNaN(precio)) this.pago.monto = precio;
    } else if (planId) {
      this.pagoService.getPlanById(planId).subscribe({
        next: (plan) => {
          const precio = Number(plan?.precio);
          if (!isNaN(precio)) this.pago.monto = precio;
        },
        error: () => {},
      });
    }

    if (!this.pago.fecha) {
      this.pago.fecha = getTodayDateOnly();
    }
  }

  guardar() {
    if (this.isSubmitting) return;

    this.errorMessage = '';
    this.isSubmitting = true;

    const planId = Number(this.selectedPlanId);
    const clienteId = Number(this.selectedClienteId);
    const monto = Number(this.pago.monto);
    const fechaPago = this.pago.fecha;

    const crearPagoCon = (clientePlanId: number) => {
      const payload = { clientePlanId, monto, fecha: fechaPago };
      this.pagoService.createPago(payload).subscribe({
        next: (response) => {
          this.save.emit(response);
          this.isSubmitting = false;
          this.cerrar();
        },
        error: (error) => this.manejarError(error),
      });
    };

    if (this.pago.clientePlanId) {
      crearPagoCon(Number(this.pago.clientePlanId));
      return;
    }

    const planVigente = this.obtenerPlanVigente(clienteId);
    if (planVigente) {
      const nombrePlan = planVigente?.plan?.nombre ?? 'el plan actual';
      const fechaFin = this.formatearFechaHumana(planVigente?.fechaFin);
      this.errorMessage = `No se puede asignar un nuevo plan porque ${nombrePlan} termina el ${fechaFin}.`;
      this.isSubmitting = false;
      return;
    }

    const fechaInicio = this.detallesPlan?.fechaInicio || getTodayDateOnly();
    const rangoFechas = buildPlanDateRange(
      fechaInicio,
      Number(this.selectedPlan?.duracion ?? 1),
      this.getPlanUnit(this.selectedPlan?.unidadDuracion),
    );

    this.pagoService
      .createClientePlan({
        clienteId,
        planId,
        ...rangoFechas,
        activado: true,
      })
      .subscribe({
        next: (clientePlan) => {
          const id = Number(clientePlan?.id);
          if (!isNaN(id)) {
            crearPagoCon(id);
            return;
          }

          this.manejarError({
            error: { message: 'No se pudo crear la relación Cliente-Plan' },
          });
        },
        error: (error) => this.manejarError(error),
      });
  }

  cerrar() {
    this.errorMessage = '';
    this.isSubmitting = false;
    this.resetFormulario();
    this.close.emit();
  }

  private crearPagoInicial() {
    return {
      clientePlanId: null as unknown as number,
      monto: null as unknown as number,
      fecha: '',
    };
  }

  private resetFormulario() {
    this.pago = this.crearPagoInicial();
    this.pagoForm?.resetForm(this.pago);
  }

  private setClientes(data: any[]) {
    this.clientes = (Array.isArray(data) ? data : [])
      .map((cliente: any) => ({
        id: cliente?.id,
        nombre: `${cliente?.usuario?.nombres ?? ''} ${cliente?.usuario?.apellidos ?? ''}`.trim(),
        cedula: cliente?.usuario?.cedula || '',
      }))
      .filter((cliente: any) => cliente.id)
      .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));

    this.todosLosClientes = [...this.clientes];
  }

  filtrarClientes() {
    const term = (this.searchTermCliente || '').toLowerCase().trim();
    this.showSuggestions = true;

    if (!term) {
      this.clientes = [...this.todosLosClientes];
      return;
    }

    this.clientes = this.todosLosClientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(term) ||
        cliente.cedula.toLowerCase().includes(term),
    );
  }

  selectCliente(cliente: { id: number; nombre: string; cedula: string }) {
    this.selectedClienteId = cliente.id;
    this.searchTermCliente = `${cliente.nombre} - ${cliente.cedula}`;
    this.showSuggestions = false;
    this.onClienteChange();
  }

  private manejarError(error: any) {
    this.errorMessage = extractErrorMessage(error, 'Ocurrió un error al registrar el pago');
    this.isSubmitting = false;
  }

  calcularDeuda() {
    const precioPlan = Number(this.selectedPlan?.precio || 0);
    const montoPago = Number(this.pago.monto || 0);

    if (montoPago > 0 && montoPago < precioPlan) {
      this.deudaCalculada = precioPlan - montoPago;
      this.mensajeAdvertencia = '';
    } else if (montoPago > precioPlan && precioPlan > 0) {
      this.deudaCalculada = 0;
      this.mensajeAdvertencia = 'El pago supera el precio del plan';
    } else {
      this.deudaCalculada = 0;
      this.mensajeAdvertencia = '';
    }
  }

  private obtenerPlanVigente(clienteId: number | null): any | null {
    if (!clienteId || !Array.isArray(this.clientePlanes)) return null;
    const hoy = new Date();
    const planesCliente = this.clientePlanes.filter((clientePlan) => clientePlan?.clienteId === clienteId);

    return (
      planesCliente
        .sort(
          (a, b) => new Date(b?.fechaFin ?? 0).getTime() - new Date(a?.fechaFin ?? 0).getTime(),
        )
        .find((clientePlan) => {
          if (!clientePlan) return false;
          const fin = new Date(clientePlan?.fechaFin ?? '');
          return !!clientePlan.activado && !isNaN(fin.getTime()) && fin >= hoy;
        }) ?? null
    );
  }

  private formatearFechaHumana(fechaISO?: string): string {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) return fechaISO;
    return fecha.toLocaleDateString();
  }

  private getPlanUnit(unidadDuracion: unknown): PlanDurationUnit {
    return unidadDuracion === 'DIAS' ? 'DIAS' : 'MESES';
  }
}
