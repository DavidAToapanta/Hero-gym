import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of, throwError } from 'rxjs';

import {
  AsistenciaService,
  AsistenciaStats,
} from '../../../../core/services/asistencia.service';
import { AsistenciaComponent } from './asistencia.component';

describe('AsistenciaComponent', () => {
  let component: AsistenciaComponent;
  let fixture: ComponentFixture<AsistenciaComponent>;
  let asistenciaServiceSpy: jasmine.SpyObj<AsistenciaService>;

  const estadisticasMock: AsistenciaStats = {
    tienePlanActivo: true,
    diasAsistidos: 8,
    diasTotales: 10,
    porcentajeAsistencia: 80,
    nombrePlan: 'Plan Mensual',
  };
  const historialMock = [{ fecha: '2026-03-20T00:00:00.000Z' }];

  beforeEach(async () => {
    asistenciaServiceSpy = jasmine.createSpyObj<AsistenciaService>(
      'AsistenciaService',
      ['getMiEstadisticas', 'getMiHistorial'],
    );
    asistenciaServiceSpy.getMiEstadisticas.and.returnValue(of(estadisticasMock));
    asistenciaServiceSpy.getMiHistorial.and.returnValue(of(historialMock));

    await TestBed.configureTestingModule({
      imports: [AsistenciaComponent],
      providers: [
        { provide: AsistenciaService, useValue: asistenciaServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load portal cliente stats and history on init', () => {
    expect(asistenciaServiceSpy.getMiEstadisticas).toHaveBeenCalledOnceWith();
    expect(asistenciaServiceSpy.getMiHistorial).toHaveBeenCalledOnceWith();
    expect(component.estadisticas).toEqual(estadisticasMock);
    expect(component.historial).toEqual(historialMock);
    expect(component.cargando).toBeFalse();
    expect(component.error).toBeFalse();
    expect(component.historialError).toBeFalse();
  });

  it('should keep stats visible when history request fails', () => {
    spyOn(console, 'error');
    asistenciaServiceSpy.getMiEstadisticas.calls.reset();
    asistenciaServiceSpy.getMiHistorial.calls.reset();
    asistenciaServiceSpy.getMiEstadisticas.and.returnValue(of(estadisticasMock));
    asistenciaServiceSpy.getMiHistorial.and.returnValue(
      throwError(() => new Error('fallo')),
    );

    component.cargarEstadisticas();

    expect(asistenciaServiceSpy.getMiEstadisticas).toHaveBeenCalledOnceWith();
    expect(asistenciaServiceSpy.getMiHistorial).toHaveBeenCalledOnceWith();
    expect(component.error).toBeFalse();
    expect(component.historialError).toBeTrue();
    expect(component.cargando).toBeFalse();
    expect(component.estadisticas).toEqual(estadisticasMock);
    expect(component.historial).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('should show main error when stats request fails', () => {
    spyOn(console, 'error');
    asistenciaServiceSpy.getMiEstadisticas.calls.reset();
    asistenciaServiceSpy.getMiHistorial.calls.reset();
    asistenciaServiceSpy.getMiEstadisticas.and.returnValue(
      throwError(() => new Error('fallo stats')),
    );
    asistenciaServiceSpy.getMiHistorial.and.returnValue(of(historialMock));

    component.cargarEstadisticas();

    expect(component.error).toBeTrue();
    expect(component.historialError).toBeFalse();
    expect(component.cargando).toBeFalse();
    expect(component.estadisticas).toBeNull();
    expect(component.historial).toEqual(historialMock);
  });
});
