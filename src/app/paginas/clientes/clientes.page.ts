import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { 
  searchOutline, personCircleOutline, addOutline, checkmarkDoneOutline, 
  createOutline, trashOutline, receiptOutline, downloadOutline
} from 'ionicons/icons';

import html2canvas from 'html2canvas';
// 🌟 IMPORTACIÓN DEL ENTORNO GLOBAL EN PRODUCCIÓN
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule
  ]
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

  constructor(private http: HttpClient) {
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

  obtenerClientesBD() {
    // 🚀 CAMBIO: Apunta a Render dinámicamente
    this.http.get(`${environment.apiUrl}/api/clientes`).subscribe({
      next: (res: any) => { 
        this.clientesBaseCompleta = res; 
        this.resultados = res; 
      },
      error: (err) => console.error('Error al obtener clientes:', err)
    });
  }

  cargarAppsDisponibles() {
    // 🚀 CAMBIO: Apunta a Render dinámicamente
    this.http.get(`${environment.apiUrl}/api/productos`).subscribe({
      next: (res: any) => this.appsDisponibles = res
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

  async descargarComprobanteTicket() {
    const contenedorHTML = document.getElementById('contenedor-ticket-digital');
    
    if (!contenedorHTML) {
      alert('Error: No se localizó el contenedor gráfico del ticket.');
      return;
    }

    try {
      const canvas = await html2canvas(contenedorHTML, {
        useCORS: true,
        scale: 3, 
        backgroundColor: '#ffffff'
      });

      const nombreArchivo = `Ticket_${this.datosTicket.nombre.replace(/ /g, '_')}.png`;

      const disparadorDescarga = document.createElement('a');
      disparadorDescarga.download = nombreArchivo;
      disparadorDescarga.href = canvas.toDataURL('image/png');
      disparadorDescarga.click();

    } catch (error: any) {
      console.error('Error al descargar el ticket:', error);
      alert('Inconveniente al descargar el ticket: ' + error.message);
    }
  }

  eliminarClienteBD(id: number) {
    const usuarioLogueado = localStorage.getItem('usuario_nombre');

    if (!usuarioLogueado) {
      alert('Error: No se localizó un perfil activo. Vuelve a iniciar sesión.');
      return;
    }

    if (confirm('¿Deseas eliminar permanentemente a este cliente de Stream Cipher?')) {
      // 🚀 CAMBIO: Apunta a Render dinámicamente con las variables de auditoría
      this.http.delete(`${environment.apiUrl}/api/clientes/${id}?operador=${usuarioLogueado}`).subscribe({
        next: () => { 
          alert('Cliente eliminado exitosamente.'); 
          this.obtenerClientesBD(); 
        },
        error: (err) => alert('Error al eliminar: ' + err.message)
      });
    }
  }

  guardarNuevoCliente() {
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.telefono) {
      alert('Por favor, introduce el nombre y el teléfono.');
      return;
    }

    const usuarioLogueado = localStorage.getItem('usuario_nombre');

    if (!usuarioLogueado) {
      alert('Error: No se localizó un perfil activo. Vuelve a iniciar sesión.');
      return;
    }

    this.nuevoCliente.operador_auditoria = usuarioLogueado;

    if (this.modoEdicion) {
      // 🚀 CAMBIO: Apunta a Render dinámicamente para el PUT
      this.http.put(`${environment.apiUrl}/api/clientes/${this.idClienteEditar}`, this.nuevoCliente).subscribe({
        next: () => { 
          alert('Cliente modificado con éxito.'); 
          this.setOpenModal(false); 
          this.obtenerClientesBD(); 
        },
        error: (err) => alert('Error al modificar: ' + err.message)
      });
    } else {
      // 🚀 CAMBIO: Apunta a Render dinámicamente para el POST
      this.http.post(`${environment.apiUrl}/api/clientes`, this.nuevoCliente).subscribe({
        next: () => { 
          alert('Cliente registrado con éxito.'); 
          this.setOpenModal(false); 
          this.obtenerClientesBD(); 
        },
        error: (err) => alert('Error al registrar: ' + err.message)
      });
    }
  }
}