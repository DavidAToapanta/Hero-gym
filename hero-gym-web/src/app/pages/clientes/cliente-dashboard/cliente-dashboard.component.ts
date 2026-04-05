import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../auth/auth.service';
import { environment } from '../../../../environments/environment';
import { AsistenciaComponent } from '../components/asistencia';

interface ClienteData {
  nombres: string;
  apellidos: string;
  cedula: string;
  plan: {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    estado: 'activo' | 'vencido' | 'por_vencer';
    diasTranscurridos: number;
    diasRestantes: number;
    totalDias: number;
  };
  deuda: number;
}

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [CommonModule, AsistenciaComponent],
  templateUrl: './cliente-dashboard.component.html',
  styleUrl: './cliente-dashboard.component.css',
})
export class ClienteDashboardComponent implements OnInit {
  clienteData: ClienteData | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.cargarDatosCliente();
  }

  cargarDatosCliente() {
    const clienteId = this.authService.getClienteId();

    if (!clienteId) {
      this.errorMessage = 'No se encontró el cliente autenticado';
      this.isLoading = false;
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/cliente/mi-perfil`).subscribe({
      next: (response) => {
        console.log('Datos del cliente:', response);
        this.procesarDatosCliente(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del cliente:', error);
        this.errorMessage = 'Error al cargar los datos del cliente';
        this.isLoading = false;
      },
    });
  }

  procesarDatosCliente(data: any) {
    const plan = data.planes?.[0];

    if (!plan) {
      this.clienteData = {
        nombres: data.usuario?.nombres || 'Usuario',
        apellidos: data.usuario?.apellidos || '',
        cedula: data.usuario?.cedula || 'N/A',
        plan: {
          nombre: 'Sin plan activo',
          fechaInicio: '',
          fechaFin: '',
          estado: 'vencido',
          diasTranscurridos: 0,
          diasRestantes: 0,
          totalDias: 0,
        },
        deuda: 0,
      };
      return;
    }

    const fechaInicio = new Date(plan.fechaInicio);
    const fechaFin = new Date(plan.fechaFin);
    const hoy = new Date();

    const totalDias = Math.ceil(
      (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
    );
    const diasTranscurridos = Math.ceil(
      (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24),
    );
    const diasRestantes = Math.ceil(
      (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    let estado: 'activo' | 'vencido' | 'por_vencer' = 'activo';
    if (diasRestantes < 0) {
      estado = 'vencido';
    } else if (diasRestantes <= 3) {
      estado = 'por_vencer';
    }

    const deudaTotal =
      plan.deudas?.reduce((sum: number, deuda: any) => {
        return sum + (deuda.solventada ? 0 : Number(deuda.monto));
      }, 0) || 0;

    this.clienteData = {
      nombres: data.usuario?.nombres || 'Usuario',
      apellidos: data.usuario?.apellidos || '',
      cedula: data.usuario?.cedula || 'N/A',
      plan: {
        nombre: plan.plan?.nombre || 'Plan',
        fechaInicio: plan.fechaInicio,
        fechaFin: plan.fechaFin,
        estado,
        diasTranscurridos: Math.max(0, diasTranscurridos),
        diasRestantes: Math.max(0, diasRestantes),
        totalDias,
      },
      deuda: deudaTotal,
    };
  }

  getEstadoClasses() {
    if (!this.clienteData) return '';

    switch (this.clienteData.plan.estado) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'por_vencer':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  }

  getEstadoTexto() {
    if (!this.clienteData) return '';

    switch (this.clienteData.plan.estado) {
      case 'activo':
        return 'Activo';
      case 'por_vencer':
        return 'Por vencer';
      case 'vencido':
        return 'Vencido';
      default:
        return 'Sin estado';
    }
  }

  getProgresoPorcentaje(): number {
    if (!this.clienteData || this.clienteData.plan.totalDias === 0) return 0;
    return Math.min(
      100,
      (this.clienteData.plan.diasTranscurridos / this.clienteData.plan.totalDias) * 100,
    );
  }
}
