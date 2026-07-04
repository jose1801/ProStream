import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonCard, 
  IonCardContent,
  IonItem, 
  IonAvatar, 
  IonLabel, 
  IonGrid, 
  IonRow, 
  IonCol 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, 
  peopleOutline, 
  tvOutline, 
  shieldCheckmarkOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonCard, 
    IonCardContent,
    IonItem, 
    IonAvatar, 
    IonLabel, 
    IonGrid, 
    IonRow, 
    IonCol
  ]
})
export class HomePage implements OnInit {
  usuario: string = '';

  constructor(private router: Router) {
    // Registramos únicamente los iconos activos de tus módulos principales
    addIcons({ logOutOutline, peopleOutline, tvOutline, shieldCheckmarkOutline });
  }

  ngOnInit() {
    this.usuario = localStorage.getItem('usuario_nombre') || 'Admin';
  }

  irClientes() {
    this.router.navigate(['/clientes']);
  }

  irServicios() {
    this.router.navigate(['/servicios']);
  }

  irAuditoria() {
    this.router.navigate(['/auditoria']);
  }

  cerrarSesion() {
    localStorage.removeItem('token_cipher');
    localStorage.removeItem('usuario_nombre');
    this.router.navigate(['/login']);
  }
}