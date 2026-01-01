import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../../core/services/cliente.service';
import { LucideAngularModule } from 'lucide-angular';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RenovarComponent } from '../renovar/renovar.component';



import { ProductosCienteComponent } from '../productos-ciente/productos-ciente.component';

@Component({
  selector: 'app-clientes-lista',
  standalone: true,
  templateUrl: './clientes-lista.component.html',
  imports: [CommonModule, LucideAngularModule, ConfirmDialogComponent, RenovarComponent, ProductosCienteComponent],
})
export class ClientesListaComponent implements OnInit, OnChanges {
  clientes: any[] = [];
  totalClientes = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  isLoading = false;
  @Input() searchTerm: string = '';
  
  // Confirmation dialog state
  showConfirmDialog = false;
  clienteToDelete: number | null = null;
  
  // Renovar modal state
  showRenovarModal = false;
  clienteToRenovar: any = null;

  // Productos modal state
  showProductosModal = false;
  clienteForProductos: any = null;

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    console.log('[ClientesLista] ngOnInit - Iniciando carga de clientes');
    this.cargarClientes(1, true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] && !changes['searchTerm'].firstChange) {
      console.log('[ClientesLista] searchTerm cambió:', changes['searchTerm'].currentValue);
      this.cargarClientes(1, true);
    }
  }

  private cargarClientes(page: number = 1, forceRefresh = false): void {
    if (this.isLoading) {
      console.warn('[ClientesLista] Ya hay una carga en progreso, ignorando nueva solicitud');
      return;
    }

    this.isLoading = true;
    const searchTerm = this.searchTerm?.trim() || '';
    console.log('[ClientesLista] cargarClientes llamado:', { page, searchTerm, forceRefresh });
    
    const startTime = Date.now();
    this.clienteService
      .getClientes(page, this.itemsPerPage, searchTerm, forceRefresh)
      .subscribe({
        next: (response) => {
          const duration = Date.now() - startTime;
          console.log(`[ClientesLista] Datos recibidos en ${duration}ms:`, {
            clientes: response?.data?.length || 0,
            totalItems: response?.meta?.totalItems || 0,
          });
          this.clientes = response?.data || [];
          const meta = response?.meta;
          this.totalClientes = meta?.totalItems || 0;
          this.totalPages = meta?.totalPages || 0;
          this.currentPage = meta?.currentPage || page;
          this.isLoading = false;
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          console.error(`[ClientesLista] Error después de ${duration}ms:`, err);
          this.clientes = [];
          this.totalClientes = 0;
          this.totalPages = 0;
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
    this.clienteToDelete = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete() {
    if (this.clienteToDelete === null) return;
    
    console.log('[ClientesLista] Eliminando cliente con ID:', this.clienteToDelete);
    this.clienteService.deleteCliente(this.clienteToDelete).subscribe({
      next: () => {
        console.log('[ClientesLista] Cliente eliminado exitosamente');
        alert('Cliente eliminado exitosamente');
        this.cargarClientes(this.currentPage, true);
        this.showConfirmDialog = false;
        this.clienteToDelete = null;
      },
      error: (err) => {
        console.error('[ClientesLista] Error al eliminar cliente:', err);
        const mensaje = err.error?.message || err.message || 'Error desconocido al eliminar el cliente';
        alert(`Error al eliminar el cliente: ${mensaje}`);
        this.showConfirmDialog = false;
        this.clienteToDelete = null;
      },
    });
  }

  onCancelDelete() {
    console.log('[ClientesLista] Eliminación cancelada');
    this.showConfirmDialog = false;
    this.clienteToDelete = null;
  }

  getDeudaTotal(cliente: any): number {
    const cp = cliente?.planes?.[0];
    if (!cp?.deudas || !Array.isArray(cp.deudas)) {
      console.log('[ClientesLista] No hay deudas para cliente:', cliente?.usuario?.nombres, cp);
      return 0;
    }
    
    const total = cp.deudas
      .filter((d: any) => !d.solventada)
      .reduce((sum: number, d: any) => sum + (Number(d.monto) || 0), 0);
    
    console.log('[ClientesLista] Deuda total para', cliente?.usuario?.nombres, ':', total, 'Deudas:', cp.deudas);
    return total;
  }

  // Verificar si el plan ha terminado
  planHaTerminado(cliente: any): boolean {
    const cp = cliente?.planes?.[0];
    if (!cp?.fechaFin) return false;
    const fin = new Date(cp.fechaFin);
    const ahora = new Date();
    return fin < ahora;
  }

  // Abrir modal de renovación
  abrirRenovarModal(cliente: any) {
    console.log('[ClientesLista] Abriendo modal de renovación para:', cliente?.usuario?.nombres);
    this.clienteToRenovar = cliente;
    this.showRenovarModal = true;
  }

  // Cerrar modal de renovación
  cerrarRenovarModal() {
    console.log('[ClientesLista] Cerrando modal de renovación');
    this.showRenovarModal = false;
    this.clienteToRenovar = null;
  }

  // Manejar renovación confirmada
  onRenovacionConfirmada(response: any) {
    console.log('[ClientesLista] Renovación confirmada:', response);
    this.cerrarRenovarModal();
    this.recargar();
  }

  // Abrir modal de productos
  abrirProductosModal(cliente: any) {
    this.clienteForProductos = cliente;
    this.showProductosModal = true;
  }

  // Cerrar modal de productos
  cerrarProductosModal() {
    this.showProductosModal = false;
    this.clienteForProductos = null;
  }
}
