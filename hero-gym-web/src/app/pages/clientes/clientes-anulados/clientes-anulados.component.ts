import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ClienteService } from '../../../core/services/cliente.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface ClienteAnulado {
  id: number;
  objetivos?: string | null;
  horario?: string | null;
  usuario?: {
    nombres?: string | null;
    apellidos?: string | null;
    cedula?: string | null;
  } | null;
}

@Component({
  selector: 'app-clientes-anulados',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './clientes-anulados.component.html',
  styleUrl: './clientes-anulados.component.css',
})
export class ClientesAnuladosComponent implements OnInit {
  clientes: ClienteAnulado[] = [];
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  totalClientes = 0;

  showConfirmDialog = false;
  clienteToReactivate: number | null = null;

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientesInactivos();
  }

  cargarClientesInactivos(forceRefresh = false): void {
    this.isLoading = true;

    this.clienteService
      .getClientesInactivos(this.currentPage, this.itemsPerPage, undefined, forceRefresh)
      .subscribe({
        next: (response) => {
          this.clientes = response?.data || [];
          const meta = response?.meta;
          this.totalClientes = meta?.totalItems || 0;
          this.totalPages = meta?.totalPages || 0;
          this.currentPage = meta?.currentPage || this.currentPage;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('[ClientesAnulados] Error al cargar clientes inactivos:', err);
          this.clientes = [];
          this.totalClientes = 0;
          this.totalPages = 0;
          this.isLoading = false;
        },
      });
  }

  reactivar(id: number): void {
    this.clienteToReactivate = id;
    this.showConfirmDialog = true;
  }

  onConfirmReactivar(): void {
    if (this.clienteToReactivate === null) {
      return;
    }

    const targetId = this.clienteToReactivate;

    this.clienteService.reactivarCliente(targetId).subscribe({
      next: () => {
        alert('Cliente reactivado correctamente.');

        if (this.currentPage > 1 && this.clientes.length === 1) {
          this.currentPage -= 1;
        }

        this.showConfirmDialog = false;
        this.clienteToReactivate = null;
        this.cargarClientesInactivos(true);
      },
      error: (err) => {
        console.error('[ClientesAnulados] Error al reactivar cliente:', err);
        const mensaje = this.getErrorMessage(err);
        alert(`No se pudo reactivar el cliente: ${mensaje}`);
        this.showConfirmDialog = false;
        this.clienteToReactivate = null;
      },
    });
  }

  onCancelReactivar(): void {
    this.showConfirmDialog = false;
    this.clienteToReactivate = null;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.cargarClientesInactivos();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.cargarClientesInactivos();
    }
  }

  getNombreCompleto(cliente: ClienteAnulado): string {
    const nombres = cliente.usuario?.nombres?.trim() ?? '';
    const apellidos = cliente.usuario?.apellidos?.trim() ?? '';
    const fullName = `${nombres} ${apellidos}`.trim();
    return fullName || 'Sin nombre';
  }

  private getErrorMessage(err: unknown): string {
    if (!err || typeof err !== 'object') {
      return 'Error inesperado.';
    }

    const errorResponse = err as { error?: { message?: string | string[] }; message?: string };
    const message = errorResponse.error?.message ?? errorResponse.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }

    return 'Error inesperado.';
  }
}
