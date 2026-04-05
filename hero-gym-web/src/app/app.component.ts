import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'hero-gym-web';
  private readonly legacyAuthRoutes: Record<string, string> = {
    '/auth/login': '/login',
    '/auth/registro': '/registro',
    '/auth/register-owner': '/registro',
  };
  private readonly publicAuthRoutes = ['/login', '/registro', '/register-owner'];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const currentUrl = this.router.url;

    const legacyRedirect = this.legacyAuthRoutes[currentUrl];

    if (legacyRedirect) {
      this.router.navigate([legacyRedirect], { replaceUrl: true });
      return;
    }

    if (
      !this.authService.isAuthenticated() &&
      (currentUrl.startsWith('/dashboard') || currentUrl.startsWith('/cliente'))
    ) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    if (this.authService.isAuthenticated() && this.publicAuthRoutes.includes(currentUrl)) {
      this.router.navigate([this.authService.getPostLoginRoute()], { replaceUrl: true });
    }
  }
}

