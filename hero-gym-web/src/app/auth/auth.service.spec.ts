import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthContext, AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should send the staff payload expected by select-context', () => {
    const context: AuthContext = {
      contextId: 'staff:1:OWNER',
      type: 'STAFF',
      tenantId: 1,
      tenantNombre: 'Hero Gym Norte',
      clienteId: null,
      tenantRole: 'OWNER',
      allowedModes: ['PLATFORM', 'ASISTENCIA'],
    };

    service.selectContext('selection-token', context, 'PLATFORM').subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/auth/select-context`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      selectionToken: 'selection-token',
      type: 'STAFF',
      tenantId: 1,
      tenantRole: 'OWNER',
      accessMode: 'PLATFORM',
    });

    request.flush({
      access_token: createJwt({
        sub: 1,
        rol: 'ADMIN',
        tenantId: 1,
        tenantRole: 'OWNER',
        accessMode: 'PLATFORM',
      }),
    });
  });

  it('should send the client payload expected by select-context', () => {
    const context: AuthContext = {
      contextId: 'cliente:1:25',
      type: 'CLIENTE',
      tenantId: 1,
      tenantNombre: 'Hero Gym Norte',
      clienteId: 25,
      tenantRole: null,
      allowedModes: ['PLATFORM'],
    };

    service.selectContext('selection-token', context, 'PLATFORM').subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/auth/select-context`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      selectionToken: 'selection-token',
      type: 'CLIENTE',
      tenantId: 1,
      clienteId: 25,
      accessMode: 'PLATFORM',
    });

    request.flush({
      access_token: createJwt({
        sub: 2,
        rol: 'CLIENTE',
        tenantId: 1,
        clienteId: 25,
        accessMode: 'PLATFORM',
      }),
    });
  });
});

function createJwt(payload: Record<string, unknown>): string {
  return `header.${encodeBase64Url(JSON.stringify(payload))}.signature`;
}

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
