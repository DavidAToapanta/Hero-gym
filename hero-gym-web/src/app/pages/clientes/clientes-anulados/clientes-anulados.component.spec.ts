import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ClientesAnuladosComponent } from './clientes-anulados.component';
import { ClienteService } from '../../../core/services/cliente.service';

describe('ClientesAnuladosComponent', () => {
  let component: ClientesAnuladosComponent;
  let fixture: ComponentFixture<ClientesAnuladosComponent>;
  const clienteServiceMock = {
    getClientesInactivos: jasmine.createSpy('getClientesInactivos').and.returnValue(
      of({
        data: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          perPage: 10,
          totalPages: 0,
          currentPage: 1,
        },
      }),
    ),
    reactivarCliente: jasmine.createSpy('reactivarCliente').and.returnValue(of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesAnuladosComponent],
      providers: [{ provide: ClienteService, useValue: clienteServiceMock }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientesAnuladosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load inactive clients on init', () => {
    expect(clienteServiceMock.getClientesInactivos).toHaveBeenCalled();
  });
});
