import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { finalize } from 'rxjs';

import { extractErrorMessage } from '../../core/utils/http-error.utils';
import {
  AuthAccessMode,
  AuthContext,
  AuthService,
  LoginContextSelectionResponse,
} from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  readonly loginForm;

  errorMessage = '';
  contextSelectionError = '';
  entryAccessMode: AuthAccessMode = 'PLATFORM';
  isSubmitting = false;
  isSelectingContext = false;
  pendingSelection: LoginContextSelectionResponse | null = null;
  selectedContext: AuthContext | null = null;
  selectedAccessMode: AuthAccessMode | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.loginForm = this.fb.nonNullable.group({
      cedula: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.syncEntryAccessModeFromQuery();

    if (this.redirectAuthenticatedUser()) {
      return;
    }

    this.pendingSelection = this.authService.getPendingContextSelection();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    const { cedula, password } = this.loginForm.getRawValue();

    this.errorMessage = '';
    this.contextSelectionError = '';
    this.pendingSelection = null;
    this.isSubmitting = true;

    this.authService
      .login(cedula.trim(), password, this.entryAccessMode)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          if (this.authService.isContextSelectionResponse(response)) {
            this.pendingSelection = response;
          }
        },
        error: (error) => {
          this.errorMessage = extractErrorMessage(
            error,
            'No se pudo iniciar sesión. Verifica tus credenciales e intenta de nuevo.',
          );
        },
      });
  }

  onSelectContext(context: AuthContext, accessMode: AuthAccessMode): void {
    if (!this.pendingSelection || this.isSelectingContext) {
      return;
    }

    this.errorMessage = '';
    this.contextSelectionError = '';
    this.isSelectingContext = true;
    this.selectedContext = context;
    this.selectedAccessMode = accessMode;

    this.authService
      .selectContext(this.pendingSelection.selectionToken, context, accessMode)
      .pipe(finalize(() => this.resetContextSelectionState()))
      .subscribe({
        next: () => {},
        error: (error) => {
          this.contextSelectionError = extractErrorMessage(
            error,
            'No se pudo completar el acceso para este contexto. Intenta nuevamente.',
          );
        },
      });
  }

  onBackToLogin(): void {
    this.authService.clearPendingContextSelection();
    this.pendingSelection = null;
    this.contextSelectionError = '';
    this.resetContextSelectionState();
  }

  getFieldError(controlName: 'cedula' | 'password'): string | null {
    const control = this.loginForm.controls[controlName];

    if (!control.touched || !control.invalid) {
      return null;
    }

    if (control.hasError('required')) {
      return controlName === 'cedula'
        ? 'La cédula es obligatoria.'
        : 'La contraseña es obligatoria.';
    }

    return null;
  }

  setEntryAccessMode(accessMode: AuthAccessMode): void {
    if (this.entryAccessMode === accessMode) {
      return;
    }

    this.entryAccessMode = accessMode;

    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        mode: accessMode === 'ASISTENCIA' ? 'asistencia' : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  isEntryAccessMode(accessMode: AuthAccessMode): boolean {
    return this.entryAccessMode === accessMode;
  }

  getContextTitle(context: AuthContext): string {
    return context.tenantNombre ?? 'Contexto disponible';
  }

  getContextTypeLabel(context: AuthContext): string {
    return context.type === 'STAFF' ? `Staff · ${context.tenantRole ?? 'Sin Rol'}` : 'Cliente';
  }

  getContextModesLabel(context: AuthContext): string {
    return context.allowedModes.map((mode) => this.getAccessModeLabel(mode)).join(', ');
  }

  getOrderedModes(context: AuthContext): AuthAccessMode[] {
    const requestedAccessMode = this.pendingSelection?.requestedAccessMode;
    const modePriority: Record<AuthAccessMode, number> = {
      PLATFORM: requestedAccessMode === 'PLATFORM' ? 0 : 1,
      ASISTENCIA: requestedAccessMode === 'ASISTENCIA' ? 0 : 1,
    };

    return [...context.allowedModes].sort((leftMode, rightMode) => {
      if (modePriority[leftMode] !== modePriority[rightMode]) {
        return modePriority[leftMode] - modePriority[rightMode];
      }

      return leftMode.localeCompare(rightMode);
    });
  }

  getAccessModeLabel(accessMode: AuthAccessMode): string {
    return accessMode === 'ASISTENCIA' ? 'Asistencia' : 'Panel';
  }

  getAccessButtonLabel(accessMode: AuthAccessMode): string {
    return accessMode === 'ASISTENCIA' ? 'Entrar a Asistencia' : 'Entrar al Panel';
  }

  getContextActionButtonClasses(isPrimaryAction: boolean): string {
    return isPrimaryAction
      ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-amber-200'
      : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-200';
  }

  isContextActionLoading(context: AuthContext, accessMode: AuthAccessMode): boolean {
    return (
      this.isSelectingContext &&
      this.selectedContext?.contextId === context.contextId &&
      this.selectedAccessMode === accessMode
    );
  }

  private redirectAuthenticatedUser(): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    this.router.navigate([this.authService.getPostLoginRoute()], { replaceUrl: true });
    return true;
  }

  private focusFirstInvalidField(): void {
    const firstInvalidControlName = this.loginForm.controls.cedula.invalid ? 'cedula' : 'password';
    document.getElementById(firstInvalidControlName)?.focus();
  }

  private resetContextSelectionState(): void {
    this.isSelectingContext = false;
    this.selectedContext = null;
    this.selectedAccessMode = null;
  }

  private syncEntryAccessModeFromQuery(): void {
    this.entryAccessMode =
      this.route.snapshot.queryParamMap.get('mode') === 'asistencia' ? 'ASISTENCIA' : 'PLATFORM';
  }
}
