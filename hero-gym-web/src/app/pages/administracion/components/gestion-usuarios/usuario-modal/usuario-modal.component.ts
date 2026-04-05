import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import {
  CreateStaffDto,
  STAFF_ROLES,
  StaffItem,
  StaffRole,
  UpdateStaffDto,
} from '../../../../../core/services/usuario.service';
import { LucideAngularModule } from 'lucide-angular';

interface StaffModalFormModel {
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: string;
  tenantRole: StaffRole;
  userName: string;
  password: string;
  horario: string;
  sueldo: string;
}

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './usuario-modal.component.html',
  styleUrl: './usuario-modal.component.css',
})
export class UsuarioModalComponent implements OnChanges {
  @Input() staff: StaffItem | null = null;
  @Input() isSubmitting = false;
  @Input() errorMessage = '';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateStaffDto | UpdateStaffDto>();

  @ViewChild('staffForm') staffForm?: NgForm;
  @ViewChild('modalRoot') modalRoot?: ElementRef<HTMLElement>;

  readonly roleOptions = STAFF_ROLES;

  validationMessage = '';
  formModel = this.createInitialModel();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['staff']) {
      this.validationMessage = '';
      this.formModel = this.createModelFromStaff(this.staff);
      queueMicrotask(() => {
        if (this.staffForm && typeof this.staffForm.resetForm === 'function') {
          this.staffForm.resetForm(this.formModel);
        }
      });
    }

    if (changes['errorMessage'] && this.errorMessage) {
      this.validationMessage = '';
    }
  }

  get isEditing(): boolean {
    return this.staff !== null;
  }

  get modalTitle(): string {
    return this.isEditing ? 'Editar Usuario del Sistema' : 'Nuevo Usuario del Sistema';
  }

  get submitLabel(): string {
    return this.isEditing ? 'Guardar Cambios' : 'Guardar Usuario';
  }

  get visibleErrorMessage(): string {
    return this.validationMessage || this.errorMessage;
  }

  guardar(): void {
    if (this.isSubmitting) {
      return;
    }

    this.validationMessage = '';

    if (this.staffForm?.invalid) {
      this.staffForm.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      this.focusFirstInvalidField();
      return;
    }

    this.save.emit(payload);
  }

  cerrar(): void {
    if (this.isSubmitting) {
      return;
    }

    this.validationMessage = '';
    this.close.emit();
  }

  onRoleChange(role: StaffRole): void {
    if (role === 'ADMIN') {
      this.formModel.horario = '';
      this.formModel.sueldo = '';
    }
  }

  requiresScheduleAndSalary(role: StaffRole = this.formModel.tenantRole): boolean {
    return role === 'RECEPCIONISTA' || role === 'ENTRENADOR';
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

  private buildPayload(): CreateStaffDto | UpdateStaffDto | null {
    const nombres = this.formModel.nombres.trim();
    const apellidos = this.formModel.apellidos.trim();
    const cedula = this.formModel.cedula.trim();
    const fechaNacimiento = this.formModel.fechaNacimiento.trim();
    const userName = this.formModel.userName.trim();
    const password = this.formModel.password.trim();
    const horario = this.formModel.horario.trim();
    const tenantRole = this.formModel.tenantRole;

    if (!fechaNacimiento || Number.isNaN(Date.parse(fechaNacimiento))) {
      this.validationMessage = 'La fecha de nacimiento no es válida';
      return null;
    }

    if (!this.isEditing && password.length < 6) {
      this.validationMessage = 'La contraseña debe tener al menos 6 caracteres';
      return null;
    }

    if (this.isEditing && password.length > 0 && password.length < 6) {
      this.validationMessage = 'La nueva contraseña debe tener al menos 6 caracteres';
      return null;
    }

    const payload: UpdateStaffDto = {
      nombres,
      apellidos,
      cedula,
      fechaNacimiento,
      tenantRole,
      userName,
    };

    if (password.length > 0) {
      payload.password = password;
    }

    if (this.requiresScheduleAndSalary(tenantRole)) {
      if (!horario) {
        this.validationMessage = 'El horario es obligatorio para este rol';
        return null;
      }

      const sueldo = Number(this.formModel.sueldo);
      if (Number.isNaN(sueldo) || sueldo <= 0) {
        this.validationMessage = 'El sueldo debe ser un número válido mayor a 0';
        return null;
      }

      payload.horario = horario;
      payload.sueldo = sueldo;
    }

    if (!this.isEditing) {
      return {
        nombres,
        apellidos,
        cedula,
        fechaNacimiento,
        tenantRole,
        userName,
        password,
        ...(payload.horario ? { horario: payload.horario } : {}),
        ...(payload.sueldo !== undefined ? { sueldo: payload.sueldo } : {}),
      };
    }

    return payload;
  }

  private focusFirstInvalidField(): void {
    queueMicrotask(() => {
      const firstInvalidField = this.modalRoot?.nativeElement.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );

      firstInvalidField?.focus();
    });
  }

  private createInitialModel(): StaffModalFormModel {
    return {
      nombres: '',
      apellidos: '',
      cedula: '',
      fechaNacimiento: '',
      tenantRole: 'ADMIN',
      userName: '',
      password: '',
      horario: '',
      sueldo: '',
    };
  }

  private createModelFromStaff(staff: StaffItem | null): StaffModalFormModel {
    if (!staff) {
      return this.createInitialModel();
    }

    return {
      nombres: staff.nombres,
      apellidos: staff.apellidos,
      cedula: staff.cedula,
      fechaNacimiento: staff.fechaNacimiento ?? '',
      tenantRole: staff.tenantRole,
      userName: staff.userName,
      password: '',
      horario: staff.horario ?? '',
      sueldo: staff.sueldo !== null ? String(staff.sueldo) : '',
    };
  }
}
