import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { LucideAngularModule, Users, Search, X, Trash2, Pencil, Package, AlertTriangle, Clock, Info } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(
      LucideAngularModule.pick({
        Users,
        Search,
        X,
        Trash2,
        Pencil,
        Package,
        AlertTriangle,
        Clock,
        Info,
      }),
    ),
  ]
};
