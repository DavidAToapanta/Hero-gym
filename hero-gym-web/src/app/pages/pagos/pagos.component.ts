
import { Component, ViewChild } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { IngresoRapidoFormularioComponent } from './components/ingreso-rapido-formulario/ingreso-rapido-formulario.component';
import { PagosBusquedaComponent } from './components/pagos-busqueda/pagos-busqueda.component';
import { PagosFormularioComponent } from './components/pagos-formulario/pagos-formulario.component';
import { PagosListaComponent } from './components/pagos-lista/pagos-lista.component';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    LucideAngularModule,
    PagosBusquedaComponent,
    PagosListaComponent,
    PagosFormularioComponent,
    IngresoRapidoFormularioComponent,
  ],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css'],
})
export class PagosComponent {
  @ViewChild(PagosListaComponent) listaComponent?: PagosListaComponent;
  terminoActual = '';
  mostrarFormulario = false;
  mostrarIngresoRapido = false;

  toastVisible = false;
  toastMessage = '';

  buscarPagos(termino: string) {
    this.terminoActual = termino;
  }

  onGuardarPago(_pago: any) {
    this.mostrarFormulario = false;
    this.listaComponent?.recargar();
    this.showToast('Pago registrado correctamente');
  }

  onGuardarIngresoRapido(_ingreso: unknown) {
    this.mostrarIngresoRapido = false;
    this.showToast('Ingreso rapido registrado correctamente');
  }

  onErrorLista(msg: string) {
    this.showToast(msg);
  }

  nuevoPago() {
    this.mostrarFormulario = true;
  }

  nuevoIngresoRapido() {
    this.mostrarIngresoRapido = true;
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 3000);
  }
}
