import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'hero-gym-web';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    const currentUrl = this.router.url;
  
    if (!token && currentUrl.includes('/dashboard')) {
      this.router.navigate(['/auth/login']);
    }
  
    if (token && currentUrl === '/auth/login') {
      this.router.navigate(['/dashboard']);
    }
  }
  
}

