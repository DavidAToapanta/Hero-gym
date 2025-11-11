import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ProductoService } from '../../../../core/services/producto.service';


@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './productos-lista.component.html',
})
export class ProductosListaComponent implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  @Output() edit = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<void>();

  productos: any[] = [];
  totalProductos = 0;
  isLoading = true;

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchTerm'] && !changes['searchTerm'].firstChange) {
      this.cargarProductos();
    }
  }

  cargarProductos() {
    this.isLoading = true;

    this.productoService.getProductos(this.searchTerm.trim()).subscribe({
      next: (productos) => {
        this.productos = productos;
        this.totalProductos = productos.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.isLoading = false;
      },
    });
  }

  recargar() {
    this.cargarProductos();
  }

  eliminarProducto(id: number) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      this.productoService.deleteProducto(id).subscribe({
        next: () => {
          this.cargarProductos();
          this.deleted.emit();
        },
        error: (err) => console.error('Error eliminando producto:', err),
      });
    }
  }

  editarProducto(producto: any) {
    this.edit.emit(producto);
  }
}
