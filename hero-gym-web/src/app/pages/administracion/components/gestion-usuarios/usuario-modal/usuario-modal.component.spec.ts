import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LucideAngularModule, UserPlus, X } from 'lucide-angular';

import { UsuarioModalComponent } from './usuario-modal.component';

describe('UsuarioModalComponent', () => {
  let component: UsuarioModalComponent;
  let fixture: ComponentFixture<UsuarioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioModalComponent],
      providers: [
        importProvidersFrom(
          LucideAngularModule.pick({
            UserPlus,
            X,
          }),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit a create payload with horario and sueldo for recepcionista', () => {
    const saveSpy = spyOn(component.save, 'emit');

    component.formModel = {
      nombres: 'Laura',
      apellidos: 'Mena',
      cedula: '0912345678',
      fechaNacimiento: '1991-03-20',
      tenantRole: 'RECEPCIONISTA',
      userName: 'laura.mena',
      password: '123456',
      horario: 'L-V 07:00-15:00',
      sueldo: '650',
    };
    component.staffForm = {
      invalid: false,
      form: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') },
    } as never;

    component.guardar();

    expect(saveSpy).toHaveBeenCalledWith({
      nombres: 'Laura',
      apellidos: 'Mena',
      cedula: '0912345678',
      fechaNacimiento: '1991-03-20',
      tenantRole: 'RECEPCIONISTA',
      userName: 'laura.mena',
      password: '123456',
      horario: 'L-V 07:00-15:00',
      sueldo: 650,
    });
  });

  it('should omit horario and sueldo for admin payloads', () => {
    const saveSpy = spyOn(component.save, 'emit');

    component.formModel = {
      nombres: 'Mateo',
      apellidos: 'Rojas',
      cedula: '0101010101',
      fechaNacimiento: '1988-11-02',
      tenantRole: 'ADMIN',
      userName: 'mateo.rojas',
      password: '123456',
      horario: 'L-V 09:00-17:00',
      sueldo: '900',
    };
    component.staffForm = {
      invalid: false,
      form: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') },
    } as never;

    component.guardar();

    expect(saveSpy).toHaveBeenCalledWith({
      nombres: 'Mateo',
      apellidos: 'Rojas',
      cedula: '0101010101',
      fechaNacimiento: '1988-11-02',
      tenantRole: 'ADMIN',
      userName: 'mateo.rojas',
      password: '123456',
    });
  });

  it('should allow editing without forcing a new password', () => {
    const saveSpy = spyOn(component.save, 'emit');

    component.staff = {
      usuarioId: 7,
      tenantId: 1,
      nombres: 'Nora',
      apellidos: 'Paz',
      cedula: '0202020202',
      fechaNacimiento: '1990-01-15',
      tenantRole: 'ENTRENADOR',
      horario: 'L-V 06:00-12:00',
      sueldo: 700,
      estado: 'ACTIVO',
      usuario: {
        id: 7,
        userName: 'nora.paz',
        email: null,
        estado: 'ACTIVO',
      },
      userName: 'nora.paz',
      email: null,
    };
    component.ngOnChanges({
      staff: {
        currentValue: component.staff,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();

    component.formModel.password = '';
    component.staffForm = {
      invalid: false,
      form: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') },
    } as never;
    component.guardar();

    expect(saveSpy).toHaveBeenCalledWith({
      nombres: 'Nora',
      apellidos: 'Paz',
      cedula: '0202020202',
      fechaNacimiento: '1990-01-15',
      tenantRole: 'ENTRENADOR',
      userName: 'nora.paz',
      horario: 'L-V 06:00-12:00',
      sueldo: 700,
    });
  });
});
