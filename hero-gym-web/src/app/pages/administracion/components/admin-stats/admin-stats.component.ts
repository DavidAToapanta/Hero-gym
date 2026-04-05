import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LucideAngularModule } from 'lucide-angular';

import { PlanService } from '../../../../core/services/plan.service';
import { StaffItem, UsuarioService } from '../../../../core/services/usuario.service';

interface AdminStatItem {
  titulo: string;
  valor: number | string;
  icono: string;
  color: string;
  detalle?: string;
}

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-stats.component.html',
  styleUrl: './admin-stats.component.css',
})
export class AdminStatsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  stats: AdminStatItem[] = [
    {
      titulo: 'Staff del gimnasio',
      valor: 0,
      icono: 'users',
      color: 'bg-indigo-100 text-indigo-700',
      detalle: 'Sin registros cargados.',
    },
    {
      titulo: 'Staff activos',
      valor: 0,
      icono: 'shield-check',
      color: 'bg-green-100 text-green-700',
      detalle: 'Sin staff activo.',
    },
    {
      titulo: 'Staff inactivos',
      valor: 0,
      icono: 'shield-off',
      color: 'bg-slate-200 text-slate-700',
      detalle: 'Sin staff inactivo.',
    },
    {
      titulo: 'Planes Activos',
      valor: 0,
      icono: 'layers',
      color: 'bg-emerald-100 text-emerald-700',
      detalle: 'Cargando planes disponibles.',
    },
  ];

  constructor(
    private readonly planService: PlanService,
    private readonly usuarioService: UsuarioService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarStaff();
    this.cargarPlanes();

    this.usuarioService.staffChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cargarStaff());
  }

  private cargarStaff(): void {
    this.usuarioService.getStaff().subscribe({
      next: (staff) => {
        const activos = staff.filter((item) => item.estado === 'ACTIVO').length;
        const inactivos = staff.filter((item) => item.estado === 'INACTIVO').length;
        const pendientes = staff.filter((item) => item.estado === 'PENDIENTE').length;

        this.stats[0].valor = staff.length;
        this.stats[0].detalle = this.buildRoleBreakdown(staff);
        this.stats[1].valor = activos;
        this.stats[1].detalle =
          activos > 0 ? 'Usuarios listos para operar en el tenant.' : 'Sin staff activo.';
        this.stats[2].valor = inactivos;
        this.stats[2].detalle =
          pendientes > 0
            ? `Pendientes por revisar: ${pendientes}`
            : inactivos > 0
            ? 'Usuarios temporalmente fuera de operación.'
            : 'Sin staff inactivo.';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar métricas de staff:', error);
        this.stats[0].valor = 0;
        this.stats[0].detalle = 'No se pudo cargar el staff del gimnasio.';
        this.stats[1].valor = 0;
        this.stats[1].detalle = 'No se pudo calcular el staff activo.';
        this.stats[2].valor = 0;
        this.stats[2].detalle = 'No se pudo calcular el staff inactivo.';
        this.cdr.detectChanges();
      },
    });
  }

  private cargarPlanes(): void {
    this.planService.getPlanes().subscribe({
      next: (response) => {
        this.stats[3].valor = response.total;
        this.stats[3].detalle =
          response.total > 0
            ? 'Planes visibles para operar en el tenant.'
            : 'Aún no hay planes activos.';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar planes en administración:', error);
        this.stats[3].valor = 0;
        this.stats[3].detalle = 'No se pudo cargar la cantidad de planes.';
        this.cdr.detectChanges();
      },
    });
  }

  private buildRoleBreakdown(staff: StaffItem[]): string {
    if (staff.length === 0) {
      return 'Sin registros cargados.';
    }

    const conteoPorRol = {
      ADMIN: staff.filter((item) => item.tenantRole === 'ADMIN').length,
      RECEPCIONISTA: staff.filter((item) => item.tenantRole === 'RECEPCIONISTA').length,
      ENTRENADOR: staff.filter((item) => item.tenantRole === 'ENTRENADOR').length,
    };

    const detalle = [
      conteoPorRol.ADMIN > 0 ? `${conteoPorRol.ADMIN} admin` : null,
      conteoPorRol.RECEPCIONISTA > 0 ? `${conteoPorRol.RECEPCIONISTA} recep.` : null,
      conteoPorRol.ENTRENADOR > 0 ? `${conteoPorRol.ENTRENADOR} entrenador` : null,
    ].filter((item): item is string => item !== null);

    return detalle.length > 0 ? detalle.join(' · ') : 'Sin staff con rol asignado.';
  }
}
