import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MetricsCardsComponent } from "./components/metrics-cards/metrics-cards.component";
import { DashboardLayoutComponent } from '../../layouts/dashboard-layout/dashboard-layout.component';
import { RecentMembersComponent } from "./components/recent-members/recent-members.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule,
    MetricsCardsComponent,
    DashboardLayoutComponent,
    RecentMembersComponent
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {}
