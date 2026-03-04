import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Pago, PagoService } from '../../../../core/services/pago.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonTableComponent } from '../../../../shared/loaders/skeleton-table/skeleton-table.component';

@Component({
  selector: 'app-pagos-lista',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ConfirmDialogComponent, SkeletonTableComponent],
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
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  
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

  cargarPagos(page = 1): void {
    this.isLoading = true;
    this.pagoService.getPagos(page, this.itemsPerPage, this.searchTerm).subscribe({
      next: (response) => {
        this.pagos = response.data || [];
        this.filteredPagos = this.pagos; // No client-side filter needed for list view, but keeping variable for template compatibility
        const meta = response.meta;
        this.totalPagos = meta?.totalItems || 0;
        this.totalPages = meta?.totalPages || 0;
        this.currentPage = meta?.currentPage || page;
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
    // Client-side filtering replaced by server-side search
    this.cargarPagos(1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.cargarPagos(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.cargarPagos(this.currentPage - 1);
    }
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
