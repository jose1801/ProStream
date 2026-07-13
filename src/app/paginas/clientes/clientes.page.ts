import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ToastController } from '@ionic/angular'; // 🌟 ToastController agregado

import { addIcons } from 'ionicons';
import { 
  searchOutline, personCircleOutline, addOutline, checkmarkDoneOutline, 
  createOutline, trashOutline, receiptOutline, downloadOutline
} from 'ionicons/icons';

import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ClientesPage implements OnInit {
  filtroBusqueda: string = '';
  resultados: any[] = [];
  clientesBaseCompleta: any[] = [];
  appsDisponibles: any[] = [];
  
  isModalOpen = false;
  isTicketOpen = false; 
  modoEdicion = false;
  idClienteEditar: number | null = null;

  nuevoCliente = {
    nombre: '',
    telefono: '',
    producto_id: '',
    descripcion: '',
    fecha_vencimiento: '',
    operador_auditoria: '' 
  };

  datosTicket = {
    nombre: '',
    telefono: '',
    app: '',
    valor: '',
    fecha_vencimiento: '',
    descripcion: ''
  };

  // 🌟 Inyectamos ToastController
  constructor(private http: HttpClient, private toastCtrl: ToastController) {
    addIcons({ 
      searchOutline, personCircleOutline, addOutline, 
      checkmarkDoneOutline, createOutline, trashOutline,
      receiptOutline, downloadOutline
    });
  }

  ngOnInit() {
    this.obtenerClientesBD();
    this.cargarAppsDisponibles();
  }

  // 📢 FUNCIÓN MAESTRA PARA MENSAJES TOAST
  async mostrarToast(mensaje: string, color: string = 'success', duracion: number = 2000) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: duracion,
      position: 'bottom',
      color: color,
      cssClass: 'custom-toast' // Opcional por si luego quieres darle estilos extra en SCSS
    });
    await toast.present();
  }

  // 🔍 LÓGICA DE AUTOCOMPLETADO INTELIGENTE
  buscarCliente(event: any) {
    const termino = event.target.value.toLowerCase().trim();
    if (termino.length < 3) return; 

    const clienteEncontrado = this.clientesBaseCompleta.find(c => 
      (c.nombre && c.nombre.toLowerCase().includes(termino)) || 
      (c.telefono && c.telefono.includes(termino))
    );

    if (clienteEncontrado) {
      this.nuevoCliente.nombre = clienteEncontrado.nombre;
      this.nuevoCliente.telefono = clienteEncontrado.telefono;
      // 🌟 Toast de Autocompletado
      this.mostrarToast(`✨ Autocompletado: ${clienteEncontrado.nombre}`, 'tertiary', 1500);
      console.log("Cliente detectado y datos autorrellenados.");
    }
  }

  obtenerClientesBD() {
    this.http.get(`${environment.apiUrl}/api/clientes`).subscribe({
      next: (res: any) => { 
        this.clientesBaseCompleta = res; 
        this.resultados = res; 
      },
      error: (err) => {
        console.error('Error al obtener clientes:', err);
        this.mostrarToast('❌ Error al cargar los clientes', 'danger');
      }
    });
  }

  cargarAppsDisponibles() {
    this.http.get(`${environment.apiUrl}/api/productos`).subscribe({
      next: (res: any) => this.appsDisponibles = res,
      error: () => this.mostrarToast('❌ Error al cargar servicios disponibles', 'danger')
    });
  }

  ejecutarBusqueda(event: any) {
    this.filtroBusqueda = event.target.value.toLowerCase();
    if (!this.filtroBusqueda.trim()) { 
      this.resultados = this.clientesBaseCompleta; 
      return; 
    }
    this.resultados = this.clientesBaseCompleta.filter(c => 
      (c.nombre && c.nombre.toLowerCase().includes(this.filtroBusqueda)) || 
      (c.telefono && c.telefono.includes(this.filtroBusqueda))
    );
  }

  setOpenModal(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (!isOpen) {
      this.modoEdicion = false;
      this.idClienteEditar = null;
      this.nuevoCliente = { nombre: '', telefono: '', producto_id: '', descripcion: '', fecha_vencimiento: '', operador_auditoria: '' };
    }
  }

  setOpenTicket(isOpen: boolean) {
    this.isTicketOpen = isOpen;
  }

  abrirEditarCliente(cliente: any) {
    this.modoEdicion = true;
    this.idClienteEditar = cliente.id;
    this.nuevoCliente = {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      producto_id: cliente.producto_id ? cliente.producto_id.toString() : '',
      descripcion: cliente.descripcion || '',
      fecha_vencimiento: cliente.fecha_vencimiento ? cliente.fecha_vencimiento.substring(0, 10) : '',
      operador_auditoria: ''
    };
    this.isModalOpen = true;
  }

  generarTicketDesdeFormulario() {
    const appSeleccionada = this.appsDisponibles.find(a => a.id == this.nuevoCliente.producto_id);
    
    this.datosTicket = {
      nombre: this.nuevoCliente.nombre || 'N/A',
      telefono: this.nuevoCliente.telefono || 'N/A',
      app: appSeleccionada ? appSeleccionada.nombre : 'No asignada',
      valor: appSeleccionada ? `$${appSeleccionada.precio_venta}` : '$0.00',
      fecha_vencimiento: this.nuevoCliente.fecha_vencimiento || 'Sin fecha',
      descripcion: this.nuevoCliente.descripcion || 'Sin detalles de cuenta'
    };

    this.isTicketOpen = true; 
  }

  // 🎫 ALMACENAMIENTO NATIVO DE LA IMAGEN EN LA APK
  async descargarComprobanteTicket() {
    const el = document.getElementById('contenedor-ticket-digital');
    if (!el) return;

    // 🌟 Toast informando inicio de descarga
    this.mostrarToast('⏳ Generando ticket...', 'medium', 1000);

    try {
      const canvas = await html2canvas(el, { scale: 3, useCORS: true });
      const nombre = `Ticket_${Date.now()}.png`;
      const dataUrl = canvas.toDataURL('image/png');

      if (Capacitor.getPlatform() === 'web') {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = nombre;
        document.body.appendChild(link);
        link.click();
        link.remove();
        this.mostrarToast('🎫 Ticket descargado en el navegador', 'success');
      } else {
        await Filesystem.writeFile({
          path: nombre,
          data: dataUrl.split(',')[1],
          directory: Directory.Documents,
          recursive: true
        });
        this.mostrarToast('🎫 Ticket guardado en Documentos', 'success');
      }
    } catch (err) {
      console.error(err);
      this.mostrarToast('❌ Error al generar ticket', 'danger');
    }
  }

  eliminarClienteBD(id: number) {
    const usuarioLogueado = localStorage.getItem('usuario_nombre');

    if (!usuarioLogueado) {
      this.mostrarToast('❌ Sesión expirada. Vuelve a iniciar sesión.', 'warning');
      return;
    }

    if (confirm('¿Deseas eliminar permanentemente a este cliente de Stream Cipher?')) {
      this.http.delete(`${environment.apiUrl}/api/clientes/${id}?operador=${usuarioLogueado}`).subscribe({
        next: () => { 
          this.mostrarToast('🗑️ Cliente eliminado exitosamente', 'dark'); 
          this.obtenerClientesBD(); 
        },
        error: (err) => this.mostrarToast('❌ Error al eliminar: ' + err.message, 'danger')
      });
    }
  }

  guardarNuevoCliente() {
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.telefono) {
        this.mostrarToast('⚠️ Por favor, introduce el nombre y el teléfono', 'warning');
        return;
    }

    const usuarioLogueado = localStorage.getItem('usuario_nombre');
    if (!usuarioLogueado) {
      this.mostrarToast('❌ Error de perfil. Inicia sesión nuevamente.', 'danger');
      return;
    }

    const clienteParaEnviar = {
        ...this.nuevoCliente,
        producto_id: Number(this.nuevoCliente.producto_id),
        operador_auditoria: usuarioLogueado
    };

    const url = this.modoEdicion 
      ? `${environment.apiUrl}/api/clientes/${this.idClienteEditar}` 
      : `${environment.apiUrl}/api/clientes`;

    const request = this.modoEdicion 
      ? this.http.put(url, clienteParaEnviar) 
      : this.http.post(url, clienteParaEnviar);

    request.subscribe({
      next: () => { 
        this.mostrarToast(this.modoEdicion ? '✅ Cliente actualizado con éxito' : '✅ Cliente registrado con éxito', 'success');
        this.setOpenModal(false); 
        this.obtenerClientesBD(); 
      },
      error: (err) => {
        console.error("Detalle del error:", err);
        this.mostrarToast('❌ Error al procesar la solicitud', 'danger');
      }
    });
  }
}