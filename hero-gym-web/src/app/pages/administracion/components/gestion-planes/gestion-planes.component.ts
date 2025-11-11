import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { PlanModalComponent } from './plan-modal/plan-modal.component';
import { Plan, PlanService } from '../../../../core/services/plan.service';

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
      mesesPagar: Number(plan.duracion)
    };

    if (isNaN(dto.precio) || isNaN(dto.mesesPagar) || dto.precio <= 0 || dto.mesesPagar <= 0) {
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
    this.planService.getPlanes().subscribe({
      next: (planes) => (this.planes = planes)
    });
  }
}
