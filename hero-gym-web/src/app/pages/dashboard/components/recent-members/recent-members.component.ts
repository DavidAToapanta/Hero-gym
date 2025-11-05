import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../../core/services/cliente.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recent-members',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-members.component.html',
  styleUrl: './recent-members.component.css'
})
export class RecentMembersComponent implements OnInit {
  recentMembers: any[] = [];

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.clienteService.getRecentClients().subscribe({
      next: (data: any[]) => (this.recentMembers = data),
      error: (err: any) => console.error('Error fetching recent clients', err),
    });
  }

  getInitials(nombres?: string, apellidos?: string): string {
    if (!nombres && !apellidos) return '—';
    const firstInitial = nombres?.charAt(0)?.toUpperCase() || '';
    const lastInitial = apellidos?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial;
  }

  getBadgeClasses(estado?: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'inactivo':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'vencido':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'suspendido':
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }
}
