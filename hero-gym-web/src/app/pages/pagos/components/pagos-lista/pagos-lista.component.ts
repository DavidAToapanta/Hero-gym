import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Pago, PagoService } from '../../../../core/services/pago.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-pagos-lista',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './pagos-lista.component.html',
  styleUrl: './pagos-lista.component.css',
})
export class PagosListaComponent implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  @Output() error = new EventEmitter<string>();

  pagos: Pago[] = [];
  filteredPagos: Pago[] = [];
  isLoading = true;
  totalPagos = 0;
  
  // Confirmation dialog state
  showConfirmDialog = false;
  pagoToDelete: number | null = null;

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    this.cargarPagos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] && !changes['searchTerm'].firstChange) {
      this.aplicarFiltro();
    }
  }

  cargarPagos(): void {
    this.isLoading = true;
    this.pagoService.getPagos().subscribe({
      next: (pagos) => {
        this.pagos = Array.isArray(pagos) ? pagos : [];
        this.totalPagos = this.pagos.length;
        this.aplicarFiltro();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando pagos:', err);
        this.isLoading = false;
        this.error.emit('No se pudieron cargar los pagos.');
      },
    });
  }

  recargar(): void {
    this.cargarPagos();
  }

  private aplicarFiltro(): void {
    const termino = (this.searchTerm || '').toLowerCase();
    if (!termino) {
      this.filteredPagos = this.pagos;
      return;
    }

    this.filteredPagos = this.pagos.filter((p) => {
      const monto = String(p?.monto ?? '').toLowerCase();
      const fecha = String(p?.fecha ?? '').toLowerCase();
      const nombres = `${p?.clientePlan?.cliente?.usuario?.nombres ?? ''} ${p?.clientePlan?.cliente?.usuario?.apellidos ?? ''}`.toLowerCase();
      const plan = String(p?.clientePlan?.plan?.nombre ?? '').toLowerCase();
      return (
        monto.includes(termino) ||
        fecha.includes(termino) ||
        nombres.includes(termino) ||
        plan.includes(termino)
      );
    });
  }

  eliminar(id: number) {
    this.pagoToDelete = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete() {
    if (this.pagoToDelete === null) return;
    
    console.log('[PagosLista] Eliminando pago con ID:', this.pagoToDelete);
    this.pagoService.deletePago(this.pagoToDelete).subscribe({
      next: () => {
        console.log('[PagosLista] Pago eliminado exitosamente');
        alert('Pago eliminado exitosamente');
        this.cargarPagos();
        this.showConfirmDialog = false;
        this.pagoToDelete = null;
      },
      error: (err) => {
        console.error('[PagosLista] Error eliminando pago:', err);
        const mensaje = err.error?.message || err.message || 'Error desconocido';
        alert(`Error al eliminar el pago: ${mensaje}`);
        this.error.emit('No se pudo eliminar el pago.');
        this.showConfirmDialog = false;
        this.pagoToDelete = null;
      },
    });
  }

  onCancelDelete() {
    console.log('[PagosLista] Eliminación cancelada');
    this.showConfirmDialog = false;
    this.pagoToDelete = null;
  }
}
