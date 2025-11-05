import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ProductoService } from '../../../../core/services/producto.service';


@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './productos-lista.component.html',
})
export class ProductosListaComponent implements OnInit {
  @Input() searchTerm: string = '';

  productos: any[] = [];
  totalProductos = 0;
  isLoading = true;
  page = 1;
  limit = 10;

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  ngOnChanges() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.isLoading = true;

    this.productoService.getProductos(this.page, this.limit).subscribe({
      next: (res) => {
        this.productos = res.data.filter((p) =>
          p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
        this.totalProductos = res.meta.totalItems;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.isLoading = false;
      },
    });
  }

  eliminarProducto(id: number) {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      this.productoService.deleteProducto(id).subscribe({
        next: () => this.cargarProductos(),
        error: (err) => console.error('Error eliminando producto:', err),
      });
    }
  }

  editarProducto(producto: any) {
    // Aquí luego conectas el formulario de edición
    console.log('Editar producto:', producto);
  }
}
