import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UsuarioModalComponent } from './usuario-modal/usuario-modal.component';
import { UsuarioBasico, UsuarioService } from '../../../../core/services/usuario.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UsuarioModalComponent],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css',
})
export class GestionUsuariosComponent implements OnInit {
  @ViewChild(UsuarioModalComponent) usuarioModal?: UsuarioModalComponent;
  mostrarModal = false;
  usuarios: UsuarioBasico[] = [];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    if (this.usuarioModal) {
      this.usuarioModal.resetear();
    }
  }

  guardarUsuario(usuario: any) {
    // Validar campos requeridos
    if (!usuario.userName || !usuario.password || !usuario.nombre || 
        !usuario.apellidos || !usuario.cedula || !usuario.fechaNacimiento) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (usuario.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const rol = (usuario.rol || 'Administrador').toLowerCase();
    
    // Validar campos requeridos según el rol
    if (rol !== 'administrador') {
      if (!usuario.horario || !usuario.sueldo) {
        alert('Horario y sueldo son requeridos para ' + usuario.rol);
        return;
      }
    }

    // Mapear a DTO esperado por backend
    const dto = {
      userName: usuario.userName.trim(),
      password: usuario.password,
      nombres: usuario.nombre.trim(),
      apellidos: usuario.apellidos.trim(),
      cedula: usuario.cedula.trim(),
      fechaNacimiento: usuario.fechaNacimiento,
      rol: rol,
      horario: usuario.horario ? usuario.horario.trim() : undefined,
      sueldo: usuario.sueldo ? Number(usuario.sueldo) : undefined,
    };

    console.log('Enviando usuario al backend:', dto);

    this.usuarioService.crearUsuario(dto).subscribe({
      next: (res) => {
        console.log('Usuario creado exitosamente:', res);
        alert('Usuario creado exitosamente');
        this.cargarUsuarios();
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al guardar usuario:', err);
        const mensaje = err.error?.message || 'Error al guardar el usuario. Por favor intente nuevamente.';
        alert('Error: ' + mensaje);
      }
    });
  }

  eliminar(u: UsuarioBasico) {
    if (!confirm(`¿Está seguro de eliminar al usuario ${u.nombres} ${u.apellidos}?`)) {
      return;
    }
    
    this.usuarioService.eliminarUsuario(u.id).subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        alert('Error al eliminar el usuario. Por favor intente nuevamente.');
      }
    });
  }

  private cargarUsuarios(): void {
    forkJoin([
      this.usuarioService.getUsuarios('administrador'),
      this.usuarioService.getUsuarios('entrenador'),
      this.usuarioService.getUsuarios('recepcionista'),
    ]).subscribe(([admins, ent, rec]) => {
      const a = (admins || []).map(x => ({
        id: x.id,
        userName: x.userName,
        nombres: x.nombres,
        apellidos: x.apellidos,
        cedula: x.cedula,
        rol: 'administrador' as const,
      }));
      const e = (ent || []).map(x => ({ ...x, rol: 'entrenador' as const }));
      const r = (rec || []).map(x => ({ ...x, rol: 'recepcionista' as const }));
      this.usuarios = [...a, ...e, ...r];
    });
  }
}
