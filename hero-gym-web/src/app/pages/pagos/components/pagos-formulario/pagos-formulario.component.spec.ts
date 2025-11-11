import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosFormularioComponent } from './pagos-formulario.component';

describe('PagosFormularioComponent', () => {
  let component: PagosFormularioComponent;
  let fixture: ComponentFixture<PagosFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosFormularioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagosFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
