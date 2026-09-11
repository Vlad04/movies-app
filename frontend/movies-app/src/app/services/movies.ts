import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie, SaveMovie } from '../models/movie';
import { environment } from '../../environments/environment';

// Servicio responsable de las operaciones HTTP relacionadas con películas  
@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly http = inject(HttpClient);

  // Ruta de los endpoints de películas
  private readonly url = `${environment.apiUrl}/movies`;

  // Obtiene la lista completa de películas
  getAll(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.url);
  }

  // Envía los datos de una nueva película a la API
  create(data: SaveMovie): Observable<Movie> {
    return this.http.post<Movie>(this.url, data);
  }

  // Actualiza la película identificada por su id
  update(id: number, data: SaveMovie): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  // Elimina la película identificada por su id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}