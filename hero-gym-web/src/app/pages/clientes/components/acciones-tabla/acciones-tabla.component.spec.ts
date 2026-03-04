import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccionesTablaComponent } from './acciones-tabla.component';

describe('AccionesTablaComponent', () => {
  let component: AccionesTablaComponent;
  let fixture: ComponentFixture<AccionesTablaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccionesTablaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccionesTablaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
