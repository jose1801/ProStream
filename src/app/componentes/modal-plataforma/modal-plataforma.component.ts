import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonInput, 
  IonAvatar, 
  IonIcon 
} from '@ionic/angular/standalone'; // 👈 Importaciones standalone necesarias para tu formulario
import { PlataformasService } from '../../services/plataformas';

// Registro de iconos para que rendericen sin problemas
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-modal-plataforma',
  templateUrl: './modal-plataforma.component.html',
  styleUrls: ['./modal-plataforma.component.scss'],
  standalone: true, // 👈 Forzamos a que sea Standalone
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonAvatar, 
    IonIcon
  ] // 👈 Todos los elementos que usas en el HTML agregados aquí
})
export class ModalPlataformaComponent implements OnInit {
  @Input() plataforma: any;
  
  isEditMode = false;
  nombre: string = '';
  precio_costo: number = 0;
  precio_venta: number = 0;
  stock: number = 0;
  logoArchivo: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private plataformasService: PlataformasService
  ) {
    // Registramos el icono del botón de guardar
    addIcons({ checkmarkCircleOutline });
  }

  ngOnInit() {
    if (this.plataforma) {
      this.isEditMode = true;
      this.nombre = this.plataforma.nombre;
      this.precio_costo = this.plataforma.precio_costo;
      this.precio_venta = this.plataforma.precio_venta;
      this.stock = this.plataforma.stock;
      this.previewUrl = this.plataforma.logo_url;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.logoArchivo = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  guardar() {
    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('precio_costo', this.precio_costo.toString());
    formData.append('precio_venta', this.precio_venta.toString());
    formData.append('stock', this.stock.toString());
    if (this.logoArchivo) {
      formData.append('logo', this.logoArchivo);
    }

    if (this.isEditMode) {
      this.plataformasService.actualizarPlataforma(this.plataforma.id, formData).subscribe(() => {
        this.modalCtrl.dismiss({ cambiado: true });
      });
    } else {
      this.plataformasService.crearPlataforma(formData).subscribe(() => {
        this.modalCtrl.dismiss({ cambiado: true });
      });
    }
  }
}