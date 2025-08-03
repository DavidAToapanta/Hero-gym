import { Component, OnInit } from '@angular/core';
import { ClientePlanService } from '../../../../core/services/cliente-plan.service';

@Component({
  selector: 'app-metrics-cards',
  templateUrl: './metrics-cards.component.html',
})
export class MetricsCardsComponent implements OnInit {
  miembrosActivos: number = 0;

  constructor(private clientePlanService: ClientePlanService) {}
  
  ngOnInit(): void {
    this.clientePlanService.getClientesActivos().subscribe({
      next: (res) => {
        this.miembrosActivos = res.activos;
      },
      error: (err) => {
        console.error('Error obteniendo miembros activos', err);
      }
    });
  }
  
}
