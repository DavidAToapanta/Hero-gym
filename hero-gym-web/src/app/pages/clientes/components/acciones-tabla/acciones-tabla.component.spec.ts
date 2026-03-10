import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AccionesTablaComponent } from './acciones-tabla.component';
import { ClientePlanService } from '../../../../core/services/cliente-plan.service';

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
    .compileComponents();

    fixture = TestBed.createComponent(AccionesTablaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
