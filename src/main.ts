import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core'; // 👈 1. IMPORTA ESTO
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular'; // 👈 2. IMPORTA EL MÓDULO CLÁSICO

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideIonicAngular({}),
    importProvidersFrom(IonicModule.forRoot({})) // 👈 3. AGREGA ESTA LÍNEA AQUÍ
  ],
}).catch((err) => console.error(err));