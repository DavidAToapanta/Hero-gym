import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { MetricsCardsComponent } from "./components/metrics-cards/metrics-cards.component";
import { RecentMembersComponent } from "./components/recent-members/recent-members.component";
import { QuickActionsComponent } from "./components/quick-actions/quick-actions.component";
import { NotificationsComponent } from "./components/notifications/notifications.component";
import { MonthlyIncomeChartComponent } from './components/monthly-income-chart/monthly-income-chart.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    LucideAngularModule,
    MetricsCardsComponent,
    RecentMembersComponent,
    QuickActionsComponent,
    NotificationsComponent,
    MonthlyIncomeChartComponent
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {}
