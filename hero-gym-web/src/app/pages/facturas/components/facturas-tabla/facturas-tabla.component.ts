import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Factura,
  FacturaService,
} from '../../../../core/services/factura.service';
import { PagoService } from '../../../../core/services/pago.service';
import { extractErrorMessage } from '../../../../core/utils/http-error.utils';

@Component({
  selector: 'app-facturas-tabla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturas-tabla.component.html',
})
export class FacturasTablaComponent {
  @Input() facturas: Factura[] = [];
  @Input() isLoading = false;
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() itemsPerPage = 10;
  @Input() totalPages = 0;

  @Output() imprimir = new EventEmitter<Factura>();
  @Output() pagoRealizado = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();

  // Payment dialog state
  showPaymentDialog = false;
  selectedFactura: Factura | null = null;
  montoPago = 0;
  paymentErrorMessage = '';
  paymentSuccessMessage = '';
  isPaymentProcessing = false;

  // Refund dialog state
  showRefundDialog = false;
  selectedFacturaRefund: Factura | null = null;
  montoDevolver = 0;
  motivoDevolucion = '';
  refundErrorMessage = '';
  refundSuccessMessage = '';
  isRefundProcessing = false;

  // Global action feedback (outside dialogs)
  actionErrorMessage = '';

  constructor(
    private pagoService: PagoService,
    private facturaService: FacturaService,
  ) {}

  onImprimir(factura: Factura): void {
    this.imprimir.emit(factura);
  }

  tieneDevolucionPendiente(factura: Factura): boolean {
    return Number(factura.devolucionPendiente || 0) > 0.009;
  }

  tieneSaldoPendiente(factura: Factura): boolean {
    if (this.tieneDevolucionPendiente(factura)) {
      return false;
    }
    return Number(factura.saldo || 0) > 0.009;
  }

  getEstadoVisual(factura: Factura): 'PAGADA' | 'PENDIENTE' | 'ANULADA' | 'DEVOLVER' {
    if (this.tieneDevolucionPendiente(factura)) {
      return 'DEVOLVER';
    }
    return factura.estado;
  }

  getClaseEstadoVisual(factura: Factura): string {
    const estadoVisual = this.getEstadoVisual(factura);

    switch (estadoVisual) {
      case 'DEVOLVER':
        return 'bg-amber-100 text-amber-800 ring-1 ring-amber-300';
      case 'PAGADA':
        return 'bg-green-100 text-green-800 ring-1 ring-green-300';
      case 'PENDIENTE':
        return 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-300';
      case 'ANULADA':
        return 'bg-red-100 text-red-800 ring-1 ring-red-300';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-300';
    }
  }

  getEtiquetaPendiente(factura: Factura): string {
    if (this.tieneDevolucionPendiente(factura)) {
      return 'Pendiente por devolver';
    }
    if (this.tieneSaldoPendiente(factura)) {
      return 'Saldo pendiente';
    }
    return 'Sin pendiente';
  }

  getValorPendiente(factura: Factura): number {
    if (this.tieneDevolucionPendiente(factura)) {
      return Number(factura.devolucionPendiente || 0);
    }
    if (this.tieneSaldoPendiente(factura)) {
      return Number(factura.saldo || 0);
    }
    return 0;
  }

  getClasePendiente(factura: Factura): string {
    if (this.tieneDevolucionPendiente(factura)) {
      return 'text-amber-700';
    }
    if (this.tieneSaldoPendiente(factura)) {
      return 'text-red-600';
    }
    return 'text-gray-500';
  }

  onPagarDeuda(factura: Factura): void {
    if (!this.tieneSaldoPendiente(factura)) {
      this.mostrarErrorAccion('Esta factura no tiene saldo pendiente por pagar');
      return;
    }

    this.cerrarDialogoDevolucion();

    this.selectedFactura = factura;
    this.montoPago = Number(factura.saldo || 0);
    this.showPaymentDialog = true;
    this.paymentErrorMessage = '';
    this.paymentSuccessMessage = '';
  }

  cerrarDialogoPago(): void {
    this.showPaymentDialog = false;
    this.selectedFactura = null;
    this.montoPago = 0;
    this.paymentErrorMessage = '';
    this.paymentSuccessMessage = '';
    this.isPaymentProcessing = false;
  }

  procesarPago(): void {
    if (!this.selectedFactura) {
      return;
    }

    const saldoActual = Number(this.selectedFactura.saldo || 0);

    if (this.montoPago <= 0) {
      this.paymentErrorMessage = 'El monto debe ser mayor a 0';
      return;
    }

    if (this.montoPago > saldoActual) {
      this.paymentErrorMessage = `El monto no puede superar la deuda de $${saldoActual.toFixed(2)}`;
      return;
    }

    this.isPaymentProcessing = true;
    this.paymentErrorMessage = '';

    const pagoData = {
      clientePlanId: this.selectedFactura.clientePlanId,
      monto: this.montoPago,
      fecha: new Date().toISOString(),
    };

    this.pagoService.createPago(pagoData).subscribe({
      next: () => {
        this.paymentSuccessMessage = `Pago de $${this.montoPago.toFixed(2)} realizado correctamente`;
        this.isPaymentProcessing = false;

        if (this.selectedFactura) {
          this.selectedFactura.totalPagado = Number(
            (this.selectedFactura.totalPagado + this.montoPago).toFixed(2),
          );
          const saldoActualizado = Number(
            (this.selectedFactura.saldo - this.montoPago).toFixed(2),
          );
          this.selectedFactura.saldo = saldoActualizado <= 0.009 ? 0 : saldoActualizado;

          if (this.selectedFactura.saldo === 0) {
            this.selectedFactura.estado = 'PAGADA';
          }
        }

        this.pagoRealizado.emit();

        setTimeout(() => {
          this.cerrarDialogoPago();
        }, 1800);
      },
      error: (err) => {
        console.error('Error al procesar pago:', err);
        this.paymentErrorMessage = extractErrorMessage(
          err,
          'Error al procesar el pago. Por favor, intente nuevamente.',
        );
        this.isPaymentProcessing = false;
      },
    });
  }

  onAbrirDevolucion(factura: Factura): void {
    if (!this.tieneDevolucionPendiente(factura)) {
      this.mostrarErrorAccion('Esta factura no tiene montos pendientes por devolver');
      return;
    }

    this.cerrarDialogoPago();

    this.selectedFacturaRefund = factura;
    this.montoDevolver = Number(factura.devolucionPendiente || 0);
    this.motivoDevolucion = '';
    this.refundErrorMessage = '';
    this.refundSuccessMessage = '';
    this.showRefundDialog = true;
  }

  cerrarDialogoDevolucion(): void {
    this.showRefundDialog = false;
    this.selectedFacturaRefund = null;
    this.montoDevolver = 0;
    this.motivoDevolucion = '';
    this.refundErrorMessage = '';
    this.refundSuccessMessage = '';
    this.isRefundProcessing = false;
  }

  procesarDevolucion(): void {
    if (!this.selectedFacturaRefund) {
      return;
    }

    const pendienteActual = Number(this.selectedFacturaRefund.devolucionPendiente || 0);

    if (this.montoDevolver <= 0) {
      this.refundErrorMessage = 'El monto debe ser mayor a 0';
      return;
    }

    if (this.montoDevolver > pendienteActual) {
      this.refundErrorMessage = `El monto no puede superar el pendiente por devolver de $${pendienteActual.toFixed(2)}`;
      return;
    }

    this.isRefundProcessing = true;
    this.refundErrorMessage = '';

    this.facturaService
      .devolver(
        this.selectedFacturaRefund.id,
        this.montoDevolver,
        this.motivoDevolucion,
      )
      .subscribe({
        next: (response) => {
          const montoDevuelto = Number(this.montoDevolver.toFixed(2));
          const pendienteRestante = Number(
            (response.devolucionPendiente ?? pendienteActual - montoDevuelto).toFixed(
              2,
            ),
          );

          if (this.selectedFacturaRefund) {
            this.selectedFacturaRefund.devolucionPendiente =
              pendienteRestante <= 0.009 ? 0 : pendienteRestante;
            this.selectedFacturaRefund.devolucionDevueltaAcumulada = Number(
              (response.devolucionDevueltaAcumulada ?? 0).toFixed(2),
            );
            this.selectedFacturaRefund.estadoDevolucion = response.estadoDevolucion;
          }

          const pendientesTexto =
            pendienteRestante > 0
              ? ` Quedan $${pendienteRestante.toFixed(2)} pendientes por devolver.`
              : ' No quedan montos pendientes por devolver.';

          this.refundSuccessMessage = `Se devolvieron $${montoDevuelto.toFixed(2)} correctamente.${pendientesTexto}`;
          this.isRefundProcessing = false;

          this.pagoRealizado.emit();

          setTimeout(() => {
            this.cerrarDialogoDevolucion();
          }, 2200);
        },
        error: (err) => {
          console.error('Error al procesar devolucion:', err);
          this.refundErrorMessage = extractErrorMessage(
            err,
            'Error al registrar la devolucion. Por favor, intente nuevamente.',
          );
          this.isRefundProcessing = false;
        },
      });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  private mostrarErrorAccion(mensaje: string): void {
    this.actionErrorMessage = mensaje;
    setTimeout(() => {
      this.actionErrorMessage = '';
    }, 3000);
  }
}
