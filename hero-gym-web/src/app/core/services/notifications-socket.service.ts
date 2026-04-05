import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationsSocketService implements OnDestroy {
  private readonly socket: Socket;
  private readonly authSubscription: Subscription;
  private activeListeners = 0;
  private currentToken: string | null = null;

  constructor(private authService: AuthService) {
    this.currentToken = this.authService.getToken();
    this.socket = io(`${environment.apiUrl}/notifications`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000,
      withCredentials: false,
      autoConnect: false,
      auth: this.buildHandshakeAuth(this.currentToken),
    });

    this.registerDebugListeners();
    this.authSubscription = this.authService.tokenChanges$.subscribe((token) => {
      if (token === this.currentToken) {
        return;
      }

      this.currentToken = token;
      this.socket.auth = this.buildHandshakeAuth(token);

      if (!token) {
        this.socket.disconnect();
        return;
      }

      if (this.activeListeners > 0) {
        this.socket.disconnect();
        this.socket.connect();
      }
    });
  }

  listenForUpdates(): Observable<any[]> {
    return new Observable((observer) => {
      this.activeListeners += 1;
      this.connectIfPossible();

      const handler = (data: any[]) => observer.next(data);
      this.socket.on('notificationsUpdate', handler);

      return () => {
        this.socket.off('notificationsUpdate', handler);
        this.activeListeners = Math.max(0, this.activeListeners - 1);

        if (this.activeListeners === 0) {
          this.socket.disconnect();
        }
      };
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.socket.disconnect();
  }

  private connectIfPossible(): void {
    const token = this.authService.getToken();

    if (!token) {
      console.warn('[Socket] No hay token disponible para conectar notificaciones.');
      return;
    }

    this.currentToken = token;
    this.socket.auth = this.buildHandshakeAuth(token);

    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  private buildHandshakeAuth(token: string | null): { token?: string } {
    return token ? { token } : {};
  }

  private registerDebugListeners(): void {
    this.socket.on('connect', () => console.log('[Socket] Conectado:', this.socket.id));
    this.socket.on('connect_error', (err) =>
      console.error('[Socket] Error de conexión:', err.message),
    );
    this.socket.on('reconnect_attempt', (attempt) =>
      console.log('[Socket] Reintento de reconexión:', attempt),
    );
    this.socket.on('reconnect', (attempt) =>
      console.log('[Socket] Reconectado. Intentos:', attempt),
    );
    this.socket.on('disconnect', (reason) => console.warn('[Socket] Desconectado:', reason));
  }
}
