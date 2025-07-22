import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentMembersComponent } from './recent-members.component';

describe('RecentMembersComponent', () => {
  let component: RecentMembersComponent;
  let fixture: ComponentFixture<RecentMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
