import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { finalize } from 'rxjs';

import { extractErrorMessage } from '../../core/utils/http-error.utils';
import { AuthService, RegisterOwnerDto } from '../auth.service';

type RegisterOwnerField =
  | 'cedula'
  | 'password'
  | 'nombres'
  | 'apellidos'
  | 'email'
  | 'tenantNombre'
  | 'userName'
  | 'tenantSlug'
  | 'tenantEmail'
  | 'telefono'
  | 'direccion'
  | 'ciudad'
  | 'pais'
  | 'logoUrl'
  | 'descripcion';

type RegisterOwnerFormGroup = FormGroup<{
  cedula: FormControl<string>;
  password: FormControl<string>;
  nombres: FormControl<string>;
  apellidos: FormControl<string>;
  email: FormControl<string>;
  tenantNombre: FormControl<string>;
  userName: FormControl<string>;
  tenantSlug: FormControl<string>;
  tenantEmail: FormControl<string>;
  telefono: FormControl<string>;
  direccion: FormControl<string>;
  ciudad: FormControl<string>;
  pais: FormControl<string>;
  logoUrl: FormControl<string>;
  descripcion: FormControl<string>;
}>;

@Component({
  selector: 'app-register-owner',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-owner.component.html',
  styleUrls: ['./register-owner.component.css'],
})
export class RegisterOwnerComponent implements OnInit {
  readonly registerForm: RegisterOwnerFormGroup;
  readonly optionalFieldNames: RegisterOwnerField[] = [
    'userName',
    'tenantSlug',
    'tenantEmail',
    'telefono',
    'direccion',
    'ciudad',
    'pais',
    'logoUrl',
    'descripcion',
  ];

  errorMessage = '';
  isSubmitting = false;
  showOptionalFields = false;

  private readonly fieldLabels: Record<RegisterOwnerField, string> = {
    cedula: 'la cédula',
    password: 'la contraseña',
    nombres: 'los nombres',
    apellidos: 'los apellidos',
    email: 'el correo',
    tenantNombre: 'el nombre del gimnasio',
    userName: 'el nombre de usuario',
    tenantSlug: 'el slug del gimnasio',
    tenantEmail: 'el correo del gimnasio',
    telefono: 'el teléfono',
    direccion: 'la dirección',
    ciudad: 'la ciudad',
    pais: 'el país',
    logoUrl: 'la URL del logo',
    descripcion: 'la descripción',
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.nonNullable.group({
      cedula: ['', Validators.required],
      password: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tenantNombre: ['', Validators.required],
      userName: [''],
      tenantSlug: [''],
      tenantEmail: ['', Validators.email],
      telefono: [''],
      direccion: [''],
      ciudad: [''],
      pais: [''],
      logoUrl: [''],
      descripcion: [''],
    });
  }

  ngOnInit(): void {
    this.redirectAuthenticatedUser();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      if (this.hasOptionalFieldErrors()) {
        this.showOptionalFields = true;
      }

      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService
      .registerOwner(this.buildPayload())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {},
        error: (error) => {
          this.errorMessage = extractErrorMessage(
            error,
            'No se pudo completar el registro del gimnasio.',
          );
        },
      });
  }

  toggleOptionalFields(): void {
    this.showOptionalFields = !this.showOptionalFields;
  }

  getFieldError(controlName: RegisterOwnerField): string | null {
    const control = this.registerForm.controls[controlName];

    if (!control.touched || !control.invalid) {
      return null;
    }

    if (control.hasError('required')) {
      return `Debes completar ${this.fieldLabels[controlName]}.`;
    }

    if (control.hasError('email')) {
      return 'Ingresa un correo válido.';
    }

    return null;
  }

  private buildPayload(): RegisterOwnerDto {
    const formValue = this.registerForm.getRawValue();

    return {
      cedula: formValue.cedula,
      password: formValue.password,
      nombres: formValue.nombres,
      apellidos: formValue.apellidos,
      email: formValue.email,
      tenantNombre: formValue.tenantNombre,
      userName: formValue.userName,
      tenantSlug: formValue.tenantSlug,
      tenantEmail: formValue.tenantEmail,
      telefono: formValue.telefono,
      direccion: formValue.direccion,
      ciudad: formValue.ciudad,
      pais: formValue.pais,
      logoUrl: formValue.logoUrl,
      descripcion: formValue.descripcion,
    };
  }

  private hasOptionalFieldErrors(): boolean {
    return this.optionalFieldNames.some((fieldName) => this.registerForm.controls[fieldName].invalid);
  }

  private redirectAuthenticatedUser(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.router.navigate([this.authService.getPostLoginRoute()], { replaceUrl: true });
  }
}
