import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Factura } from '../../../../core/services/factura.service';
import { PagoService } from '../../../../core/services/pago.service';

@Component({
  selector: 'app-facturas-tabla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturas-tabla.component.html'
})
export class FacturasTablaComponent {
  @Input() facturas: Factura[] = [];
  @Input() isLoading: boolean = false;
  @Output() imprimir = new EventEmitter<Factura>();
  @Output() pagoRealizado = new EventEmitter<void>();

  // Payment dialog state
  showPaymentDialog = false;
  selectedFactura: Factura | null = null;
  montoPago = 0;
  errorMessage = '';
  successMessage = '';
  isProcessing = false;

  constructor(private pagoService: PagoService) {}

  onImprimir(factura: Factura) {
    this.imprimir.emit(factura);
  }

  onPagarDeuda(factura: Factura) {
    // Verificar si tiene deuda
    if (factura.saldo <= 0) {
      this.errorMessage = 'El usuario no tiene deuda';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    // Abrir diálogo de pago
    this.selectedFactura = factura;
    this.montoPago = factura.saldo; // Por defecto, el monto completo
    this.showPaymentDialog = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cerrarDialogo() {
    this.showPaymentDialog = false;
    this.selectedFactura = null;
    this.montoPago = 0;
    this.errorMessage = '';
    this.successMessage = '';
  }

  procesarPago() {
    if (!this.selectedFactura) return;

    // Validaciones
    if (this.montoPago <= 0) {
      this.errorMessage = 'El monto debe ser mayor a 0';
      return;
    }

    if (this.montoPago > this.selectedFactura.saldo) {
      this.errorMessage = `El monto no puede superar la deuda de $${this.selectedFactura.saldo.toFixed(2)}`;
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    const pagoData = {
      clientePlanId: this.selectedFactura.clientePlanId,
      monto: this.montoPago,
      fecha: new Date().toISOString()
    };

    this.pagoService.createPago(pagoData).subscribe({
      next: (response) => {
        this.successMessage = `Pago de $${this.montoPago.toFixed(2)} realizado exitosamente`;
        this.isProcessing = false;
        
        // Actualizar el saldo localmente
        if (this.selectedFactura) {
          this.selectedFactura.totalPagado += this.montoPago;
          this.selectedFactura.saldo -= this.montoPago;
          
          // Actualizar estado si se pagó completamente
          if (this.selectedFactura.saldo <= 0) {
            this.selectedFactura.estado = 'PAGADA';
          }
        }

        // Emitir evento para recargar datos
        this.pagoRealizado.emit();

        // Cerrar diálogo después de 2 segundos
        setTimeout(() => {
          this.cerrarDialogo();
        }, 2000);
      },
      error: (err) => {
        console.error('Error al procesar pago:', err);
        this.errorMessage = 'Error al procesar el pago. Por favor, intente nuevamente.';
        this.isProcessing = false;
      }
    });
  }

  getClassEstado(estado: string): string {
    switch (estado) {
      case 'PAGADA': return 'bg-green-100 text-green-800';
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ANULADA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
