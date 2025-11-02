import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationsSocketService } from '../../../../core/services/notifications-socket.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  subscription: any;
  isLoading = true;

  constructor(private socketService: NotificationsSocketService){}

  ngOnInit(): void{
    this.subscription = this.socketService.listenForUpdates().subscribe((data) => {
      if (!Array.isArray(data)) {
        console.warn('[Notifications] Payload inválido; se ignora');
        this.isLoading = false;
        return;
      }

      if (data.length === 0) {
        // Mantener las últimas notificaciones si ya existen para evitar parpadeos.
        if (this.notifications.length === 0) {
          this.notifications = [];
        }
      } else {
        this.notifications = data;
      }

      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
