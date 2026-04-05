import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  Layers,
  LucideAngularModule,
  ShieldCheck,
  ShieldOff,
  Users,
} from 'lucide-angular';
import { Subject, of } from 'rxjs';

import { PlanService } from '../../../../core/services/plan.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { AdminStatsComponent } from './admin-stats.component';

describe('AdminStatsComponent', () => {
  let component: AdminStatsComponent;
  let fixture: ComponentFixture<AdminStatsComponent>;
  let planServiceSpy: jasmine.SpyObj<PlanService>;
  let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;
  let staffChanged$: Subject<void>;

  beforeEach(async () => {
    staffChanged$ = new Subject<void>();
    planServiceSpy = jasmine.createSpyObj<PlanService>('PlanService', ['getPlanes']);
    usuarioServiceSpy = jasmine.createSpyObj<UsuarioService>('UsuarioService', ['getStaff'], {
      staffChanged$: staffChanged$.asObservable(),
    });

    planServiceSpy.getPlanes.and.returnValue(of({ data: [], total: 3, page: 1, totalPages: 1 }));
    usuarioServiceSpy.getStaff.and.returnValue(
      of([
        {
          usuarioId: 1,
          tenantId: 1,
          nombres: 'Ana',
          apellidos: 'Vega',
          cedula: '0102030405',
          fechaNacimiento: '1990-01-01',
          tenantRole: 'ADMIN',
          horario: null,
          sueldo: null,
          estado: 'ACTIVO',
          usuario: { id: 1, userName: 'ana.vega', email: null, estado: 'ACTIVO' },
          userName: 'ana.vega',
          email: null,
        },
        {
          usuarioId: 2,
          tenantId: 1,
          nombres: 'Luis',
          apellidos: 'Mora',
          cedula: '0912345678',
          fechaNacimiento: '1992-08-10',
          tenantRole: 'RECEPCIONISTA',
          horario: 'L-V 08:00-16:00',
          sueldo: 550,
          estado: 'INACTIVO',
          usuario: { id: 2, userName: 'luis.mora', email: null, estado: 'INACTIVO' },
          userName: 'luis.mora',
          email: null,
        },
      ]),
    );

    await TestBed.configureTestingModule({
      imports: [AdminStatsComponent],
      providers: [
        { provide: PlanService, useValue: planServiceSpy },
        { provide: UsuarioService, useValue: usuarioServiceSpy },
        importProvidersFrom(
          LucideAngularModule.pick({
            Layers,
            ShieldCheck,
            ShieldOff,
            Users,
          }),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load staff and plan metrics from the current tenant', () => {
    expect(component.stats[0].titulo).toBe('Staff del gimnasio');
    expect(component.stats[0].valor).toBe(2);
    expect(component.stats[1].valor).toBe(1);
    expect(component.stats[2].valor).toBe(1);
    expect(component.stats[3].valor).toBe(3);
  });

  it('should refresh staff metrics when the service emits a change notification', () => {
    usuarioServiceSpy.getStaff.calls.reset();
    usuarioServiceSpy.getStaff.and.returnValue(of([]));

    staffChanged$.next();
    fixture.detectChanges();

    expect(usuarioServiceSpy.getStaff).toHaveBeenCalled();
    expect(component.stats[0].valor).toBe(0);
  });
});
