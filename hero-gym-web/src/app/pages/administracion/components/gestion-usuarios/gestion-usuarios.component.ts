import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LucideAngularModule } from 'lucide-angular';

import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  CreateStaffDto,
  STAFF_ESTADOS,
  STAFF_ROLES,
  StaffEstado,
  StaffFilters,
  StaffItem,
  StaffRole,
  UpdateStaffDto,
  UsuarioService,
} from '../../../../core/services/usuario.service';
import { UsuarioModalComponent } from './usuario-modal/usuario-modal.component';

type StaffToggleAction = 'inactivar' | 'reactivar';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    UsuarioModalComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css',
})
export class GestionUsuariosComponent implements OnInit {
  readonly roleOptions = STAFF_ROLES;
  readonly estadoOptions = STAFF_ESTADOS;

  staff: StaffItem[] = [];
  isLoading = false;
  isSaving = false;
  isLoadingStaffDetails = false;
  isTogglingStaff = false;
  errorMessage = '';
  modalErrorMessage = '';
  selectedRole: StaffRole | '' = '';
  selectedEstado: StaffEstado | '' = '';
  showModal = false;
  staffEditando: StaffItem | null = null;
  showConfirmDialog = false;
  staffToToggle: StaffItem | null = null;
  accionPendiente: StaffToggleAction | null = null;

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarStaff();
  }

  cargarStaff(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.usuarioService.getStaff(this.buildFilters()).subscribe({
      next: (staff) => {
        this.staff = staff;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar staff:', error);
        this.errorMessage = this.parseErrorMessage(
          error,
          'No se pudo cargar el staff del gimnasio',
        );
        this.staff = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirModal(): void {
    if (this.isSaving || this.isLoadingStaffDetails) {
      return;
    }

    this.staffEditando = null;
    this.modalErrorMessage = '';
    this.showModal = true;
  }

  editarStaff(staff: StaffItem): void {
    if (this.isSaving || this.isLoadingStaffDetails) {
      return;
    }

    this.isLoadingStaffDetails = true;
    this.errorMessage = '';

    this.usuarioService.getStaffById(staff.usuarioId).subscribe({
      next: (staffDetalle) => {
        this.staffEditando = staffDetalle;
        this.modalErrorMessage = '';
        this.showModal = true;
        this.isLoadingStaffDetails = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar detalle del staff:', error);
        this.errorMessage = this.parseErrorMessage(
          error,
          'No se pudo cargar la información del staff seleccionado',
        );
        this.isLoadingStaffDetails = false;
        this.cdr.detectChanges();
      },
    });
  }

  cerrarModal(): void {
    if (this.isSaving) {
      return;
    }

    this.showModal = false;
    this.staffEditando = null;
    this.modalErrorMessage = '';
  }

  guardarStaff(payload: CreateStaffDto | UpdateStaffDto): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.modalErrorMessage = '';

    const request$ = this.staffEditando
      ? this.usuarioService.updateStaff(this.staffEditando.usuarioId, payload as UpdateStaffDto)
      : this.usuarioService.createStaff(payload as CreateStaffDto);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.cerrarModal();
        this.cargarStaff();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al guardar staff:', error);
        this.modalErrorMessage = this.parseErrorMessage(
          error,
          'No se pudo guardar el staff. Revisa los datos e inténtalo de nuevo',
        );
        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirConfirmacion(staff: StaffItem): void {
    if (this.isTogglingStaff) {
      return;
    }

    this.staffToToggle = staff;
    this.accionPendiente = staff.estado === 'INACTIVO' ? 'reactivar' : 'inactivar';
    this.showConfirmDialog = true;
  }

  cerrarConfirmacion(): void {
    if (this.isTogglingStaff) {
      return;
    }

    this.showConfirmDialog = false;
    this.staffToToggle = null;
    this.accionPendiente = null;
  }

  confirmarCambioEstado(): void {
    if (!this.staffToToggle || !this.accionPendiente || this.isTogglingStaff) {
      return;
    }

    this.isTogglingStaff = true;

    const request$ =
      this.accionPendiente === 'inactivar'
        ? this.usuarioService.inactivarStaff(this.staffToToggle.usuarioId)
        : this.usuarioService.reactivarStaff(this.staffToToggle.usuarioId);

    request$.subscribe({
      next: () => {
        this.isTogglingStaff = false;
        this.cerrarConfirmacion();
        this.cargarStaff();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cambiar estado del staff:', error);
        this.errorMessage = this.parseErrorMessage(
          error,
          `No se pudo ${this.accionPendiente} el staff seleccionado`,
        );
        this.isTogglingStaff = false;
        this.cdr.detectChanges();
      },
    });
  }

  limpiarFiltros(): void {
    this.selectedRole = '';
    this.selectedEstado = '';
    this.cargarStaff();
  }

  getNombreCompleto(staff: StaffItem): string {
    return `${staff.nombres} ${staff.apellidos}`.trim();
  }

  getRoleLabel(role: StaffRole): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'RECEPCIONISTA':
        return 'Recepcionista';
      case 'ENTRENADOR':
        return 'Entrenador';
    }
  }

  getEstadoLabel(estado: StaffEstado): string {
    switch (estado) {
      case 'ACTIVO':
        return 'Activo';
      case 'INACTIVO':
        return 'Inactivo';
      case 'PENDIENTE':
        return 'Pendiente';
    }
  }

  getEstadoClasses(estado: StaffEstado): string {
    switch (estado) {
      case 'ACTIVO':
        return 'border-green-200 bg-green-50 text-green-700';
      case 'INACTIVO':
        return 'border-slate-200 bg-slate-100 text-slate-600';
      case 'PENDIENTE':
        return 'border-amber-200 bg-amber-50 text-amber-700';
    }
  }

  formatSueldo(sueldo: number | null): string {
    if (sueldo === null) {
      return 'No aplica';
    }

    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(sueldo);
  }

  getConfirmTitle(): string {
    return this.accionPendiente === 'reactivar' ? '¿Reactivar staff?' : '¿Inactivar staff?';
  }

  getConfirmMessage(): string {
    if (!this.staffToToggle) {
      return '';
    }

    const nombreStaff = this.getNombreCompleto(this.staffToToggle) || this.staffToToggle.userName;
    return this.accionPendiente === 'reactivar'
      ? `Vas a reactivar a ${nombreStaff}. El usuario volverá a tener acceso al sistema según su rol actual.`
      : `Vas a inactivar a ${nombreStaff}. El usuario dejará de operar en el tenant actual, pero no se eliminará su historial.`;
  }

  getConfirmButtonLabel(): string {
    return this.isTogglingStaff
      ? 'Guardando…'
      : this.accionPendiente === 'reactivar'
      ? 'Reactivar Staff'
      : 'Inactivar Staff';
  }

  private buildFilters(): StaffFilters {
    const filters: StaffFilters = {};

    if (this.selectedRole) {
      filters.role = this.selectedRole;
    }

    if (this.selectedEstado) {
      filters.estado = this.selectedEstado;
    }

    return filters;
  }

  private parseErrorMessage(error: unknown, fallbackMessage: string): string {
    const backendMessage = this.extractBackendMessage(error);
    if (!backendMessage) {
      return fallbackMessage;
    }

    return backendMessage;
  }

  private extractBackendMessage(error: unknown): string | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const errorRecord = error as Record<string, unknown>;
    const nestedError = errorRecord['error'];

    if (typeof nestedError === 'string') {
      return nestedError;
    }

    if (nestedError && typeof nestedError === 'object') {
      const nestedRecord = nestedError as Record<string, unknown>;
      const message = nestedRecord['message'];

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message)) {
        const normalizedMessages = message.filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 0,
        );

        return normalizedMessages.length > 0 ? normalizedMessages.join('. ') : null;
      }
    }

    return null;
  }
}
