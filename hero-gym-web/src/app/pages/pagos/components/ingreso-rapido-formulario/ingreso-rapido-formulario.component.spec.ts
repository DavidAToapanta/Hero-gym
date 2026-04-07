import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { IngresosRapidosService } from '../../../../core/services/ingresos-rapidos.service';
import { IngresoRapidoFormularioComponent } from './ingreso-rapido-formulario.component';

describe('IngresoRapidoFormularioComponent', () => {
  let component: IngresoRapidoFormularioComponent;
  let fixture: ComponentFixture<IngresoRapidoFormularioComponent>;
  let ingresosRapidosServiceSpy: jasmine.SpyObj<IngresosRapidosService>;

  beforeEach(async () => {
    ingresosRapidosServiceSpy = jasmine.createSpyObj<IngresosRapidosService>('IngresosRapidosService', [
      'createIngresoRapido',
    ]);
    ingresosRapidosServiceSpy.createIngresoRapido.and.returnValue(
      of({ id: 1, concepto: 'Pase diario', monto: 5 }),
    );

    await TestBed.configureTestingModule({
      imports: [IngresoRapidoFormularioComponent],
      providers: [{ provide: IngresosRapidosService, useValue: ingresosRapidosServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoRapidoFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses Pase diario as the default concept', () => {
    expect(component.ingreso.concepto).toBe('Pase diario');
  });

  it('should validate required fields before saving', () => {
    component.ingresoRapidoForm = {
      invalid: true,
      form: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') },
      resetForm: jasmine.createSpy('resetForm'),
    } as any;
    component.ingreso.concepto = '';
    component.ingreso.monto = null;

    component.guardar();

    expect(ingresosRapidosServiceSpy.createIngresoRapido).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Completa el concepto');
  });

  it('should register a quick income', () => {
    spyOn(component.save, 'emit');
    spyOn(component.close, 'emit');
    component.ingresoRapidoForm = {
      invalid: false,
      form: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') },
      resetForm: jasmine.createSpy('resetForm'),
    } as any;
    component.ingreso.monto = 7.5;

    component.guardar();

    expect(ingresosRapidosServiceSpy.createIngresoRapido).toHaveBeenCalledOnceWith({
      concepto: 'Pase diario',
      monto: 7.5,
    });
    expect(component.save.emit).toHaveBeenCalled();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should surface backend errors inline', () => {
    ingresosRapidosServiceSpy.createIngresoRapido.and.returnValue(
      throwError(() => ({ error: { message: 'Monto invalido' } })),
    );
    component.ingresoRapidoForm = {
      invalid: false,
      form: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') },
      resetForm: jasmine.createSpy('resetForm'),
    } as any;
    component.ingreso.monto = 10;

    component.guardar();

    expect(component.errorMessage).toBe('Monto invalido');
    expect(component.isSubmitting).toBeFalse();
  });
});
