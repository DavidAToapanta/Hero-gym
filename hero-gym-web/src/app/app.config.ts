import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { LucideAngularModule, Users, Search, X, Trash2, Pencil, Package, AlertTriangle, Clock, Info, AlertCircle, Repeat, Edit, RefreshCw, Check, ShoppingCart, Plus, Minus, PlusCircle, MinusCircle, Printer } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
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
        AlertCircle,
        Repeat,
        Edit,
        RefreshCw,
        Check,
        ShoppingCart,
        Plus,
        Minus,
        PlusCircle,
        MinusCircle,
        Printer,
      }),
    ),
  ]
};
