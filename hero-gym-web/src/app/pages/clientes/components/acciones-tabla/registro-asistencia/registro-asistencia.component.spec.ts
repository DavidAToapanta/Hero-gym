import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AsistenciaService } from '../../../../../core/services/asistencia.service';
import { RegistroAsistenciaComponent } from './registro-asistencia.component';

describe('RegistroAsistenciaComponent', () => {
  let component: RegistroAsistenciaComponent;
  let fixture: ComponentFixture<RegistroAsistenciaComponent>;
  let asistenciaServiceSpy: jasmine.SpyObj<AsistenciaService>;

  beforeEach(async () => {
    asistenciaServiceSpy = jasmine.createSpyObj<AsistenciaService>('AsistenciaService', [
      'registrarAsistencia',
      'registrarAsistenciaHistorica',
    ]);
    asistenciaServiceSpy.registrarAsistencia.and.returnValue(of({}));
    asistenciaServiceSpy.registrarAsistenciaHistorica.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [RegistroAsistenciaComponent],
      providers: [{ provide: AsistenciaService, useValue: asistenciaServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroAsistenciaComponent);
    component = fixture.componentInstance;
    component.show = true;
    component.cliente = {
      id: 15,
      horario: '06:00 - 08:00',
      usuario: {
        nombres: 'Luis',
        apellidos: 'Mora',
        cedula: '0102030405',
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register normal attendance', () => {
    component.registrar();

    expect(asistenciaServiceSpy.registrarAsistencia).toHaveBeenCalledOnceWith(15);
    expect(component.successMessage).toContain('asistencia de hoy');
  });

  it('should require a date for historical attendance', () => {
    component.setModo('HISTORICA');
    component.registrar();

    expect(asistenciaServiceSpy.registrarAsistenciaHistorica).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Debes seleccionar la fecha');
  });

  it('should register historical attendance', () => {
    component.setModo('HISTORICA');
    component.fechaHistorica = '2026-04-03';

    component.registrar();

    expect(asistenciaServiceSpy.registrarAsistenciaHistorica).toHaveBeenCalledOnceWith({
      clienteId: 15,
      fecha: '2026-04-03',
    });
    expect(component.successMessage).toContain('asistencia histórica');
  });

  it('should surface backend errors', () => {
    asistenciaServiceSpy.registrarAsistencia.and.returnValue(
      throwError(() => ({ error: { message: 'El cliente esta inactivo' } })),
    );

    component.registrar();

    expect(component.errorMessage).toBe('El cliente esta inactivo');
  });
});
