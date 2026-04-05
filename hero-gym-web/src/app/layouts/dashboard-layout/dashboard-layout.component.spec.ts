import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { DashboardLayoutComponent } from './dashboard-layout.component';

describe('DashboardLayoutComponent', () => {
  let component: DashboardLayoutComponent;
  let fixture: ComponentFixture<DashboardLayoutComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getDecodedToken',
      'getTenantRole',
      'getUserRole',
      'hasTenantRole',
      'isOwner',
      'logout',
    ]);

    authServiceSpy.getDecodedToken.and.returnValue({
      sub: 1,
      rol: 'ADMIN',
      tenantId: 1,
      tenantRole: 'OWNER',
      clienteId: null,
      accessMode: 'PLATFORM',
      cedula: '0102030405',
      userName: 'hero.owner',
    });
    authServiceSpy.getTenantRole.and.returnValue('OWNER');
    authServiceSpy.getUserRole.and.returnValue('ADMIN');
    authServiceSpy.isOwner.and.returnValue(true);
    authServiceSpy.hasTenantRole.and.callFake((roles: string[]) => roles.includes('OWNER'));

    await TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should derive owner access flags from tenantRole', () => {
    expect(component.roleLabel).toBe('Owner');
    expect(component.isOwner).toBeTrue();
    expect(component.isAdminLike).toBeTrue();
    expect(component.canManageClientes).toBeTrue();
    expect(component.canViewClientesAnulados).toBeTrue();
    expect(component.canManageProductos).toBeTrue();
    expect(component.canManagePagos).toBeTrue();
    expect(component.canManageFacturas).toBeTrue();
    expect(component.canManageAdministracion).toBeTrue();
  });
});
