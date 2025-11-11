import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { forkJoin } from 'rxjs';
import { PlanService } from '../../../../core/services/plan.service';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-stats.component.html',
  styleUrl: './admin-stats.component.css',
})
export class AdminStatsComponent implements OnInit {
  stats = [
    { titulo: 'Usuarios Totales', valor: 0 as number | string, icono: 'users', color: 'bg-indigo-100 text-indigo-700' },
    { titulo: 'Planes Activos', valor: 0 as number | string, icono: 'layers', color: 'bg-green-100 text-green-700' },
    { titulo: 'Sistema', valor: 'Activo' as number | string, icono: 'cpu', color: 'bg-yellow-100 text-yellow-700' },
    { titulo: 'Reportes Disponibles', valor: 2 as number | string, icono: 'file-text', color: 'bg-blue-100 text-blue-700' }
  ];

  constructor(private usuariosService: UsuarioService, private planService: PlanService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarPlanes();
  }

  private cargarUsuarios(): void {
    // Sumamos administradores + entrenadores + recepcionistas
    forkJoin([
      this.usuariosService.getUsuarios('administrador'),
      this.usuariosService.getUsuarios('entrenador'),
      this.usuariosService.getUsuarios('recepcionista'),
    ]).subscribe({
      next: ([admins, ent, rec]) => {
        const total = (admins?.length || 0) + (ent?.length || 0) + (rec?.length || 0);
        this.stats[0].valor = total;
      },
      error: () => {
        this.stats[0].valor = 0;
      }
    });
  }

  private cargarPlanes(): void {
    this.planService.getPlanes().subscribe({
      next: (planes) => {
        this.stats[1].valor = planes.length;
      },
      error: () => {
        this.stats[1].valor = 0;
      }
    });
  }
}
