import { Component, ViewChild } from '@angular/core';

import { LucideAngularModule } from 'lucide-angular';

import { ClientesBusquedaComponent } from './components/clientes-busqueda/clientes-busqueda.component';
import { ClientesFormularioComponent } from './components/clientes-formulario/clientes-formulario.component';
import { ClientesListaComponent } from './components/clientes-lista/clientes-lista.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    LucideAngularModule,
    ClientesListaComponent,
    ClientesBusquedaComponent,
    ClientesFormularioComponent,
  ],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent {
  @ViewChild(ClientesListaComponent) listaComponent?: ClientesListaComponent;

  terminoActual = '';
  mostrarFormulario = false;

  buscarClientes(termino: string): void {
    this.terminoActual = termino;
  }

  abrirNuevoCliente(): void {
    this.mostrarFormulario = true;
  }

  onGuardarCliente(_cliente: unknown): void {
    this.mostrarFormulario = false;
    this.listaComponent?.recargar();
  }
}
