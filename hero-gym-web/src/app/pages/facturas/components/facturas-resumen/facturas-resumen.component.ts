import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Factura } from '../../../../core/services/factura.service';

@Component({
  selector: 'app-facturas-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facturas-resumen.component.html',
  styleUrl: './facturas-resumen.component.css',
})
export class FacturasResumenComponent implements OnChanges {
  @Input() facturas: Factura[] = [];

  totalFacturas: number = 0;
  facturasPagadas: number = 0;
  personasPendientes: number = 0;
  ingresoMes: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['facturas']) {
      this.calcularResumen();
    }
  }

  private calcularResumen() {
    this.totalFacturas = this.facturas.length;

    // Facturas Pagadas
    this.facturasPagadas = this.facturas.filter(f => f.estado === 'PAGADA').length;

    // Personas Pendientes (Unique clients with PENDIENTE invoices)
    const pendientes = this.facturas.filter(f => f.estado === 'PENDIENTE');
    const uniqueClientes = new Set(pendientes.map(f => f.clientePlan.cliente.usuario.cedula));
    this.personasPendientes = uniqueClientes.size;

    // Ingreso del Mes (Sum totalPagado of invoices emitted this month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    this.ingresoMes = this.facturas
      .filter(f => {
        const fecha = new Date(f.fechaEmision);
        return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + (curr.totalPagado || 0), 0);
  }
}
