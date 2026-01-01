import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasResumenComponent } from './facturas-resumen.component';

describe('FacturasResumenComponent', () => {
  let component: FacturasResumenComponent;
  let fixture: ComponentFixture<FacturasResumenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturasResumenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturasResumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
