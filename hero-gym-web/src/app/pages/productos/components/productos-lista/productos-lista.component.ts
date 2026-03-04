import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ProductoService } from '../../../../core/services/producto.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './productos-lista.component.html',
})
export class ProductosListaComponent implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  @Output() edit = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<void>();

  productos: any[] = [];
  totalProductos = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  isLoading = true;
  
  // Confirmation dialog state
  showConfirmDialog = false;
  productoToDelete: number | null = null;

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchTerm'] && !changes['searchTerm'].firstChange) {
      this.cargarProductos();
    }
  }

  cargarProductos(page = 1) {
    this.isLoading = true;

    this.productoService.getProductos(page, this.itemsPerPage, this.searchTerm.trim()).subscribe({
      next: (response) => {
        this.productos = response.data || [];
        const meta = response.meta;
        this.totalProductos = meta?.totalItems || 0;
        this.totalPages = meta?.totalPages || 0;
        this.currentPage = meta?.currentPage || page;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.isLoading = false;
      },
    });
  }

  recargar() {
    this.cargarProductos(this.currentPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.cargarProductos(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.cargarProductos(this.currentPage - 1);
    }
  }

  eliminarProducto(id: number) {
    this.productoToDelete = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete() {
    if (this.productoToDelete === null) return;
    
    console.log('[ProductosLista] Eliminando producto con ID:', this.productoToDelete);
    this.productoService.deleteProducto(this.productoToDelete).subscribe({
      next: () => {
        console.log('[ProductosLista] Producto eliminado exitosamente');
        alert('Producto eliminado exitosamente');
        this.cargarProductos();
        this.deleted.emit();
        this.showConfirmDialog = false;
        this.productoToDelete = null;
      },
      error: (err) => {
        console.error('[ProductosLista] Error eliminando producto:', err);
        const mensaje = err.error?.message || err.message || 'Error desconocido';
        alert(`Error al eliminar el producto: ${mensaje}`);
        this.showConfirmDialog = false;
        this.productoToDelete = null;
      },
    });
  }

  onCancelDelete() {
    console.log('[ProductosLista] Eliminación cancelada');
    this.showConfirmDialog = false;
    this.productoToDelete = null;
  }

  editarProducto(producto: any) {
    this.edit.emit(producto);
  }
}
