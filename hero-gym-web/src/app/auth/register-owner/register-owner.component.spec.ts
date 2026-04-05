import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { AuthService } from '../auth.service';
import { RegisterOwnerComponent } from './register-owner.component';

describe('RegisterOwnerComponent', () => {
  let component: RegisterOwnerComponent;
  let fixture: ComponentFixture<RegisterOwnerComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUserRole',
      'isAuthenticated',
      'registerOwner',
    ]);
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.registerOwner.and.returnValue(of({ access_token: 'token' }));

    await TestBed.configureTestingModule({
      imports: [RegisterOwnerComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(RegisterOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit register owner data when the form is valid', () => {
    component.registerForm.setValue({
      cedula: '0102030405',
      password: 'secreto',
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan@example.com',
      tenantNombre: 'Hero Gym Centro',
      userName: '',
      tenantSlug: '',
      tenantEmail: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      pais: '',
      logoUrl: '',
      descripcion: '',
    });

    component.onSubmit();

    expect(authServiceSpy.registerOwner).toHaveBeenCalledWith({
      cedula: '0102030405',
      password: 'secreto',
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan@example.com',
      tenantNombre: 'Hero Gym Centro',
      userName: '',
      tenantSlug: '',
      tenantEmail: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      pais: '',
      logoUrl: '',
      descripcion: '',
    });
  });
});
