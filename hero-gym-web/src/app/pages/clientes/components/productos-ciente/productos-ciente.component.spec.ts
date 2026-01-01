import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosCienteComponent } from './productos-ciente.component';

describe('ProductosCienteComponent', () => {
  let component: ProductosCienteComponent;
  let fixture: ComponentFixture<ProductosCienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosCienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosCienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
