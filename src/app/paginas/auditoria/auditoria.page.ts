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

// 🌟 IMPORTAMOS LA LIBRERÍA EXCEL
import * as XLSX from 'xlsx';

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
    // 🚀 CAMBIO: Apunta a Render dinámicamente para jalar los logs
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

  // 🌟 FUNCIONALIDAD: RESPALDO ONE-TOUCH (EXPORTACIÓN COMPLETA A EXCEL)
  exportarRespaldoExcel() {
    if (this.resultados.length === 0) {
      alert('No hay registros de auditoría disponibles para exportar.');
      return;
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

    const nombreArchivo = `Respaldo_Auditoria_StreamCipher_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(libroTrabajo, nombreArchivo);
  }

  getBadgeColor(accion: string): string {
    const act = accion.toUpperCase();
    if (act.includes('INSERT') || act.includes('CREAR')) return 'success';
    if (act.includes('UPDATE') || act.includes('MODIFICAR')) return 'warning';
    if (act.includes('DELETE') || act.includes('ELIMINAR')) return 'danger';
    return 'medium';
  }
}