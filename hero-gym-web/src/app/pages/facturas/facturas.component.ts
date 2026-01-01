import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturaService, Factura } from '../../core/services/factura.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FacturasHeaderComponent } from "./components/facturas-header/facturas-header.component";
import { FacturasResumenComponent } from "./components/facturas-resumen/facturas-resumen.component";

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, FacturasHeaderComponent, FacturasResumenComponent],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css'
})
export class FacturasComponent implements OnInit {
  facturas: Factura[] = [];
  
  // Filtros
  filtroCedula: string = '';
  filtroEstado: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';

  isLoading: boolean = false;

  constructor(private facturaService: FacturaService) {}

  ngOnInit(): void {
    this.cargarFacturas();
  }

  cargarFacturas() {
    this.isLoading = true;
    const filters: any = {};
    
    if (this.filtroCedula) filters.cedula = this.filtroCedula;
    if (this.filtroEstado) filters.estado = this.filtroEstado;
    if (this.fechaDesde) filters.desde = this.fechaDesde;
    if (this.fechaHasta) filters.hasta = this.fechaHasta;

    this.facturaService.findAll(filters).subscribe({
      next: (data) => {
        this.facturas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando facturas', err);
        this.isLoading = false;
      }
    });
  }

  limpiarFiltros() {
    this.filtroCedula = '';
    this.filtroEstado = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.cargarFacturas();
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
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(22);
    doc.text('HERO GYM', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('RUC: 1234567890001', 105, 28, { align: 'center' });
    doc.text('Dirección: Av. Principal y Calle Secundaria', 105, 34, { align: 'center' });
    
    doc.line(10, 40, 200, 40);

    // Datos Factura
    doc.setFontSize(14);
    doc.text(`FACTURA Nº ${factura.numero}`, 14, 50);
    
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${new Date(factura.fechaEmision).toLocaleString()}`, 14, 58);
    doc.text(`Estado: ${factura.estado}`, 14, 64);

    // Datos Cliente
    doc.setFontSize(12); 
    doc.text('Datos del Cliente:', 14, 75);
    doc.setFontSize(10);
    doc.text(`Cliente: ${factura.clientePlan.cliente.usuario.nombres} ${factura.clientePlan.cliente.usuario.apellidos}`, 14, 82);
    doc.text(`Cédula: ${factura.clientePlan.cliente.usuario.cedula || 'N/A'}`, 14, 88);

    // Detalle
    const items = [
      [factura.clientePlan.plan.nombre, 1, `$${factura.clientePlan.plan.precio.toFixed(2)}`, `$${factura.clientePlan.plan.precio.toFixed(2)}`]
    ];

    autoTable(doc, {
      head: [['Descripción', 'Cant.', 'P. Unit', 'Total']],
      body: items,
      startY: 100,
      theme: 'plain',
      headStyles: { fillColor: [220, 220, 220] }
    });

    // Totales
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 130;
    
    doc.text(`Subtotal: $${factura.subtotal.toFixed(2)}`, 150, finalY + 10);
    doc.text(`IVA (12%): $${factura.iva.toFixed(2)}`, 150, finalY + 16);
    doc.setFontSize(12);
    doc.text(`TOTAL: $${factura.total.toFixed(2)}`, 150, finalY + 24);
    
    // Pagos
    doc.setFontSize(10);
    doc.text(`Pagado: $${factura.totalPagado.toFixed(2)}`, 150, finalY + 32);
    doc.text(`Saldo: $${factura.saldo.toFixed(2)}`, 150, finalY + 38);

    doc.save(`factura_${factura.numero}.pdf`);
  }

  getClassEstado(estado: string): string {
    switch (estado) {
      case 'PAGADA': return 'bg-green-100 text-green-800';
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ANULADA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
