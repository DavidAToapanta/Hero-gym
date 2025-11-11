import { Component } from '@angular/core';
import { GestionUsuariosComponent } from "./components/gestion-usuarios/gestion-usuarios.component";
import { GestionPlanesComponent } from "./components/gestion-planes/gestion-planes.component";
import { AdminStatsComponent } from "./components/admin-stats/admin-stats.component";
import { AdminHeaderComponent } from "./components/admin-header/admin-header.component";

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [GestionUsuariosComponent, GestionPlanesComponent, AdminStatsComponent, AdminHeaderComponent],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.css',
})
export class AdministracionComponent {
  
}
