
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProductoService } from '../../../../core/services/producto.service';

@Component({
  selector: 'app-productos-formulario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './productos-formulario.component.html',
  styleUrls: ['./productos-formulario.component.css'],
})
export class ProductosFormularioComponent implements OnChanges {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @ViewChild('productoForm') productoForm?: NgForm;
  @Input() initialData?: any;

  isSubmitting = false;
  errorMessage = '';

  producto = this.crearProductoInicial();

  constructor(private productoService: ProductoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData']) {
      if (this.initialData) {
        this.producto = {
          id: this.initialData.id,
          nombre: this.initialData.nombre ?? '',
          precio: this.initialData.precio ?? null,
          stock: this.initialData.stock ?? null,
          estado: this.initialData.estado ?? true,
        } as any;
      } else {
        this.resetFormulario();
      }
    }
  }

  cerrar() {
    this.errorMessage = '';
    this.isSubmitting = false;
    this.resetFormulario();
    this.close.emit();
  }

  guardar() {
    if (this.isSubmitting) return;

    this.errorMessage = '';
    this.isSubmitting = true;

    const payload = {
      nombre: this.producto.nombre.trim(),
      precio: Number(this.producto.precio),
      stock: Number(this.producto.stock),
      estado: !!this.producto.estado,
    };

    const request$ = this.producto?.id
      ? this.productoService.updateProducto(this.producto.id, payload)
      : this.productoService.createProducto(payload);

    request$.subscribe({
      next: (response) => {
        this.save.emit(response);
        this.isSubmitting = false;
        this.cerrar();
      },
      error: (error) => {
        const mensaje = error?.error?.message;
        this.errorMessage =
          typeof mensaje === 'string'
            ? mensaje
            : Array.isArray(mensaje) && mensaje.length > 0
            ? mensaje.join('. ')
            : 'Ocurrió un error al guardar el producto';
        this.isSubmitting = false;
      },
    });
  }

  private crearProductoInicial() {
    return {
      id: undefined as unknown as number,
      nombre: '',
      precio: null as unknown as number,
      stock: null as unknown as number,
      estado: true,
    };
  }

  private resetFormulario() {
    this.producto = this.crearProductoInicial();
    this.productoForm?.resetForm(this.producto);
  }
}
