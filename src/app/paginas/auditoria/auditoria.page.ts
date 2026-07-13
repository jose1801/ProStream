import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ToastController } from '@ionic/angular'; // 🌟 ToastController agregado

import { addIcons } from 'ionicons';
import { 
  searchOutline, shieldCheckmarkOutline, timeOutline, personOutline, 
  refreshOutline, downloadOutline 
} from 'ionicons/icons';

import * as XLSX from 'xlsx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.page.html',
  styleUrls: ['./auditoria.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AuditoriaPage implements OnInit {
  filtroBusqueda: string = '';
  resultados: any[] = [];
  auditoriaBaseCompleta: any[] = [];

  // 🌟 Constructor con ToastController
  constructor(private http: HttpClient, private toastCtrl: ToastController) {
    addIcons({ 
      searchOutline, shieldCheckmarkOutline, timeOutline, 
      personOutline, refreshOutline, downloadOutline 
    });
  }

  ngOnInit() {
    this.obtenerHistorialAuditoria();
  }

  // 📢 FUNCIÓN MAESTRA PARA TOASTS
  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  obtenerHistorialAuditoria() {
    this.http.get(`${environment.apiUrl}/api/auditoria`).subscribe({
      next: (res: any) => {
        this.auditoriaBaseCompleta = res;
        this.resultados = res;
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarToast('❌ Error al obtener logs', 'danger');
      }
    });
  }

  ejecutarBusqueda(event: any) {
    this.filtroBusqueda = event.target.value.toLowerCase();
    if (!this.filtroBusqueda.trim()) {
      this.resultados = this.auditoriaBaseCompleta;
      return;
    }
    this.resultados = this.auditoriaBaseCompleta.filter(log => 
      (log.usuario && log.usuario.toLowerCase().includes(this.filtroBusqueda)) ||
      (log.accion && log.accion.toLowerCase().includes(this.filtroBusqueda)) ||
      (log.tabla_afectada && log.tabla_afectada.toLowerCase().includes(this.filtroBusqueda))
    );
  }

  async exportarRespaldoExcel() {
    if (this.resultados.length === 0) {
      this.mostrarToast('⚠️ No hay registros para exportar', 'warning');
      return;
    }

    try {
      this.mostrarToast('⏳ Generando archivo Excel...', 'medium');

      const datosFormateados = this.resultados.map(log => ({
        'ID Evento': log.id,
        'Acción Ejecutada': log.accion,
        'Módulo/Tabla Afectada': log.tabla_afectada ? log.tabla_afectada.toUpperCase() : 'SISTEMA',
        'Operador / Usuario': log.usuario || 'Sistema Autónomo',
        'Fecha y Hora del Registro': log.fecha_registro ? new Date(log.fecha_registro).toLocaleString() : 'N/A',
        'Detalles Técnicos': log.detalles || 'Ninguno'
      }));

      const hojaTrabajo = XLSX.utils.json_to_sheet(datosFormateados);
      const libroTrabajo = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, 'Auditoría');
      
      const nombreArchivo = `Reporte_Auditoria_${new Date().toISOString().slice(0,10)}.xlsx`;

      if (Capacitor.getPlatform() === 'web') {
        XLSX.writeFile(libroTrabajo, nombreArchivo);
        this.mostrarToast('✅ ¡Reporte descargado!');
      } else {
        const excelBuffer = XLSX.write(libroTrabajo, { bookType: 'xlsx', type: 'base64' });
        await Filesystem.writeFile({
          path: nombreArchivo,
          data: excelBuffer,
          directory: Directory.Documents,
          recursive: true
        });
        this.mostrarToast('✅ ¡Reporte guardado en Documentos!');
      }
    } catch (error: any) {
      console.error(error);
      this.mostrarToast('❌ Error al procesar descarga', 'danger');
    }
  }

  getBadgeColor(accion: string): string {
    const act = accion.toUpperCase();
    if (act.includes('INSERT') || act.includes('CREAR')) return 'success';
    if (act.includes('UPDATE') || act.includes('MODIFICAR')) return 'warning';
    if (act.includes('DELETE') || act.includes('ELIMINAR')) return 'danger';
    return 'medium';
  }
}