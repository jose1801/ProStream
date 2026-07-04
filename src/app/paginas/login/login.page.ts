import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonList, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonIcon, 
  IonHeader, 
  IonCardContent 
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
    CommonModule, 
    FormsModule, 
    HttpClientModule,
    IonContent, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonList, 
    IonItem, 
    IonInput, 
    IonButton, 
    IonIcon,
    IonCardContent
  ]
})
export class LoginPage implements OnInit {
  usuario = { 
    usr_usuario: '', 
    usr_clave: '' 
  };

  constructor(private http: HttpClient, private router: Router) {
    addIcons({ logInOutline, personOutline, lockClosedOutline });
  }

  ngOnInit() {}

  ejecutarLogin() {
    const url = `${environment.apiUrl}/api/auth/login`;

    console.log('Disparando petición local a:', url);

    this.http.post(url, this.usuario).subscribe({
      next: (res: any) => {
        // 1. Validamos que el backend nos haya devuelto el token JWT
        if (res.token) {
          // 2. Guardamos el token de seguridad localmente
          localStorage.setItem('token_cipher', res.token);
          
          // 🌟 CORRECCIÓN DEFINITIVA: Guardamos el usuario real que se digitó en el input.
          // Si tu API manda el valor en res.usr_usuario se usa, sino, se toma el del input text.
          const nombreLogueado = res.usr_usuario || this.usuario.usr_usuario;
          localStorage.setItem('usuario_nombre', nombreLogueado);
          
          console.log('✅ Sesión guardada de forma exitosa en el navegador como:', nombreLogueado);

          // 3. REDIRECCIÓN AUTOMÁTICA DIRECTA AL MENÚ PRINCIPAL
          this.router.navigate(['/home']); 
        }
      },
      error: (err) => {
        // Si el backend responde con un error, lo avisa aquí
        alert(err.error?.message || 'Error al conectar con el servidor.');
      }
    });
  }
}