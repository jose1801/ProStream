import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { 
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonList, 
  IonItem, IonInput, IonButton, IonIcon, IonHeader, 
  IonCardContent, LoadingController, ToastController // 🌟 Importamos Loading y Toast
} from '@ionic/angular/standalone'; 
import { environment } from '../../../environments/environment';

import { addIcons } from 'ionicons';
import { logInOutline, personOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonList, 
    IonItem, IonInput, IonButton, IonIcon, IonCardContent
  ]
})
export class LoginPage implements OnInit {
  usuario = { usr_usuario: '', usr_clave: '' };

  // 🌟 1. Inyectamos controladores
  constructor(
    private http: HttpClient, 
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ logInOutline, personOutline, lockClosedOutline });
  }

  ngOnInit() {}

  // 🌟 2. Función auxiliar Toast
  async mostrarToast(mensaje: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  async ejecutarLogin() {
    // 🌟 3. Activamos el Loading al empezar
    const loading = await this.loadingCtrl.create({
      message: 'Conectando con el servidor...',
      spinner: 'circles'
    });
    await loading.present();

    const url = `${environment.apiUrl}/api/auth/login`;

    this.http.post(url, this.usuario).subscribe({
      next: (res: any) => {
        loading.dismiss(); // Quitamos el loading
        if (res.token) {
          localStorage.setItem('token_cipher', res.token);
          const nombreLogueado = res.usr_usuario || this.usuario.usr_usuario;
          localStorage.setItem('usuario_nombre', nombreLogueado);
          
          this.router.navigate(['/home']); 
        }
      },
      error: (err) => {
        loading.dismiss(); // Quitamos el loading si hay error
        this.mostrarToast(err.error?.message || 'Error al conectar con el servidor.');
      }
    });
  }
}