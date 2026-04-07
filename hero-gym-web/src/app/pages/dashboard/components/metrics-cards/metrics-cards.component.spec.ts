import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ClientePlanService } from '../../../../core/services/cliente-plan.service';
import { DeudaService } from '../../../../core/services/deuda.service';
import { EstadisticasService } from '../../../../core/services/estadisticas.service';
import { PagoService } from '../../../../core/services/pago.service';
import { MetricsCardsComponent } from './metrics-cards.component';

describe('MetricsCardsComponent', () => {
  let component: MetricsCardsComponent;
  let fixture: ComponentFixture<MetricsCardsComponent>;
  let estadisticasServiceSpy: jasmine.SpyObj<EstadisticasService>;

  beforeEach(async () => {
    estadisticasServiceSpy = jasmine.createSpyObj<EstadisticasService>('EstadisticasService', ['getIngresos']);
    estadisticasServiceSpy.getIngresos.and.callFake((periodo: 'dia' | 'mes' | 'anio') => {
      if (periodo === 'dia') {
        return of({ labels: ['08:00', '10:00'], data: [12, 8] });
      }

      return of({ labels: ['abril'], data: [1200] });
    });

    await TestBed.configureTestingModule({
      imports: [MetricsCardsComponent],
      providers: [
        {
          provide: ClientePlanService,
          useValue: {
            getClientesActivos: () => of({ activos: 15 }),
          },
        },
        {
          provide: PagoService,
          useValue: {
            getIngresosDelMes: () => of(1200),
          },
        },
        {
          provide: DeudaService,
          useValue: {
            getDeudoresCount: () => of({ total: 4 }),
          },
        },
        { provide: EstadisticasService, useValue: estadisticasServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricsCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads ingresos del dia from the daily stats endpoint', () => {
    expect(estadisticasServiceSpy.getIngresos).toHaveBeenCalledWith('dia');
    expect(component.ingresosDia).toBe(20);
  });

  it('renders the Ingresos del día card', () => {
    const content = fixture.nativeElement.textContent as string;

    expect(content).toContain('Ingresos del día');
  });
});
