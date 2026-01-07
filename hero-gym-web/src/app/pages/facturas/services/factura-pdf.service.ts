import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EMPRESA_CONFIG } from '../config/empresa.config';

@Injectable({ providedIn: 'root' })
export class FacturaPdfService {

  generarFactura(data: {
    factura: any;
    cliente: { nombre: string; identificacion: string };
    items: {
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      total: number;
    }[];
  }) {

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const AZUL: [number, number, number] = [0, 102, 179];

    const drawSectionHeader = (text: string, y: number) => {
      doc.setFillColor(AZUL[0], AZUL[1], AZUL[2]);
      doc.rect(14, y - 6, pageWidth - 28, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(text.toUpperCase(), 16, y);
      doc.setTextColor(0, 0, 0);
    };

    /* ================= HEADER ================= */

    doc.setFontSize(14);
    doc.text(EMPRESA_CONFIG.nombreComercial, 14, 20);

    doc.setFontSize(9);
    doc.text(`RUC: ${EMPRESA_CONFIG.ruc}`, 14, 26);
    doc.text(EMPRESA_CONFIG.direccion, 14, 32);
    doc.text(`${EMPRESA_CONFIG.telefono} | ${EMPRESA_CONFIG.correo}`, 14, 38);

    doc.setFontSize(16);
    doc.text('FACTURA', pageWidth - 14, 20, { align: 'right' });

    doc.setFontSize(9);
    doc.text(`N° ${data.factura.numero}`, pageWidth - 14, 28, { align: 'right' });
    doc.text(`Fecha: ${new Date(data.factura.fechaEmision).toLocaleDateString()}`, pageWidth - 14, 34, { align: 'right' });
    doc.text(`Estado: ${data.factura.estado}`, pageWidth - 14, 40, { align: 'right' });
    doc.text(`Moneda: ${EMPRESA_CONFIG.moneda}`, pageWidth - 14, 46, { align: 'right' });

    doc.line(14, 50, pageWidth - 14, 50);

    /* ================= CLIENTE ================= */

    drawSectionHeader('Datos del Cliente', 60);

    doc.setFontSize(9);
    doc.text(`Cliente: ${data.cliente.nombre}`, 14, 70);
    doc.text(`Identificación: ${data.cliente.identificacion}`, 14, 76);

    /* ================= DETALLES ================= */

    drawSectionHeader('Detalles del Consumo', 88);

    autoTable(doc, {
      startY: 94,
      head: [['Descripción', 'Cantidad', 'Precio Unitario', 'Total']],
      body: data.items.map(i => [
        i.descripcion,
        i.cantidad,
        `$${i.precioUnitario.toFixed(2)}`,
        `$${i.total.toFixed(2)}`
      ]),
      theme: 'plain',
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [230, 236, 242],
        textColor: 0,
        fontStyle: 'bold'
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    // @ts-ignore
    const y = doc.lastAutoTable.finalY + 6;

    /* ================= TOTALES ================= */

    doc.setFontSize(9);
    doc.text('Subtotal (sin IVA):', pageWidth - 80, y + 6);
    doc.text(`$${data.factura.subtotal.toFixed(2)}`, pageWidth - 14, y + 6, { align: 'right' });

    doc.text('IVA (12%):', pageWidth - 80, y + 12);
    doc.text(`$${data.factura.iva.toFixed(2)}`, pageWidth - 14, y + 12, { align: 'right' });

    doc.setFontSize(11);
    doc.text('TOTAL:', pageWidth - 80, y + 20);
    doc.text(`$${data.factura.total.toFixed(2)}`, pageWidth - 14, y + 20, { align: 'right' });

    /* ================= RESUMEN ================= */

    drawSectionHeader('Resumen Económico', y + 36);

    doc.setFontSize(9);
    doc.text('Total Pagado:', 14, y + 46);
    doc.text(`$${data.factura.totalPagado.toFixed(2)}`, 60, y + 46);

    doc.text('Saldo Pendiente:', 14, y + 52);
    doc.text(`$${data.factura.saldo.toFixed(2)}`, 60, y + 52);

    /* ================= FOOTER ================= */

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      EMPRESA_CONFIG.notaLegal || 'Documento generado electrónicamente.',
      pageWidth / 2,
      285,
      { align: 'center' }
    );

    doc.save(`factura_${data.factura.numero}.pdf`);
  }
}
