import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';

interface Cliente {
  nombre: string;
  apellido: string;
  cedula: string;
  password: string;
  horario: string;
  sexo: string;
  observaciones: string;
  objetivo: string;
  tiempoEntrenar: string;
  [key: string]: any;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clienteForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private clienteService: ClienteService) {
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cedula: ['', Validators.required],
      password: ['', Validators.required],
      horario: ['', Validators.required],
      sexo: ['', Validators.required],
      observaciones: [''],
      objetivo: [''],
      tiempoEntrenar: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data: Cliente[]) => {
        this.clientes = data;
      },
      error: () => {
        this.errorMessage = 'Error al cargar clientes';
      }
    });
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    this.clienteService.createCliente(this.clienteForm.value).subscribe({
      next: () => {
        this.successMessage = 'Cliente registrado correctamente';
        this.errorMessage = '';
        this.clienteForm.reset();
        this.loadClientes();
      },
      error: () => {
        this.errorMessage = 'Error al registrar cliente';
        this.successMessage = '';
      }
    });
  }
}
