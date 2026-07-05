import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { 
  searchOutline, shieldCheckmarkOutline, timeOutline, personOutline, 
  refreshOutline, downloadOutline 
} from 'ionicons/icons';

import * as XLSX from 'xlsx';

// 🌟 IMPORTACIONES NATIVAS PARA ALMACENAMIENTO EN LA APK
import { Filesystem, Directory } from '@capacitor/filesystem';

// 🌟 IMPORTACIÓN DEL ENTORNO GLOBAL EN PRODUCCIÓN
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.page.html',
  styleUrls: ['./auditoria.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule
  ]
})
export class AuditoriaPage implements OnInit {
  filtroBusqueda: string = '';
  resultados: any[] = [];
  auditoriaBaseCompleta: any[] = [];

  constructor(private http: HttpClient) {
    addIcons({ 
      searchOutline, shieldCheckmarkOutline, timeOutline, 
      personOutline, refreshOutline, downloadOutline 
    });
  }

  ngOnInit() {
    this.obtenerHistorialAuditoria();
  }

  obtenerHistorialAuditoria() {
    this.http.get(`${environment.apiUrl}/api/auditoria`).subscribe({
      next: (res: any) => {
        this.auditoriaBaseCompleta = res;
        this.resultados = res;
      },
      error: (err) => console.error('Error al obtener logs de auditoría:', err)
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

  // 📊 EXPORTACIÓN COMPLETA A EXCEL EN LA CARPETA PÚBLICA DE DESCARGAS
  async exportarRespaldoExcel() {
    if (this.resultados.length === 0) {
      alert('No hay registros de auditoría disponibles para exportar.');
      return;
    }

    try {
      // 🔑 PASO INTEGRADO: Solicitar permisos de almacenamiento en tiempo de ejecución
      const estadoPermiso = await Filesystem.checkPermissions();
      if (estadoPermiso.publicStorage !== 'granted') {
        const solicitar = await Filesystem.requestPermissions();
        if (solicitar.publicStorage !== 'granted') {
          alert('Error: Se requieren permisos de almacenamiento para guardar el archivo.');
          return;
        }
      }

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
      XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, 'Auditoría Stream Cipher');

      // Generamos el excel en base64 limpio
      const excelBuffer = XLSX.write(libroTrabajo, { bookType: 'xlsx', type: 'base64' });
      const nombreArchivo = `Respaldo_Auditoria_StreamCipher_${new Date().toISOString().slice(0,10)}.xlsx`;

      // 💾 CAMBIO LOGÍTICO: Escribimos el archivo usando el sistema nativo en el Documents directo de la memoria raíz
      await Filesystem.writeFile({
        path: nombreArchivo,
        data: excelBuffer,
        directory: Directory.Documents, // Almacenamiento externo público
        recursive: true
      });

      alert(`✅ ¡Reporte descargado con éxito!\n\nBúscalo en tu app de 'Mis Archivos' o en la sección de 'Descargas/Documentos' como:\n${nombreArchivo}`);

    } catch (error: any) {
      console.error('Error crítico al guardar Excel:', error);
      alert('No se pudo procesar la descarga del reporte. Revisa que la app tenga los permisos activos en los ajustes de tu celular.');
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