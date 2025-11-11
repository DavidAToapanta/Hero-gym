import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Pago, PagoService } from '../../../../core/services/pago.service';

@Component({
  selector: 'app-pagos-lista',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pagos-lista.component.html',
  styleUrl: './pagos-lista.component.css',
})
export class PagosListaComponent implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  @Output() error = new EventEmitter<string>();

  pagos: Pago[] = [];
  filteredPagos: Pago[] = [];
  isLoading = true;
  totalPagos = 0;

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    this.cargarPagos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] && !changes['searchTerm'].firstChange) {
      this.aplicarFiltro();
    }
  }

  cargarPagos(): void {
    this.isLoading = true;
    this.pagoService.getPagos().subscribe({
      next: (pagos) => {
        this.pagos = Array.isArray(pagos) ? pagos : [];
        this.totalPagos = this.pagos.length;
        this.aplicarFiltro();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando pagos:', err);
        this.isLoading = false;
        this.error.emit('No se pudieron cargar los pagos.');
      },
    });
  }

  recargar(): void {
    this.cargarPagos();
  }

  private aplicarFiltro(): void {
    const termino = (this.searchTerm || '').toLowerCase();
    if (!termino) {
      this.filteredPagos = this.pagos;
      return;
    }

    this.filteredPagos = this.pagos.filter((p) => {
      const monto = String(p?.monto ?? '').toLowerCase();
      const fecha = String(p?.fecha ?? '').toLowerCase();
      const nombres = `${p?.clientePlan?.cliente?.usuario?.nombres ?? ''} ${p?.clientePlan?.cliente?.usuario?.apellidos ?? ''}`.toLowerCase();
      const plan = String(p?.clientePlan?.plan?.nombre ?? '').toLowerCase();
      return (
        monto.includes(termino) ||
        fecha.includes(termino) ||
        nombres.includes(termino) ||
        plan.includes(termino)
      );
    });
  }

  eliminar(id: number) {
    if (confirm('¿Seguro que deseas eliminar este pago?')) {
      this.pagoService.deletePago(id).subscribe({
        next: () => this.cargarPagos(),
        error: (err) => {
          console.error('Error eliminando pago:', err);
          this.error.emit('No se pudo eliminar el pago.');
        },
      });
    }
  }
}
