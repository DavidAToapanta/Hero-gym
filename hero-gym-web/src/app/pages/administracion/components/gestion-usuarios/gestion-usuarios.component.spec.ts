import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  AlertCircle,
  AlertTriangle,
  Info,
  LucideAngularModule,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  RotateCcw,
  UserPlus,
  Users,
  X,
} from 'lucide-angular';
import { of } from 'rxjs';

import { UsuarioService } from '../../../../core/services/usuario.service';
import { GestionUsuariosComponent } from './gestion-usuarios.component';

describe('GestionUsuariosComponent', () => {
  let component: GestionUsuariosComponent;
  let fixture: ComponentFixture<GestionUsuariosComponent>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;

  const staffBase = {
    usuarioId: 8,
    tenantId: 1,
    nombres: 'Laura',
    apellidos: 'Mena',
    cedula: '0912345678',
    fechaNacimiento: '1991-03-20',
    tenantRole: 'RECEPCIONISTA' as const,
    horario: 'L-V 07:00-15:00',
    sueldo: 650,
    estado: 'ACTIVO' as const,
    usuario: {
      id: 8,
      userName: 'laura.mena',
      email: null,
      estado: 'ACTIVO' as const,
    },
    userName: 'laura.mena',
    email: null,
  };

  beforeEach(async () => {
    usuarioServiceSpy = jasmine.createSpyObj<UsuarioService>('UsuarioService', [
      'getStaff',
      'getStaffById',
      'createStaff',
      'updateStaff',
      'inactivarStaff',
      'reactivarStaff',
    ]);

    usuarioServiceSpy.getStaff.and.returnValue(of([staffBase]));
    usuarioServiceSpy.getStaffById.and.returnValue(of(staffBase));
    usuarioServiceSpy.createStaff.and.returnValue(of(staffBase));
    usuarioServiceSpy.updateStaff.and.returnValue(of(staffBase));
    usuarioServiceSpy.inactivarStaff.and.returnValue(of(null));
    usuarioServiceSpy.reactivarStaff.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [GestionUsuariosComponent],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        importProvidersFrom(
          LucideAngularModule.pick({
            AlertCircle,
            AlertTriangle,
            Info,
            Pencil,
            Plus,
            Power,
            PowerOff,
            RefreshCw,
            RotateCcw,
            UserPlus,
            Users,
            X,
          }),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load staff from the tenant on init', () => {
    expect(usuarioServiceSpy.getStaff).toHaveBeenCalled();
    expect(component.staff.length).toBe(1);
    expect(component.staff[0]?.userName).toBe('laura.mena');
  });

  it('should open the modal in create mode', () => {
    component.abrirModal();

    expect(component.showModal).toBeTrue();
    expect(component.staffEditando).toBeNull();
  });

  it('should fetch the selected staff before editing', () => {
    component.editarStaff(staffBase);

    expect(usuarioServiceSpy.getStaffById).toHaveBeenCalledWith(8);
    expect(component.showModal).toBeTrue();
    expect(component.staffEditando?.usuarioId).toBe(8);
  });

  it('should create staff through the new /staff flow', () => {
    component.guardarStaff({
      nombres: 'Carlos',
      apellidos: 'Paz',
      cedula: '0101010101',
      fechaNacimiento: '1988-11-02',
      tenantRole: 'ADMIN',
      userName: 'carlos.paz',
      password: '123456',
    });

    expect(usuarioServiceSpy.createStaff).toHaveBeenCalledWith({
      nombres: 'Carlos',
      apellidos: 'Paz',
      cedula: '0101010101',
      fechaNacimiento: '1988-11-02',
      tenantRole: 'ADMIN',
      userName: 'carlos.paz',
      password: '123456',
    });
  });

  it('should inactivate active staff through the status endpoint', () => {
    component.abrirConfirmacion(staffBase);
    component.confirmarCambioEstado();

    expect(usuarioServiceSpy.inactivarStaff).toHaveBeenCalledWith(8);
  });
});
