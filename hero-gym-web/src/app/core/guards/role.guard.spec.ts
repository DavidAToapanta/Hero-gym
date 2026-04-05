import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getPostLoginRoute',
      'getTenantRole',
      'getUserRole',
      'hasRole',
      'hasTenantRole',
      'isAuthenticated',
      'isClientePortalUser',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerSpy.navigate.and.resolveTo(true);
    authServiceSpy.getPostLoginRoute.and.returnValue('/dashboard');
    authServiceSpy.getTenantRole.and.returnValue('ADMIN');
    authServiceSpy.getUserRole.and.returnValue('ADMIN');
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.hasTenantRole.and.returnValue(true);
    authServiceSpy.hasRole.and.returnValue(true);
    authServiceSpy.isClientePortalUser.and.returnValue(false);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('should allow staff routes when tenantRole is permitted', () => {
    const canActivate = guard.canActivate(
      createRouteSnapshot({ tenantRoles: ['OWNER', 'ADMIN'] }),
      createStateSnapshot('/dashboard/administracion'),
    );

    expect(canActivate).toBeTrue();
    expect(authServiceSpy.hasTenantRole).toHaveBeenCalledWith(['OWNER', 'ADMIN']);
  });

  it('should keep legacy staff compatibility when tenantRole is missing', () => {
    authServiceSpy.getTenantRole.and.returnValue(null);
    authServiceSpy.getUserRole.and.returnValue('ADMIN');
    authServiceSpy.hasTenantRole.and.returnValue(true);

    const canActivate = guard.canActivate(
      createRouteSnapshot({ tenantRoles: ['OWNER', 'ADMIN'] }),
      createStateSnapshot('/dashboard/administracion'),
    );

    expect(canActivate).toBeTrue();
    expect(authServiceSpy.hasTenantRole).toHaveBeenCalledWith(['OWNER', 'ADMIN']);
  });

  it('should allow client portal routes for cliente context', () => {
    authServiceSpy.isClientePortalUser.and.returnValue(true);

    const canActivate = guard.canActivate(
      createRouteSnapshot({ clientPortal: true }),
      createStateSnapshot('/cliente'),
    );

    expect(canActivate).toBeTrue();
  });

  it('should redirect to post-login route when a client tries to enter staff routes', () => {
    authServiceSpy.hasTenantRole.and.returnValue(false);
    authServiceSpy.getTenantRole.and.returnValue(null);
    authServiceSpy.getUserRole.and.returnValue('CLIENTE');
    authServiceSpy.getPostLoginRoute.and.returnValue('/cliente');

    const canActivate = guard.canActivate(
      createRouteSnapshot({ tenantRoles: ['OWNER', 'ADMIN'] }),
      createStateSnapshot('/dashboard/administracion'),
    );

    expect(canActivate).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/cliente'], { replaceUrl: true });
  });
});

function createRouteSnapshot(data: Record<string, unknown>) {
  return {
    data,
  } as never;
}

function createStateSnapshot(url: string) {
  return {
    url,
  } as never;
}
