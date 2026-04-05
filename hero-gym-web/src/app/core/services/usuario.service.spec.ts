import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  CreateStaffDto,
  StaffItem,
  UsuarioService,
} from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch staff from /staff with supported filters', () => {
    let response: StaffItem[] | undefined;

    service.getStaff({ role: 'ADMIN', estado: 'ACTIVO' }).subscribe((staff) => {
      response = staff;
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/staff?role=ADMIN&estado=ACTIVO`);
    expect(request.request.method).toBe('GET');

    request.flush({
      data: [
        {
          id: 12,
          tenantId: 4,
          nombres: 'Ana',
          apellidos: 'Vega',
          cedula: '0102030405',
          fechaNacimiento: '1990-04-01T00:00:00.000Z',
          tenantRole: 'ADMIN',
          estado: 'ACTIVO',
          horario: null,
          sueldo: null,
          userName: 'ana.vega',
        },
      ],
    });

    expect(response).toEqual([
      jasmine.objectContaining({
        usuarioId: 12,
        tenantId: 4,
        nombres: 'Ana',
        apellidos: 'Vega',
        cedula: '0102030405',
        fechaNacimiento: '1990-04-01',
        tenantRole: 'ADMIN',
        estado: 'ACTIVO',
        userName: 'ana.vega',
      }),
    ]);
  });

  it('should create staff through /staff and notify subscribers', () => {
    const payload: CreateStaffDto = {
      nombres: 'Luis',
      apellidos: 'Mora',
      cedula: '0912345678',
      fechaNacimiento: '1992-08-10',
      userName: 'luis.mora',
      password: '123456',
      tenantRole: 'RECEPCIONISTA',
      horario: 'L-V 08:00-16:00',
      sueldo: 550,
    };
    const changeSpy = jasmine.createSpy('changeSpy');
    let response: StaffItem | undefined;

    service.staffChanged$.subscribe(changeSpy);
    service.createStaff(payload).subscribe((staff) => {
      response = staff;
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/staff`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      data: {
        id: 18,
        nombres: 'Luis',
        apellidos: 'Mora',
        cedula: '0912345678',
        fechaNacimiento: '1992-08-10',
        tenantRole: 'RECEPCIONISTA',
        estado: 'ACTIVO',
        horario: 'L-V 08:00-16:00',
        sueldo: 550,
        userName: 'luis.mora',
      },
    });

    expect(response?.usuarioId).toBe(18);
    expect(changeSpy).toHaveBeenCalled();
  });

  it('should call the inactivar endpoint for staff status changes', () => {
    service.inactivarStaff(22).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/staff/22/inactivar`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush(null);
  });
});
