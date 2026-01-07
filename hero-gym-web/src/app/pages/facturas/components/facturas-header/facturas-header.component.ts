import { Component, EventEmitter, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-facturas-header',
  standalone: true,
  imports: [],
  templateUrl: './facturas-header.component.html',
  styleUrl: './facturas-header.component.css',
})
export class FacturasHeaderComponent{
  @Output() exportar = new EventEmitter<void>();

}
