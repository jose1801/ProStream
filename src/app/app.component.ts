import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
// 🌟 IMPORTAMOS LAS NOTIFICACIONES NATIVAS DE CAPACITOR
import { PushNotifications } from '@capacitor/push-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  
  constructor() {}

  ngOnInit() {
    // 🚀 Inicializamos el registro de notificaciones al arrancar la app
    this.inicializarNotificacionesPush();
  }

  async inicializarNotificacionesPush() {
    try {
      // 1. Solicitar permisos al usuario en la pantalla del celular
      let permission = await PushNotifications.checkPermissions();

      if (permission.receive !== 'granted') {
        permission = await PushNotifications.requestPermissions();
      }

      if (permission.receive !== 'granted') {
        console.warn('El usuario denegó los permisos para recibir notificaciones push.');
        return;
      }

      // 2. Registrar la aplicación ante los servidores de Firebase
      await PushNotifications.register();

      // 3. Escuchar cuando el token se genera con éxito
      PushNotifications.addListener('registration', (token) => {
        console.log('¡Token de Firebase generado con éxito! 🔥');
        console.log('Tu Token es:', token.value);
        // TODO: En el futuro, enviaremos este token a la API para guardarlo en la Base de Datos
        localStorage.setItem('device_token', token.value);
      });

      // 4. Escuchar si ocurre un error en el registro
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error al registrar las notificaciones en Firebase:', error);
      });

      // 5. Escuchar cuando llega una notificación push con la app abierta (Primer Plano)
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Notificación recibida en primer plano:', notification);
        alert(`🔔 ${notification.title}\n${notification.body}`);
      });

      // 6. Escuchar cuando el usuario le da clic a la notificación en la barra de estado
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('El usuario interactuó con la notificación:', action);
      });

    } catch (e) {
      console.error('Las notificaciones push no están disponibles en la plataforma web:', e);
    }
  }
}