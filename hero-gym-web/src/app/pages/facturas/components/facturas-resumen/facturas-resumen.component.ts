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
export class FacturasResumenComponent {
  @Input() stats: any = {
    totalFacturas: 0,
    facturasPagadas: 0,
    personasPendientes: 0,
    ingresoMes: 0
  };
}
