import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RecentMembersComponent } from './recent-members.component';
import { ClienteService } from '../../../../core/services/cliente.service';

describe('RecentMembersComponent', () => {
  let component: RecentMembersComponent;
  let fixture: ComponentFixture<RecentMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentMembersComponent],
      providers: [
        {
          provide: ClienteService,
          useValue: { getRecentClients: () => of([]) },
        },
      ],
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
