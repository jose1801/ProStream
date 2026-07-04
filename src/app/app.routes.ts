import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./paginas/login/login.page').then( m => m.LoginPage)
  },
  // 🌟 ESTA ES LA RUTA QUE SE VA A ACTIVAR AL LOGUEARTE:
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'clientes',
    loadComponent: () => import('./paginas/clientes/clientes.page').then( m => m.ClientesPage)
  },
  {
    path: 'servicios',
    loadComponent: () => import('./paginas/servicios/servicios.page').then( m => m.ServiciosPage)
  },
  {
    path: 'auditoria',
    loadComponent: () => import('./paginas/auditoria/auditoria.page').then( m => m.AuditoriaPage)
  }
];