import { Component, OnInit, ViewChild } from '@angular/core';

import { LucideAngularModule } from 'lucide-angular';
import { PlanModalComponent } from './plan-modal/plan-modal.component';
import { Plan, PlanService } from '../../../../core/services/plan.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion-planes',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PlanModalComponent],
  templateUrl: './gestion-planes.component.html',
  styleUrl: './gestion-planes.component.css',
})
export class GestionPlanesComponent implements OnInit {
  @ViewChild(PlanModalComponent) planModal?: PlanModalComponent;
  mostrarModal = false;
  planes: Plan[] = [];
  
  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  totalPlanes = 0;
  planesPorPagina = 10;

  constructor(private planService: PlanService) {}

  ngOnInit(): void {
    this.cargarPlanes();
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    if (this.planModal) {
      this.planModal.resetear();
    }
  }

  guardarPlan(plan: any) {
    if (!plan.nombre || !plan.precio || !plan.duracion) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const dto: Plan = {
      nombre: plan.nombre.trim(),
      precio: Number(plan.precio),
      duracion: Number(plan.duracion),
      unidadDuracion: plan.unidadDuracion
    };

    if (isNaN(dto.precio) || isNaN(dto.duracion) || dto.precio <= 0 || dto.duracion <= 0) {
      alert('El precio y la duración deben ser números válidos mayores a 0');
      return;
    }

    this.planService.createPlan(dto).subscribe({
      next: () => {
        this.cargarPlanes();
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al guardar plan:', err);
        const mensaje = err.error?.message || 'Error al guardar el plan. Por favor intente nuevamente.';
        alert(mensaje);
      }
    });
  }

  private cargarPlanes(): void {
    this.planService.getPlanes(this.paginaActual, this.planesPorPagina).subscribe({
      next: (response) => {
        this.planes = response.data;
        this.totalPlanes = response.total;
        this.totalPaginas = response.totalPages;
        this.paginaActual = response.page;
      },
      error: (err) => {
        console.error('Error al cargar planes:', err);
      }
    });
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarPlanes();
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarPlanes();
    }
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarPlanes();
    }
  }

  eliminarPlan(plan: Plan): void {
    if (!plan.id) return;

    const confirmar = confirm(`¿Está seguro de que desea eliminar el plan "${plan.nombre}"?`);
    if (!confirmar) return;

    this.planService.deletePlan(plan.id).subscribe({
      next: () => {
        alert('Plan eliminado exitosamente');
        this.cargarPlanes();
      },
      error: (err) => {
        if (err.error?.requiresConfirmation) {
          // El plan tiene clientes asignados
          const confirmarCascade = confirm(
            `${err.error.message}\n\n¿Está seguro de que desea eliminar el plan? Esto removerá el plan de todos los clientes afectados.`
          );
          
          if (confirmarCascade && plan.id) {
            this.eliminarPlanConCascada(plan.id);
          }
        } else {
          console.error('Error al eliminar plan:', err);
          alert('Error al eliminar el plan. Por favor intente nuevamente.');
        }
      }
    });
  }

  private eliminarPlanConCascada(planId: number): void {
    this.planService.deletePlanWithCascade(planId).subscribe({
      next: () => {
        alert('Plan eliminado exitosamente junto con todas sus relaciones');
        this.cargarPlanes();
      },
      error: (err) => {
        console.error('Error al eliminar plan con cascada:', err);
        alert('Error al eliminar el plan. Por favor intente nuevamente.');
      }
    });
  }

  getUnidadTexto(plan: Plan): string {
    return plan.unidadDuracion === 'MESES' 
      ? (plan.duracion === 1 ? 'mes' : 'meses')
      : (plan.duracion === 1 ? 'día' : 'días');
  }
}
