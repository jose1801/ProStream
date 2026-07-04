import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuscripcionesService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // 1. Panel de Avisos: Obtener alertas de vencimiento (24-48h)
  getAvisosVencimiento(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auditoria/vencimientos`);
  }

  // 2. Buscador Global: Filtrar clientes por término (nombre o teléfono)
  buscarClientes(termino: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes/buscar?query=${termino}`);
  }

  // 3. Procesar Venta: Conecta con tu proceso existente (Resend + DB)
  procesarVenta(datosVenta: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ventas/procesar`, datosVenta);
  }

  registrarCliente(clienteData: any) {
  // Ajusta el puerto (3000 o el que uses) y el prefijo si usas /api
  const url = 'http://localhost:3000/api/clientes'; 
  return this.http.post(url, clienteData);
}
}