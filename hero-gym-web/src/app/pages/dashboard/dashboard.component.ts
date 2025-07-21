import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    LucideAngularModule // 👈 importa el módulo completo, sin .pick()
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
