import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';

import { of, throwError } from 'rxjs';

import { ClienteService } from '../../../../core/services/cliente.service';
import { ClientesFormularioComponent } from './clientes-formulario.component';

describe('ClientesFormularioComponent', () => {
  let component: ClientesFormularioComponent;
  let fixture: ComponentFixture<ClientesFormularioComponent>;
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;

  beforeEach(async () => {
    clienteServiceSpy = jasmine.createSpyObj<ClienteService>('ClienteService', ['createCliente']);
    clienteServiceSpy.createCliente.and.returnValue(of({ id: 1 }));

    await TestBed.configureTestingModule({
      imports: [ClientesFormularioComponent],
      providers: [{ provide: ClienteService, useValue: clienteServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map the form model to the register payload', () => {
    const saveSpy = spyOn(component.save, 'emit');
    const closeSpy = spyOn(component.close, 'emit');

    attachValidForm(component);
    component.cliente = createClienteFormValue();

    component.guardar();

    expect(clienteServiceSpy.createCliente).toHaveBeenCalledOnceWith({
      nombres: 'Juan',
      apellidos: 'Pérez',
      cedula: '0102030405',
      fechaNacimiento: '1990-05-20',
      userName: 'jperez',
      password: 'secreto1',
      horario: 'Lunes a Viernes 06:00-08:00',
      sexo: 'M',
      observaciones: 'Sin novedades',
      objetivos: 'Ganar masa muscular',
      tiempoEntrenar: 45,
    });
    expect(saveSpy).toHaveBeenCalledWith({ id: 1 });
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should normalize array backend errors', () => {
    clienteServiceSpy.createCliente.and.returnValue(
      throwError(() => ({
        error: {
          message: ['La cédula ya existe', 'El nombre de usuario ya existe'],
        },
      })),
    );

    attachValidForm(component);
    component.cliente = createClienteFormValue();

    component.guardar();

    expect(component.errorMessage).toBe(
      'La cédula ya existe. El nombre de usuario ya existe',
    );
    expect(component.isSubmitting).toBeFalse();
  });
});

function createClienteFormValue() {
  return {
    nombres: '  Juan  ',
    apellidos: '  Pérez  ',
    cedula: ' 0102030405 ',
    fechaNacimiento: '1990-05-20',
    usuario: '  jperez  ',
    contrasena: 'secreto1',
    horario: '  Lunes a Viernes 06:00-08:00  ',
    sexo: 'M',
    observaciones: '  Sin novedades  ',
    objetivos: '  Ganar masa muscular  ',
    tiempoEntrenamiento: 45,
  };
}

function attachValidForm(component: ClientesFormularioComponent): void {
  component.clienteForm = {
    invalid: false,
    form: {
      markAllAsTouched: jasmine.createSpy('markAllAsTouched'),
    },
    resetForm: jasmine.createSpy('resetForm'),
  } as unknown as NgForm;
}
