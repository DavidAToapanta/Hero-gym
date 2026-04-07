import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { ClientePlanService } from '../../../../core/services/cliente-plan.service';
import { AccionesTablaComponent } from './acciones-tabla.component';

@Component({
  selector: 'app-renovar',
  standalone: true,
  template: '',
})
class RenovarStubComponent {
  @Input() show = false;
  @Input() cliente: unknown;
  @Output() close = new EventEmitter<void>();
  @Output() renovado = new EventEmitter<unknown>();
}

@Component({
  selector: 'app-productos-ciente',
  standalone: true,
  template: '',
})
class ProductosClienteStubComponent {
  @Input() show = false;
  @Input() cliente: unknown;
  @Output() close = new EventEmitter<void>();
}

@Component({
  selector: 'app-gestion',
  standalone: true,
  template: '',
})
class GestionStubComponent {
  @Input() show = false;
  @Input() cliente: unknown;
  @Output() close = new EventEmitter<void>();
  @Output() desactivar = new EventEmitter<number>();
  @Output() planCambiado = new EventEmitter<void>();
}

@Component({
  selector: 'app-registro-asistencia',
  standalone: true,
  template: '',
})
class RegistroAsistenciaStubComponent {
  @Input() show = false;
  @Input() cliente: unknown;
  @Output() close = new EventEmitter<void>();
  @Output() asistenciaRegistrada = new EventEmitter<void>();
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: '',
})
class ConfirmDialogStubComponent {
  @Input() show = false;
  @Input() title = '';
  @Input() message = '';
  @Input() confirmText = '';
  @Input() cancelText = '';
  @Input() type = '';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}

describe('AccionesTablaComponent', () => {
  let component: AccionesTablaComponent;
  let fixture: ComponentFixture<AccionesTablaComponent>;

  beforeEach(async () => {
    const clientePlanServiceMock = {
      quitarPlan: jasmine.createSpy('quitarPlan').and.returnValue(of({ mensaje: 'ok' })),
    };

    await TestBed.configureTestingModule({
      imports: [AccionesTablaComponent],
      providers: [{ provide: ClientePlanService, useValue: clientePlanServiceMock }],
    })
      .overrideComponent(AccionesTablaComponent, {
        set: {
          imports: [
            CommonModule,
            RenovarStubComponent,
            ProductosClienteStubComponent,
            GestionStubComponent,
            RegistroAsistenciaStubComponent,
            ConfirmDialogStubComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AccionesTablaComponent);
    component = fixture.componentInstance;
    component.cliente = {
      id: 10,
      horario: '06:00 - 08:00',
      planes: [
        {
          id: 77,
          fechaFin: '2099-12-31T00:00:00.000Z',
          plan: { nombre: 'Plan Pro' },
        },
      ],
      usuario: {
        nombres: 'Ana',
        apellidos: 'Lopez',
        cedula: '0102030405',
      },
    };
    fixture.detectChanges();
  });

  function getRegistroAsistenciaStub(): RegistroAsistenciaStubComponent {
    return fixture.debugElement.query(By.directive(RegistroAsistenciaStubComponent)).componentInstance;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the attendance modal from the action button', () => {
    const button = fixture.debugElement
      .queryAll(By.css('button'))
      .find((debugElement) =>
        (debugElement.nativeElement.textContent as string).includes('Registrar asistencia'),
      );

    expect(button).toBeDefined();

    button?.nativeElement.click();
    fixture.detectChanges();

    expect(component.showRegistroAsistenciaModal).toBeTrue();
    expect(getRegistroAsistenciaStub().show).toBeTrue();
  });

  it('closes the attendance modal when the child emits close', () => {
    component.abrirRegistroAsistencia();
    fixture.detectChanges();

    getRegistroAsistenciaStub().close.emit();
    fixture.detectChanges();

    expect(component.showRegistroAsistenciaModal).toBeFalse();
    expect(getRegistroAsistenciaStub().show).toBeFalse();
  });

  it('propagates asistenciaRegistrada and closes the actions modal', () => {
    spyOn(component.asistenciaRegistrada, 'emit');
    spyOn(component.cerrado, 'emit');

    component.abrirRegistroAsistencia();
    fixture.detectChanges();

    getRegistroAsistenciaStub().asistenciaRegistrada.emit();
    fixture.detectChanges();

    expect(component.asistenciaRegistrada.emit).toHaveBeenCalled();
    expect(component.cerrado.emit).toHaveBeenCalled();
    expect(component.showRegistroAsistenciaModal).toBeFalse();
  });
});
