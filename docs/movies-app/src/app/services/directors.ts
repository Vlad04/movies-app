import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Director, SaveDirector } from '../models/director';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DirectorsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/directors`;

  getAll(): Observable<Director[]> {
    return this.http.get<Director[]>(this.url);
  }

  create(data: SaveDirector): Observable<Director> {
    return this.http.post<Director>(this.url, data);
  }

  update(id: number, data: SaveDirector): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}