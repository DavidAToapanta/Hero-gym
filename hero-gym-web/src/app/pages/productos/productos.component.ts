import { Component, ViewChild } from '@angular/core';

import { LucideAngularModule } from 'lucide-angular';
import { ProductosListaComponent } from './components/productos-lista/productos-lista.component';
import { ProductosBusquedaComponent } from "./components/productos-busqueda/productos-busqueda.component";
import { ProductosFormularioComponent } from "./components/productos-formulario/productos-formulario.component";

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    LucideAngularModule,
    ProductosListaComponent,
    ProductosBusquedaComponent,
    ProductosFormularioComponent
],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent {
  @ViewChild(ProductosListaComponent) listaComponent?: ProductosListaComponent;
  terminoActual = '';
  mostrarFormulario = false;
  productoEditando: any | null = null;

  toastVisible = false;
  toastMessage = '';

  buscarProductos(termino: string) {
    this.terminoActual = termino;
  }

  onGuardarProducto(producto: any) {
    this.mostrarFormulario = false;
    this.listaComponent?.cargarProductos();
    this.showToast(this.productoEditando ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
    this.productoEditando = null;
  }

  onEditarProducto(producto: any) {
    this.productoEditando = producto;
    this.mostrarFormulario = true;
  }

  onProductoEliminado() {
    this.showToast('Producto eliminado correctamente');
  }

  nuevoProducto() {
    this.productoEditando = null;
    this.mostrarFormulario = true;
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 3000);
  }
}
