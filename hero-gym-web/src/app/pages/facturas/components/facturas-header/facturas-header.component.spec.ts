import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasHeaderComponent } from './facturas-header.component';

describe('FacturasHeaderComponent', () => {
  let component: FacturasHeaderComponent;
  let fixture: ComponentFixture<FacturasHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturasHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturasHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
