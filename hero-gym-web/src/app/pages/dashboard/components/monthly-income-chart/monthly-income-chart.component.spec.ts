import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyIncomeChartComponent } from './monthly-income-chart.component';

describe('MonthlyIncomeChartComponent', () => {
  let component: MonthlyIncomeChartComponent;
  let fixture: ComponentFixture<MonthlyIncomeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyIncomeChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyIncomeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
