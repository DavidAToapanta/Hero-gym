import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasFiltrosComponent } from './facturas-filtros.component';

describe('FacturasFiltrosComponent', () => {
  let component: FacturasFiltrosComponent;
  let fixture: ComponentFixture<FacturasFiltrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturasFiltrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturasFiltrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
