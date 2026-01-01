import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ProductoService } from '../../../../core/services/producto.service';
import { CompraService } from '../../../../core/services/compra.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-productos-ciente',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './productos-ciente.component.html',
  styleUrl: './productos-ciente.component.css',
})
export class ProductosCienteComponent implements OnInit {
  @Input() cliente: any;
  @Output() close = new EventEmitter<void>();

  productos: any[] = [];
  cart: any[] = [];
  searchTerm: string = '';
  isLoading = false;
  purchaseSuccess = false;
  lastPurchase: any = null;

  constructor(
    private productoService: ProductoService,
    private compraService: CompraService
  ) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos() {
    this.isLoading = true;
    this.productoService.getProductos(1, 100, this.searchTerm).subscribe({
      next: (res: any) => {
        this.productos = res || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.isLoading = false;
      }
    });
  }

  addToCart(producto: any) {
    const existingItem = this.cart.find(item => item.id === producto.id);
    if (existingItem) {
      if (existingItem.cantidad < producto.stock) {
        existingItem.cantidad++;
      } else {
        alert('No hay suficiente stock');
      }
    } else {
      this.cart.push({ ...producto, cantidad: 1 });
    }
  }

  removeFromCart(productoId: number) {
    this.cart = this.cart.filter(item => item.id !== productoId);
  }

  updateQuantity(item: any, change: number) {
    const product = this.productos.find(p => p.id === item.id);
    const newQuantity = item.cantidad + change;
    
    if (newQuantity > 0 && newQuantity <= product.stock) {
      item.cantidad = newQuantity;
    }
  }

  get total() {
    return this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  comprar() {
    if (this.cart.length === 0) return;

    const compraDto = {
      clienteId: this.cliente.id,
      detalles: this.cart.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad
      }))
    };

    this.compraService.create(compraDto).subscribe({
      next: (res) => {
        this.purchaseSuccess = true;
        this.lastPurchase = {
            items: [...this.cart],
            total: this.total,
            date: new Date(),
            cliente: this.cliente
        };
        this.cart = [];
        this.loadProductos(); // Refresh stock
      },
      error: (err) => {
        console.error('Error creating purchase', err);
        alert('Error al realizar la compra');
      }
    });
  }

  imprimirTicket() {
    if (!this.lastPurchase) return;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // 80mm width for thermal printer style
    });

    const p = this.lastPurchase;
    let y = 10;

    doc.setFontSize(12);
    doc.text('HERO GYM', 40, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.text('Ticket de Compra', 40, y, { align: 'center' });
    y += 5;
    doc.text(`Fecha: ${p.date.toLocaleString()}`, 5, y);
    y += 5;
    doc.text(`Cliente: ${p.cliente.usuario.nombres} ${p.cliente.usuario.apellidos}`, 5, y);
    y += 5;
    doc.line(5, y, 75, y);
    y += 5;

    // Header
    doc.text('Cant.', 5, y);
    doc.text('Prod.', 15, y);
    doc.text('Total', 65, y);
    y += 5;

    // Items
    p.items.forEach((item: any) => {
        doc.text(item.cantidad.toString(), 5, y);
        const name = item.nombre.length > 20 ? item.nombre.substring(0, 20) + '...' : item.nombre;
        doc.text(name, 15, y);
        doc.text(`$${(item.precio * item.cantidad).toFixed(2)}`, 65, y);
        y += 5;
    });

    doc.line(5, y, 75, y);
    y += 5;
    doc.setFontSize(10);
    doc.text(`TOTAL: $${p.total.toFixed(2)}`, 65, y, { align: 'right' });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  }

  cerrar() {
    this.close.emit();
  }
}
