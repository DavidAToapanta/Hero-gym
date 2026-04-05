import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesListaComponent } from './components/clientes-lista/clientes-lista.component';
import { ClientesComponent } from './clientes.component';

describe('ClientesComponent', () => {
  let component: ClientesComponent;
  let fixture: ComponentFixture<ClientesComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(ClientesComponent, {
      set: {
        template: '',
      },
    });

    await TestBed.configureTestingModule({
      imports: [ClientesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the client form when requested', () => {
    component.abrirNuevoCliente();

    expect(component.mostrarFormulario).toBeTrue();
  });

  it('should close the form and refresh the list after saving', () => {
    const recargarSpy = jasmine.createSpy('recargar');
    component.listaComponent = {
      recargar: recargarSpy,
    } as unknown as ClientesListaComponent;
    component.mostrarFormulario = true;

    component.onGuardarCliente({});

    expect(component.mostrarFormulario).toBeFalse();
    expect(recargarSpy).toHaveBeenCalled();
  });
});
