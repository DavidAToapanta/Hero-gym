import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PagosComponent } from './pagos.component';

@Component({
  selector: 'lucide-icon',
  standalone: true,
  template: '',
})
class LucideIconStubComponent {
  @Input() name = '';
}

@Component({
  selector: 'app-pagos-busqueda',
  standalone: true,
  template: '',
})
class PagosBusquedaStubComponent {
  @Output() buscar = new EventEmitter<string>();
}

@Component({
  selector: 'app-pagos-lista',
  standalone: true,
  template: '',
})
class PagosListaStubComponent {
  @Input() searchTerm = '';
  @Output() error = new EventEmitter<string>();

  recargar(): void {}
}

@Component({
  selector: 'app-pagos-formulario',
  standalone: true,
  template: '',
})
class PagosFormularioStubComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<unknown>();
}

@Component({
  selector: 'app-ingreso-rapido-formulario',
  standalone: true,
  template: '',
})
class IngresoRapidoFormularioStubComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<unknown>();
}

describe('PagosComponent', () => {
  let component: PagosComponent;
  let fixture: ComponentFixture<PagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosComponent],
    })
      .overrideComponent(PagosComponent, {
        set: {
          imports: [
            CommonModule,
            LucideIconStubComponent,
            PagosBusquedaStubComponent,
            PagosListaStubComponent,
            PagosFormularioStubComponent,
            IngresoRapidoFormularioStubComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getIngresoRapidoStub(): IngresoRapidoFormularioStubComponent {
    return fixture.debugElement.query(By.directive(IngresoRapidoFormularioStubComponent)).componentInstance;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the quick income modal from the header action', () => {
    const button = fixture.debugElement
      .queryAll(By.css('button'))
      .find((debugElement) => (debugElement.nativeElement.textContent as string).includes('Pago Rápido'));

    expect(button).toBeDefined();

    button?.nativeElement.click();
    fixture.detectChanges();

    expect(component.mostrarIngresoRapido).toBeTrue();
    expect(getIngresoRapidoStub()).toBeTruthy();
  });

  it('closes the quick income modal when the child emits close', () => {
    component.nuevoIngresoRapido();
    fixture.detectChanges();

    getIngresoRapidoStub().close.emit();
    fixture.detectChanges();

    expect(component.mostrarIngresoRapido).toBeFalse();
  });

  it('handles quick income save and shows a toast', () => {
    component.nuevoIngresoRapido();
    fixture.detectChanges();

    getIngresoRapidoStub().save.emit({ id: 9 });
    fixture.detectChanges();

    expect(component.mostrarIngresoRapido).toBeFalse();
    expect(component.toastVisible).toBeTrue();
    expect(component.toastMessage).toContain('Ingreso rapido registrado');
  });
});
