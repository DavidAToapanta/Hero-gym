import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosListaComponent } from './pagos-lista.component';

describe('PagosListaComponent', () => {
  let component: PagosListaComponent;
  let fixture: ComponentFixture<PagosListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagosListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
