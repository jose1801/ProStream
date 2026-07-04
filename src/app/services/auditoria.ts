import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 👈 Importante
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private apiUrl = `${environment.apiUrl}/api/auditoria`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token_cipher');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCuentasExpiradas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/expiradas`, { headers: this.getHeaders() });
  }

  limpiarPerfil(suscripcionId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/limpiar/${suscripcionId}`, {}, { headers: this.getHeaders() });
  }

  descargarRespaldo(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/respaldo/exportar`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }
}