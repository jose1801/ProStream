import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular'; 
import { addIcons } from 'ionicons';
import { 
  searchOutline, addOutline, checkmarkDoneOutline, tvOutline, 
  cashOutline, imageOutline, createOutline, trashOutline 
} from 'ionicons/icons';

// 🌟 IMPORTACIONES NATIVAS PARA ACCEDER A LA CÁMARA/GALERÍA EN LA APK
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// 🌟 IMPORTACIÓN DEL ENTORNO GLOBAL EN PRODUCCIÓN
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: true, 
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule 
  ]
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

  // Guardamos el Blob binario compatible con Multer
  imagenArchivo: Blob | null = null; 
  previsualizacionUrl: string | null = null; 

  constructor(private http: HttpClient) {
    addIcons({ 
      searchOutline, addOutline, checkmarkDoneOutline, tvOutline, 
      cashOutline, imageOutline, createOutline, trashOutline 
    });
  }

  ngOnInit() {
    this.obtenerServiciosBD();
  }

  obtenerServiciosBD() {
    this.http.get(`${environment.apiUrl}/api/productos`).subscribe({
      next: (res: any) => {
        const productosProcesados = res.map((prod: any) => {
          let urlCompleta = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150';
          
          if (prod.logo_url) {
            // 🛡️ BLINDAJE DE IMÁGENES: Detecta de manera inteligente el tipo de origen del logo
            if (prod.logo_url.startsWith('uploads/')) {
              // Si fue guardada físicamente en el servidor mediante Multer
              urlCompleta = `${environment.apiUrl}/${prod.logo_url}`;
            } else if (prod.logo_url.startsWith('data:image') || prod.logo_url.startsWith('http://') || prod.logo_url.startsWith('https://')) {
              // Si es un Base64 directo de la galería o una URL completa de internet, la dejamos pasar limpia
              urlCompleta = prod.logo_url;
            } else {
              // Por si guardaste el Base64 puro sin el encabezado MIME
              urlCompleta = `data:image/png;base64,${prod.logo_url}`;
            }
          }
          
          return { ...prod, imagen_final: urlCompleta };
        });
        this.serviciosBaseCompleta = productosProcesados;
        this.resultados = productosProcesados;
      },
      error: (err: any) => console.error('Error al listar plataformas:', err)
    });
  }

  // 📸 REEMPLAZO NATIVO: Abre la galería de Android y empaqueta la foto para Multer
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
        console.log('✅ Imagen empaquetada como archivo binario nativo con éxito.');
      }
    } catch (error) {
      console.error('Error al seleccionar la foto desde la galería nativa:', error);
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
      alert('Error: No se localizó un perfil activo. Por favor vuelve a iniciar sesión.');
      return;
    }

    if (confirm('¿Estás completamente seguro de eliminar esta plataforma de Stream Cipher?')) {
      this.http.delete(`${environment.apiUrl}/api/productos/${id}?operador=${usuarioLogueado}`).subscribe({
        next: () => {
          alert('Plataforma eliminada correctamente.');
          this.obtenerServiciosBD(); 
        },
        error: (err) => alert('Error al eliminar plataforma: ' + err.message)
      });
    }
  }

  guardarNuevoServicio() {
    if (!this.nuevoServicio.prod_nombre || !this.nuevoServicio.prod_precio) {
      alert('Por favor, completa los campos requeridos (Nombre y Precio).');
      return;
    }

    const usuarioLogueado = localStorage.getItem('usuario_nombre');

    if (!usuarioLogueado) {
      alert('Error: No se localizó un perfil activo. Por favor vuelve a iniciar sesión.');
      return;
    }

    const formData = new FormData();
    formData.append('prod_nombre', this.nuevoServicio.prod_nombre);
    formData.append('prod_precio', this.nuevoServicio.prod_precio);
    formData.append('operador_auditoria', usuarioLogueado);

    if (this.imagenArchivo) {
      formData.append('prod_imagen', this.imagenArchivo, `plataforma_${Date.now()}.png`);
    }

    if (this.modoEdicion) {
      this.http.put(`${environment.apiUrl}/api/productos/${this.idServicioEditar}`, formData).subscribe({
        next: () => {
          alert('¡Plataforma actualizada con éxito!');
          this.setOpenModal(false);
          this.obtenerServiciosBD();
        },
        error: (err) => alert('Error al actualizar: ' + (err.error?.message || err.message))
      });
    } else {
      this.http.post(`${environment.apiUrl}/api/productos`, formData).subscribe({
        next: () => {
          alert('¡Plataforma registrada con éxito!');
          this.setOpenModal(false);
          this.obtenerServiciosBD();
        },
        error: (err) => alert('Error al registrar: ' + (err.error?.message || err.message))
      });
    }
  }
}