import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MetricsCardsComponent } from "./components/metrics-cards/metrics-cards.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule,
    MetricsCardsComponent
],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
