import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  @Input() show = false;
  @Input() title = '¿Está seguro?';
  @Input() message = '¿Desea continuar con esta acción?';
  @Input() confirmText = 'Aceptar';
  @Input() cancelText = 'Cancelar';
  @Input() type: 'danger' | 'warning' | 'info' = 'warning';
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
