
import { Component, ViewChild } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ClientesBusquedaComponent } from "../clientes/components/clientes-busqueda/clientes-busqueda.component";
import { PagosBusquedaComponent } from "./components/pagos-busqueda/pagos-busqueda.component";
import { PagosListaComponent } from "./components/pagos-lista/pagos-lista.component";
import { PagosFormularioComponent } from "./components/pagos-formulario/pagos-formulario.component";

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [LucideAngularModule, PagosBusquedaComponent, PagosListaComponent, PagosFormularioComponent],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent {
  @ViewChild(PagosListaComponent) listaComponent?: PagosListaComponent;
  terminoActual = '';
  mostrarFormulario = false;

  toastVisible = false;
  toastMessage = '';

  buscarPagos(termino: string) {
    this.terminoActual = termino;
  }

  onGuardarPago(pago: any) {
    this.mostrarFormulario = false;
    this.listaComponent?.recargar();
    this.showToast('Pago registrado correctamente');
  }

  onErrorLista(msg: string) {
    this.showToast(msg);
  }

  nuevoPago() {
    this.mostrarFormulario = true;
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 3000);
  }
}
