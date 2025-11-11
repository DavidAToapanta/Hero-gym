import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPlanesComponent } from './gestion-planes.component';

describe('GestionPlanesComponent', () => {
  let component: GestionPlanesComponent;
  let fixture: ComponentFixture<GestionPlanesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionPlanesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionPlanesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
