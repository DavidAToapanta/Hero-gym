import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router'; // ✅ agrega esto
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,


    
    private router: Router // ✅ agrega esto también
  ) {
    this.loginForm = this.fb.group({
      cedula: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if(this.authService.isAuthenticated()){
      this.router.navigate(['/dashboard'], { replaceUrl: true }); // ✅ redirige al dashboard si ya está autenticado
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { cedula, password } = this.loginForm.value; 
      
      this.authService.login(cedula, password).subscribe({
        next: (response) => {
          this.authService.handleLoginSuccess(response);
          this.router.navigate(['/dashboard']); // ✅ redirige al dashboard
        },
        error: (err) => {
          this.errorMessage = 'Credenciales inválidas';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
