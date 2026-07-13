import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ToastController } from '@ionic/angular'; // 🌟 1. Importar ToastController

import { addIcons } from 'ionicons';
import { 
  searchOutline, addOutline, checkmarkDoneOutline, tvOutline, 
  cashOutline, imageOutline, createOutline, trashOutline 
} from 'ionicons/icons';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: true, 
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ServiciosPage implements OnInit {
  filtroBusqueda: string = '';
  resultados: any[] = [];
  serviciosBaseCompleta: any[] = [];
  
  isModalOpen = false;
  isDetalleOpen = false;
  servicioSeleccionado: any = null;
  
  modoEdicion = false; 
  idServicioEditar: number | null = null;

  nuevoServicio = {
    prod_nombre: '',
    prod_precio: ''
  };

  imagenArchivo: Blob | null = null; 
  previsualizacionUrl: string | null = null; 

  // 🌟 2. Inyectar ToastController en el constructor
  constructor(private http: HttpClient, private toastCtrl: ToastController) {
    addIcons({ 
      searchOutline, addOutline, checkmarkDoneOutline, tvOutline, 
      cashOutline, imageOutline, createOutline, trashOutline 
    });
  }

  ngOnInit() {
    this.obtenerServiciosBD();
  }

  // 📢 3. Función auxiliar para mostrar el Toast
  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  obtenerServiciosBD() {
    this.http.get(`${environment.apiUrl}/api/productos`).subscribe({
      next: (res: any) => {
        const productosProcesados = res.map((prod: any) => {
          let urlCompleta = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150';
          if (prod.logo_url) {
            if (prod.logo_url.startsWith('uploads/')) urlCompleta = `${environment.apiUrl}/${prod.logo_url}`;
            else if (prod.logo_url.startsWith('data:image') || prod.logo_url.startsWith('http://') || prod.logo_url.startsWith('https://')) urlCompleta = prod.logo_url;
            else urlCompleta = `data:image/png;base64,${prod.logo_url}`;
          }
          return { ...prod, imagen_final: urlCompleta };
        });
        this.serviciosBaseCompleta = productosProcesados;
        this.resultados = productosProcesados;
      },
      error: (err: any) => {
        console.error('Error al listar plataformas:', err);
        this.mostrarToast('❌ Error al cargar los servicios', 'danger');
      }
    });
  }

  async cargarImagenLocal() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri, 
        source: CameraSource.Photos 
      });

      if (image && image.webPath) {
        this.previsualizacionUrl = image.webPath;
        const response = await fetch(image.webPath);
        this.imagenArchivo = await response.blob();
      }
    } catch (error) {
      console.error('Error al seleccionar la foto:', error);
      this.mostrarToast('❌ No se pudo seleccionar la imagen', 'danger');
    }
  }

  ejecutarBusqueda(event: any) {
    this.filtroBusqueda = event.target.value.toLowerCase();
    if (!this.filtroBusqueda.trim()) {
      this.resultados = this.serviciosBaseCompleta;
      return;
    }
    this.resultados = this.serviciosBaseCompleta.filter(servicio => 
      servicio.nombre && servicio.nombre.toLowerCase().includes(this.filtroBusqueda)
    );
  }

  setOpenModal(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (!isOpen) {
      this.modoEdicion = false;
      this.idServicioEditar = null;
      this.nuevoServicio = { prod_nombre: '', prod_precio: '' };
      this.imagenArchivo = null;
      this.previsualizacionUrl = null;
    }
  }

  setOpenDetalle(isOpen: boolean) { this.isDetalleOpen = isOpen; }
  verDetalleServicio(servicio: any) { this.servicioSeleccionado = servicio; this.setOpenDetalle(true); }

  abrirEditarServicio(servicio: any) {
    this.modoEdicion = true;
    this.idServicioEditar = servicio.id;
    this.nuevoServicio = {
      prod_nombre: servicio.nombre,
      prod_precio: servicio.precio_venta.toString()
    };
    this.previsualizacionUrl = servicio.imagen_final;
    this.isModalOpen = true; 
  }

  eliminarServicioBD(id: number) {
    const usuarioLogueado = localStorage.getItem('usuario_nombre');
    if (!usuarioLogueado) {
      this.mostrarToast('❌ Sesión no válida', 'danger');
      return;
    }

    if (confirm('¿Estás seguro de eliminar esta plataforma?')) {
      this.http.delete(`${environment.apiUrl}/api/productos/${id}?operador=${usuarioLogueado}`).subscribe({
        next: () => {
          this.mostrarToast('🗑️ Plataforma eliminada correctamente');
          this.obtenerServiciosBD(); 
        },
        error: (err) => this.mostrarToast('❌ Error al eliminar: ' + err.message, 'danger')
      });
    }
  }

  guardarNuevoServicio() {
    if (!this.nuevoServicio.prod_nombre || !this.nuevoServicio.prod_precio) {
      this.mostrarToast('⚠️ Completa el nombre y el precio', 'warning');
      return;
    }

    const usuarioLogueado = localStorage.getItem('usuario_nombre');
    if (!usuarioLogueado) {
      this.mostrarToast('❌ Error de sesión', 'danger');
      return;
    }

    const formData = new FormData();
    formData.append('prod_nombre', this.nuevoServicio.prod_nombre);
    formData.append('prod_precio', this.nuevoServicio.prod_precio);
    formData.append('operador_auditoria', usuarioLogueado);

    if (this.imagenArchivo) {
      formData.append('prod_imagen', this.imagenArchivo, `plataforma_${Date.now()}.png`);
    }

    const url = this.modoEdicion 
      ? `${environment.apiUrl}/api/productos/${this.idServicioEditar}` 
      : `${environment.apiUrl}/api/productos`;
      
    const request = this.modoEdicion 
      ? this.http.put(url, formData) 
      : this.http.post(url, formData);

    request.subscribe({
      next: () => {
        this.mostrarToast(this.modoEdicion ? '✅ Plataforma actualizada' : '✅ Plataforma registrada');
        this.setOpenModal(false);
        this.obtenerServiciosBD();
      },
      error: (err) => this.mostrarToast('❌ Error: ' + (err.error?.message || err.message), 'danger')
    });
  }
}