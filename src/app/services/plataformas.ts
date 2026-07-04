import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 👈 Importante: HttpHeaders
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlataformasService {
  private apiUrl = `${environment.apiUrl}/api/productos`;

  constructor(private http: HttpClient) { }

  // 💥 FUNCIÓN CLAVE: Extrae el token y arma el formato Bearer exigido por tu API
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token_cipher');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // 👈 Esto calza perfecto con tu authHeader.split(' ')[1]
    });
  }

  // Leer: Obtener todas las apps de streaming
  getPlataformas(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  // Crear: Agregar nueva plataforma
  crearPlataforma(datos: FormData): Observable<any> {
    return this.http.post(this.apiUrl, datos, { headers: this.getHeaders() });
  }

  // Actualizar
  actualizarPlataforma(id: number, datos: FormData | any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos, { headers: this.getHeaders() });
  }

  // Borrar
  eliminarPlataforma(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}