import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 🚀 Tu URL real de Render apuntando a las rutas de la API
  private apiUrl = 'https://api-stream-v2v4.onrender.com/api'; 

  constructor(private http: HttpClient) { }

  // Función para iniciar sesión como Administrador
  login(credentials: { correo: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}