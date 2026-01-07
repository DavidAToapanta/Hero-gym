import { Component } from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { EstadisticasService } from '../../../../core/services/estadisticas.service';

type Periodo = 'dia' | 'mes' | 'anio';
type Modo = 'line' | 'bar';

@Component({
  selector: 'app-monthly-income-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './monthly-income-chart.component.html',
})
export class MonthlyIncomeChartComponent {
  periodo: Periodo = 'mes';
  modo: Modo = 'line';
  cargando = false; // ✅ indicador de carga
  error: string | null = null; // ✅ para mostrar si algo falla

  chartType: ChartType = this.modo;
  chartConfig: ChartConfiguration = {
    type: this.chartType,
    data: {
      labels: [],
      datasets: [
        {
          label: 'Ingresos',
          data: [],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.12)',
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  };

  constructor(private estadisticasService: EstadisticasService) {
    this.cargarPeriodo('mes'); // Carga inicial
  }

  cambiarModo(nuevo: Modo) {
    this.modo = nuevo;
    this.chartType = nuevo;
    this.chartConfig.type = nuevo;
  }

  cargarPeriodo(p: Periodo) {
    this.periodo = p;
    this.cargando = true;
    this.error = null;

    this.estadisticasService.getIngresos(p).subscribe({
      next: (res) => {
        this.chartConfig.data.labels = res.labels;
        this.chartConfig.data.datasets[0].data = res.data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando ingresos:', err);
        this.error = 'Error al obtener los datos del servidor.';
        this.cargando = false;
      },
    });
  }
}
