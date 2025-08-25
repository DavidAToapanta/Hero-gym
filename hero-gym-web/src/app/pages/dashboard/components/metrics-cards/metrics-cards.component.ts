import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ClientePlanService } from '../../../../core/services/cliente-plan.service';
import { PagoService } from '../../../../core/services/pago.service';
import { DeudaService } from '../../../../core/services/deuda.service';

@Component({
  selector: 'app-metrics-cards',
  templateUrl: './metrics-cards.component.html',
  imports: [CurrencyPipe],
  standalone: true
})
export class MetricsCardsComponent implements OnInit {
  miembrosActivos: number = 0;
  ingresosMes: number  =  0;
  pagosPendientes: number = 0;

  loadingg = false;

  constructor(
    private clientePlanService: ClientePlanService,
    private pagoService: PagoService,
    private deudaService: DeudaService
  ) {}

  ngOnInit(): void {
    this.cargarMiembrosActivos();
    this.cargarIngresosMes();
    this.cargarDeudores();
  }



  private cargarMiembrosActivos(): void {
    this.clientePlanService.getClientesActivos().subscribe({
      next: (res) => {
        this.miembrosActivos = res.activos;
      },
      error: (err) => {
        console.error('Error obteniendo miembros activos', err);
      }
    });
  }

  private cargarIngresosMes(): void {
    this.pagoService.getIngresosDelMes().subscribe({
      next: (res) => {
        //si el backend devuelve { ingresos: 1250}
        this.ingresosMes = (res as any).ingresos ?? res;
      },
      error: (err) => console.error('Error ingreso mes:', err)
    });
  }
  
  private cargarDeudores() {
    this.deudaService.getDeudoresCount().subscribe({
      next: (res) => this.pagosPendientes = Number(res?.total ?? 0),
      error: (err) => console.error('Error deudores:', err),
    });
  }
}
