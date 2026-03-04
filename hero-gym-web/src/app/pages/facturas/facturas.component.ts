import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacturaService, Factura } from '../../core/services/factura.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FacturasHeaderComponent } from "./components/facturas-header/facturas-header.component";
import { FacturasResumenComponent } from "./components/facturas-resumen/facturas-resumen.component";
import { FacturasFiltrosComponent } from "./components/facturas-filtros/facturas-filtros.component";
import { FacturasTablaComponent } from "./components/facturas-tabla/facturas-tabla.component";
import { FacturaPdfService } from './services/factura-pdf.service';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [
    CommonModule, 
    FacturasHeaderComponent, 
    FacturasResumenComponent,
    FacturasFiltrosComponent,
    FacturasTablaComponent
  ],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css'
})
export class FacturasComponent implements OnInit {
  facturas: Factura[] = [];
  resumenStats: any = {};
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  isLoading: boolean = false;

  constructor(
    private facturaService: FacturaService,
    private facturaPdfService: FacturaPdfService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarFacturas({});
    this.cargarResumen();
  }

  cargarResumen() {
    this.facturaService.getResumen().subscribe({
      next: (stats) => this.resumenStats = stats,
      error: (err) => console.error('Error cargando resumen', err)
    });
  }

  // Mantener referencia a los filtros actuales para la paginación
  currentFilters: any = {};

  cargarFacturas(filtros: any, page: number = 1) {
    this.isLoading = true;
    
    // Si vienen nuevos filtros (no es solo cambio de página), reiniciamos a página 1
    if (filtros !== this.currentFilters) {
      this.currentFilters = { ...filtros };
      // Si el objeto filtros es nuevo, asumimos que es una nueva búsqueda, pero si es null (recarga), mantenemos page
      // Aquí simplificamos: si se llama explícitamente con filtros, actualizamos currentFilters.
    }

    const filters: any = {};
    if (this.currentFilters.cedula) filters.cedula = this.currentFilters.cedula;
    if (this.currentFilters.estado) filters.estado = this.currentFilters.estado;
    if (this.currentFilters.desde) filters.desde = this.currentFilters.desde;
    if (this.currentFilters.hasta) filters.hasta = this.currentFilters.hasta;

    this.facturaService.findAll(filters, page, this.itemsPerPage).subscribe({
      next: (response) => {
        this.facturas = response.data;
        const meta = response.meta;
        this.totalItems = meta.totalItems;
        this.totalPages = meta.totalPages;
        this.currentPage = meta.currentPage;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando facturas', err);
        this.isLoading = false;
        this.facturas = [];
        this.totalItems = 0;
      }
    });
  }

  onPageChange(page: number) {
    this.cargarFacturas(this.currentFilters, page);
  }


  exportarPDF() {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Facturas', 14, 20);
    
    // Fecha de reporte
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);

    // Definición de columnas y datos
    const columns = ['Nº', 'Fecha', 'Cédula', 'Cliente', 'Plan', 'Total', 'Estado', 'Saldo'];
    
    const data = this.facturas.map(f => [
      f.numero,
      new Date(f.fechaEmision).toLocaleDateString(),
      f.clientePlan.cliente.usuario.cedula || 'N/A',
      `${f.clientePlan.cliente.usuario.nombres} ${f.clientePlan.cliente.usuario.apellidos}`,
      f.clientePlan.plan.nombre,
      `$${f.total.toFixed(2)}`,
      f.estado,
      `$${f.saldo.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [columns],
      body: data,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    doc.save('reporte_facturas.pdf');
  }

  imprimirIndividual(factura: Factura) {
    // Preparar datos para el servicio
    const data = {
      factura: {
        numero: factura.numero,
        fechaEmision: factura.fechaEmision,
        estado: factura.estado,
        subtotal: factura.subtotal,
        iva: factura.iva,
        total: factura.total,
        totalPagado: factura.totalPagado,
        saldo: factura.saldo
      },
      cliente: {
        nombre: `${factura.clientePlan.cliente.usuario.nombres} ${factura.clientePlan.cliente.usuario.apellidos}`,
        identificacion: factura.clientePlan.cliente.usuario.cedula || 'N/A'
      },
      items: [
        {
          descripcion: factura.clientePlan.plan.nombre,
          cantidad: 1,
          precioUnitario: factura.clientePlan.plan.precio,
          total: factura.clientePlan.plan.precio
        }
      ]
    };

    // Delegar la generación del PDF al servicio
    this.facturaPdfService.generarFactura(data);
  }
  
  onPagoRealizado() {
    this.cargarFacturas(this.currentFilters, this.currentPage);
    this.cargarResumen();
  }

  
}
