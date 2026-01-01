import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      cedula: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if(this.authService.isAuthenticated()){
      const userRole = this.authService.getUserRole();
      if (userRole === 'CLIENTE') {
        this.router.navigate(['/cliente'], { replaceUrl: true });
      } else {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { cedula, password } = this.loginForm.value; 
      
      this.authService.login(cedula, password).subscribe({
       next: () => {}, // La redirección se maneja en el servicio
       error: () => {
          this.errorMessage = 'Credenciales inválidas';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
