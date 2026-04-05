import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { AuthService, LoginContextSelectionResponse } from '../auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'clearPendingContextSelection',
      'getPendingContextSelection',
      'getPostLoginRoute',
      'isAuthenticated',
      'isContextSelectionResponse',
      'login',
      'selectContext',
    ]);
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.getPendingContextSelection.and.returnValue(null);
    authServiceSpy.getPostLoginRoute.and.returnValue('/dashboard');
    authServiceSpy.isContextSelectionResponse.and.returnValue(false);
    authServiceSpy.login.and.returnValue(of({ access_token: 'token' }));
    authServiceSpy.selectContext.and.returnValue(of({ access_token: 'final-token' }));

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit login credentials when the form is valid', () => {
    component.loginForm.setValue({
      cedula: '0102030405',
      password: 'secreto',
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('0102030405', 'secreto');
  });

  it('should show pending context selection when login requires it', () => {
    const pendingSelection = createPendingSelection();
    authServiceSpy.login.and.returnValue(of(pendingSelection));
    authServiceSpy.isContextSelectionResponse.and.returnValue(true);

    component.loginForm.setValue({
      cedula: '0102030405',
      password: 'secreto',
    });

    component.onSubmit();

    expect(component.pendingSelection).toEqual(pendingSelection);
  });

  it('should send the selected context and access mode', () => {
    component.pendingSelection = createPendingSelection();
    const selectedContext = component.pendingSelection.contexts[0];

    component.onSelectContext(selectedContext, 'PLATFORM');

    expect(authServiceSpy.selectContext).toHaveBeenCalledWith(
      'selection-token',
      selectedContext,
      'PLATFORM',
    );
  });
});

function createPendingSelection(): LoginContextSelectionResponse {
  return {
    requiresContextSelection: true,
    selectionToken: 'selection-token',
    requestedAccessMode: 'PLATFORM',
    contexts: [
      {
        contextId: 'tenant-hero-norte-owner',
        type: 'STAFF',
        tenantId: 1,
        tenantNombre: 'Hero Gym Norte',
        clienteId: null,
        tenantRole: 'OWNER',
        allowedModes: ['PLATFORM', 'ASISTENCIA'],
      },
    ],
  };
}
