import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PagoService } from '../../../../core/services/pago.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { forkJoin, of } from 'rxjs';

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
  clientes: { id: number; nombre: string }[] = [];
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

  constructor(private pagoService: PagoService, private clienteService: ClienteService) {}

  ngOnInit(): void {
    // Prefijar fecha de pago a hoy
    this.pago.fecha = this.hoyISO();

    // Cargar todos los clientes (paginado grande)
    this.clienteService.getClientes(1, 50).subscribe({
      next: (res: any) => {
        const page1 = Array.isArray(res?.data) ? res.data : [];
        const totalPages = Number(res?.meta?.totalPages ?? 1);
        if (totalPages > 1) {
          const requests = [] as any[];
          for (let p = 2; p <= totalPages; p++) {
            requests.push(this.clienteService.getClientes(p, 50));
          }
          forkJoin(requests.length ? requests : [of({ data: [] })]).subscribe({
            next: (pages: any[]) => {
              const rest = pages.flatMap((r) => (Array.isArray(r?.data) ? r.data : []));
              const all = page1.concat(rest);
              this.clientes = all
                .map((c: any) => ({ id: c?.id, nombre: `${c?.usuario?.nombres ?? ''} ${c?.usuario?.apellidos ?? ''}`.trim() }))
                .filter((x: any) => x.id)
                .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
            },
            error: () => this.setClientes(page1),
          });
        } else {
          this.setClientes(page1);
        }
      },
      error: () => (this.clientes = []),
    });

    // Cargar todos los planes
    this.pagoService.getPlanes().subscribe({
      next: (planes) => (this.planes = Array.isArray(planes) ? planes : []),
      error: () => (this.planes = []),
    });

    // Cargar relaciones cliente-plan para asociar si existe
    this.pagoService.getClientePlanes().subscribe({
      next: (cp) => (this.clientePlanes = Array.isArray(cp) ? cp : []),
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
    this.selectedPlan = this.planes.find((p) => p?.id === planId) ?? null;

    // Buscar si ya existe una relación cliente-plan para este cliente y plan
    const existente = this.clientePlanes
      .filter((x) => x?.clienteId === this.selectedClienteId && x?.planId === planId)
      .sort((a, b) => new Date(b?.fechaInicio ?? 0).getTime() - new Date(a?.fechaInicio ?? 0).getTime())[0];

    if (existente) {
      this.pago.clientePlanId = existente.id;
      this.detallesPlan = {
        nombre: existente?.plan?.nombre ?? this.selectedPlan?.nombre ?? '—',
        fechaInicio: existente?.fechaInicio ?? '',
        fechaFin: existente?.fechaFin ?? '',
        activado: !!existente?.activado,
      };
    } else {
      // No existe relación todavía: proponer fechas con base en el plan
      const inicio = this.pago.fecha || this.hoyISO();
      const fin = this.sumarMesesISO(inicio, Number(this.selectedPlan?.mesesPagar ?? 1));
      this.pago.clientePlanId = null as unknown as number;
      this.detallesPlan = {
        nombre: this.selectedPlan?.nombre ?? '—',
        fechaInicio: inicio,
        fechaFin: fin,
        activado: true,
      };
    }

    // Autocompletar monto con precio del plan
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

    if (!this.pago.fecha) this.pago.fecha = this.hoyISO();
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
        next: (res) => {
          this.save.emit(res);
          this.isSubmitting = false;
          this.cerrar();
        },
        error: (error) => this.manejarError(error),
      });
    };

    if (this.pago.clientePlanId) {
      crearPagoCon(Number(this.pago.clientePlanId));
    } else {
      const planVigente = this.obtenerPlanVigente(clienteId);
      if (planVigente) {
        const nombrePlan = planVigente?.plan?.nombre ?? 'el plan actual';
        const fechaFin = this.formatearFechaHumana(planVigente?.fechaFin);
        this.errorMessage = `No se puede asignar un nuevo plan porque ${nombrePlan} termina el ${fechaFin}.`;
        this.isSubmitting = false;
        return;
      }

      const fechaInicio = this.detallesPlan?.fechaInicio || this.hoyISO();
      const meses = Number(this.selectedPlan?.mesesPagar ?? 1);
      const fechaFin = this.sumarMesesISO(fechaInicio, meses);
      const diaPago = new Date(fechaInicio).getDate();
      this.pagoService
        .createClientePlan({ clienteId, planId, fechaInicio, fechaFin, diaPago, activado: true })
        .subscribe({
          next: (cp) => {
            const id = Number(cp?.id);
            if (!isNaN(id)) crearPagoCon(id);
            else this.manejarError({ error: { message: 'No se pudo crear la relación Cliente-Plan' } });
          },
          error: (error) => this.manejarError(error),
        });
    }
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

  private hoyISO(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private setClientes(data: any[]) {
    this.clientes = (Array.isArray(data) ? data : [])
      .map((c: any) => ({ id: c?.id, nombre: `${c?.usuario?.nombres ?? ''} ${c?.usuario?.apellidos ?? ''}`.trim() }))
      .filter((x: any) => x.id)
      .sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
  }

  private sumarMesesISO(fechaISO: string, meses: number): string {
    const [y, m, d] = fechaISO.split('-').map((x) => Number(x));
    const dt = new Date(y, (m - 1) + meses, d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private manejarError(error: any) {
    const mensaje = error?.error?.message;
    this.errorMessage =
      typeof mensaje === 'string'
        ? mensaje
        : Array.isArray(mensaje) && mensaje.length > 0
        ? mensaje.join('. ')
        : 'Ocurrió un error al registrar el pago';
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
    const planesCliente = this.clientePlanes.filter((cp) => cp?.clienteId === clienteId);
    return planesCliente
      .sort((a, b) => new Date(b?.fechaFin ?? 0).getTime() - new Date(a?.fechaFin ?? 0).getTime())
      .find((cp) => {
        if (!cp) return false;
        const fin = new Date(cp?.fechaFin ?? '');
        return !!cp.activado && !isNaN(fin.getTime()) && fin >= hoy;
      }) ?? null;
  }

  private formatearFechaHumana(fechaISO?: string): string {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    if (isNaN(fecha.getTime())) return fechaISO;
    return fecha.toLocaleDateString();
  }
}
