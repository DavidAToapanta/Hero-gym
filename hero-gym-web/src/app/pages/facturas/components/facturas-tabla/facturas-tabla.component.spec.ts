import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasTablaComponent } from './facturas-tabla.component';
import { FacturaService } from '../../../../core/services/factura.service';
import { PagoService } from '../../../../core/services/pago.service';

describe('FacturasTablaComponent', () => {
  let component: FacturasTablaComponent;
  let fixture: ComponentFixture<FacturasTablaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturasTablaComponent],
      providers: [
        {
          provide: PagoService,
          useValue: {
            createPago: jasmine.createSpy('createPago'),
          },
        },
        {
          provide: FacturaService,
          useValue: {
            devolver: jasmine.createSpy('devolver'),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturasTablaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
