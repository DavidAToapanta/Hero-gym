import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { ClientesListaComponent } from './components/clientes-lista/clientes-lista.component';
import { ClientesBusquedaComponent } from './components/clientes-busqueda/clientes-busqueda.component';
import { ClientesFormularioComponent } from "./components/clientes-formulario/clientes-formulario.component";
import { RenovarComponent } from "./components/renovar/renovar.component";

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ClientesListaComponent,
    ClientesBusquedaComponent,
    ClientesFormularioComponent,
    RenovarComponent
],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent {
  @ViewChild(ClientesListaComponent) listaComponent?: ClientesListaComponent;
  terminoActual = '';
  mostrarFormulario = false;

  buscarClientes(termino: string) {
    this.terminoActual = termino;
  }

  onGuardarCliente(cliente: any) {
    this.mostrarFormulario = false;
    this.listaComponent?.recargar();
  }
}
