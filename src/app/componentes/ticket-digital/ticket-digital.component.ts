import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 Necesario para el pipe 'date' en el HTML
import { ModalController } from '@ionic/angular';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonCol, 
  IonRow, 
  IonIcon 
} from '@ionic/angular/standalone'; // 👈 Importaciones standalone oficiales y limpias

// Importación de iconos nativos (opcional, si usas ion-icon de forma dinámica)
import { addIcons } from 'ionicons';
import { copyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-ticket-digital',
  templateUrl: './ticket-digital.component.html',
  styleUrls: ['./ticket-digital.component.scss'],
  standalone: true, // 👈 Declaramos explícitamente que es Standalone
  imports: [
    CommonModule, // 👈 Para que funcione el pipe de fechas
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonCol, 
    IonRow, 
    IonIcon
  ]
})
export class TicketDigitalComponent implements OnInit {
  @Input() datosTicket: any; 
  // Recibe: { nombre_cliente, plataforma, perfil, pin, correo_cuenta, contrasenia_cuenta, fecha_vencimiento, total }

  fechaActual: Date = new Date();

  constructor(private modalCtrl: ModalController) {
    // Registramos los iconos que usas en este componente
    addIcons({ copyOutline });
  }

  ngOnInit() {}

  cerrar() {
    this.modalCtrl.dismiss();
  }

  compartir() {
    if (!this.datosTicket) return;

    // Lógica para copiar el texto limpio al portapapeles y mandarlo a otra app
    const textoCompartir = `
*🎟️ COMPROBANTE DIGITAL - STREAM CIPHER*
----------------------------------------
*Cliente:* ${this.datosTicket.nombre_cliente}
*Servicio:* ${this.datosTicket.plataforma}
*Perfil:* ${this.datosTicket.perfil}
*PIN:* ${this.datosTicket.pin}
----------------------------------------
*🔑 CREDENCIALES DE ACCESO:*
*Correo:* ${this.datosTicket.correo_cuenta}
*Clave:* ${this.datosTicket.contrasenia_cuenta}
----------------------------------------
*📅 Vence:* ${this.datosTicket.fecha_vencimiento}
*💰 Total Pagado:* $${this.datosTicket.total}

_¡Gracias por tu preferencia! Soporte técnico activo._
    `;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textoCompartir);
      alert('¡Texto de ticket copiado al portapapeles para enviar!');
    }
  }
}