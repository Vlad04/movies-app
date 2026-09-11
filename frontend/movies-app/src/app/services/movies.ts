import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie, SaveMovie } from '../models/movie';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/movies`;

  getAll(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.url);
  }

  create(data: SaveMovie): Observable<Movie> {
    return this.http.post<Movie>(this.url, data);
  }

  update(id: number, data: SaveMovie): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}