import { Component } from '@angular/core';
import { ProductosListaComponent } from './components/productos-lista/productos-lista.component';
import { ProductosBusquedaComponent } from "./components/productos-busqueda/productos-busqueda.component";

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [ProductosListaComponent, ProductosBusquedaComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent {

}
