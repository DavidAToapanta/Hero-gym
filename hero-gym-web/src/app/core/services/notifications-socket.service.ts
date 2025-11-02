import { Injectable, OnDestroy } from "@angular/core";
import { Observable } from "rxjs";
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class NotificationsSocketService implements OnDestroy{
    private socket: Socket;

    constructor() {
        this.socket = io('http://localhost:3000/notifications', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            timeout: 20000,
            withCredentials: true,
            autoConnect: true,
        });

        // Logs de depuración
        this.socket.on('connect', () => console.log('[Socket] Conectado:', this.socket.id));
        this.socket.on('connect_error', (err) => console.error('[Socket] Error de conexión:', err.message));
        this.socket.on('reconnect_attempt', (n) => console.log('[Socket] Reintento de reconexión:', n));
        this.socket.on('reconnect', (n) => console.log('[Socket] Reconectado. Intentos:', n));
        this.socket.on('disconnect', (reason) => console.warn('[Socket] Desconectado:', reason));
    }

    listenForUpdates(): Observable<any[]> {
        return new Observable((observer) => {
            const handler = (data: any[]) => observer.next(data);
            this.socket.on('notificationsUpdate', handler);

            // Teardown: eliminar el handler cuando no haya suscriptores
            return () => this.socket.off('notificationsUpdate', handler);
        });
    }

    ngOnDestroy(): void {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
        }
    }



    
}
