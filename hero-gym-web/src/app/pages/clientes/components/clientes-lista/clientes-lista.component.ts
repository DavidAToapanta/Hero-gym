import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../../core/services/cliente.service';
import { LucideAngularModule } from 'lucide-angular';


@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  templateUrl: './clientes-lista.component.html',
  imports: [CommonModule, LucideAngularModule],
})
export class ClientesListaComponent implements OnInit, OnChanges {
  clientes: any[] = [];
  totalClientes = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  isLoading = false;
  private _searchTerm = '';
  private isInitialized = false;

  constructor(private clienteService: ClienteService) {}

  @Input() set searchTerm(value: string) {
    const normalized = value?.trim() ?? '';
    if (normalized === this._searchTerm) {
      return;
    }
    this._searchTerm = normalized;
    if (this.isInitialized) {
      this.cargarClientes(1, true);
    }
  }

  get searchTerm(): string {
    return this._searchTerm;
  }

  ngOnInit(): void {
    this.isInitialized = true;
    // Siempre forzar refresh al inicializar para obtener datos frescos
    this.cargarClientes(1, true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia el searchTerm y el componente ya está inicializado, recargar
    if (changes['searchTerm'] && this.isInitialized) {
      this.cargarClientes(1, true);
    }
  }

  private cargarClientes(page: number = 1, forceRefresh = false): void {
    // Si es una carga forzada, limpiar los datos anteriores primero
    if (forceRefresh) {
      this.clientes = [];
      this.totalClientes = 0;
      this.currentPage = 1;
      this.totalPages = 0;
    }
    
    this.isLoading = true;
    this.clienteService
      .getClientes(page, this.itemsPerPage, this._searchTerm, forceRefresh)
      .subscribe({
        next: (response) => {
          this.clientes = response?.data || [];
          const meta = response?.meta;
          this.totalClientes = meta?.totalItems || 0;
          this.totalPages = meta?.totalPages || 0;
          this.currentPage = meta?.currentPage || page;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.clientes = [];
          this.totalClientes = 0;
          this.isLoading = false;
        },
      });
  }

  getBadgeClasses(estado?: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset bg-green-50 text-green-700 ring-green-600/20';
      case 'inactivo':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset bg-red-50 text-red-700 ring-red-600/20';
      case 'vencido':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'suspendido':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset bg-gray-50 text-gray-700 ring-gray-600/20';
      default:
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }

  getEstado(cliente: any): string {
    const cp = cliente?.planes?.[0];
    if (!cp?.fechaFin) return '—';
    const fin = new Date(cp.fechaFin);
    const ahora = new Date();
    return fin >= ahora ? 'Activo' : 'Vencido';
  }

  recargar(): void {
    this.cargarClientes(1, true);
  }

  // ⏩ Avanzar de página
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.cargarClientes(this.currentPage + 1);
    }
  }

  // ⏪ Retroceder de página
  prevPage() {
    if (this.currentPage > 1) {
      this.cargarClientes(this.currentPage - 1);
    }
  }

  eliminar(id: number) {
    if (confirm('¿Seguro que deseas eliminar este cliente?')) {
      this.clienteService.deleteCliente(id).subscribe({
        next: () => this.cargarClientes(this.currentPage, true),
        error: (err) => console.error(err),
      });
    }
  }
}
