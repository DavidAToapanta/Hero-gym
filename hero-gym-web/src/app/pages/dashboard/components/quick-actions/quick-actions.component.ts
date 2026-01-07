
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserPlus, CreditCard, Dumbbell, Boxes } from 'lucide-angular';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.css']
})
export class QuickActionsComponent {
  constructor(private router: Router){}

  // Referencias a los componentes de Lucide para usar en el template
  UserPlus = UserPlus;
  CreditCard = CreditCard;
  Dumbbell = Dumbbell;
  Boxes = Boxes;

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  actions = [
    {
      icon: UserPlus,
      title: 'Registrar Miembro',
      description: 'Añadir nuevo cliente',
      color: 'text-blue-600',
      route: '/dashboard/clientes',
    },

    {
      icon: CreditCard,
      title: 'Procesar Pago',
      description: 'Registrar pagos pendientes',
      color: 'text-emerald-600',
      route: '/dashboard/pagos',
    },

    {
      icon: Dumbbell,
      title: 'Crear Rutina',
      description: 'Nueva rutina de ejercicios',
      color: 'text-orange-600',
      route: '/dashboard/rutinas',
    },

    {
      icon: Boxes,
      title: 'Gestionar Inventario',
      description: 'Productos y suplementos',
      color: 'text-purple-600',
      route: '/dashboard/productos',
    },
  ];
}
