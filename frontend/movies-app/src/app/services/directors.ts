import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Director, SaveDirector } from '../models/director';
import { environment } from '../../environments/environment';

// Servicio responsable de las operaciones HTTP relacionadas con directores
@Injectable({ providedIn: 'root' })
export class DirectorsService {
  private readonly http = inject(HttpClient);

  // Ruta de los endpoints de directores
  private readonly url = `${environment.apiUrl}/directors`;

  // Obtiene la lista completa de directores
  getAll(): Observable<Director[]> {
    return this.http.get<Director[]>(this.url);
  }

  // Envía los datos de un nuevo director a la API
  create(data: SaveDirector): Observable<Director> {
    return this.http.post<Director>(this.url, data);
  }

  // Actualiza el director identificado por su id
  update(id: number, data: SaveDirector): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  // Elimina el director identificado por su id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}