import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Director } from '../../models/director';
import { Movie, SaveMovie } from '../../models/movie';
import { DirectorsService } from '../../services/directors';
import { MoviesService } from '../../services/movies';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movies.html',
  styleUrl: './movies.css'
})
export class Movies implements OnInit {
  private readonly moviesService = inject(MoviesService);
  private readonly directorsService = inject(DirectorsService);

  movies: Movie[] = [];
  directors: Director[] = [];
  form: SaveMovie = this.emptyForm();
  editingId: number | null = null;
  loading = false;
  saving = false;
  error = '';
  success = '';
  searchTerm = '';
  genreFilter = '';
  directorFilter = 0;

  get genres(): string[] {
    return [...new Set(this.movies.map(movie => movie.gender))]
      .sort((a, b) => a.localeCompare(b));
  }

  get filteredMovies(): Movie[] {
    const term = this.normalize(this.searchTerm);
    return this.movies.filter(movie => {
      const matchesText = !term
        || this.normalize(movie.name).includes(term)
        || this.normalize(movie.directorName).includes(term);
      const matchesGenre = !this.genreFilter || movie.gender === this.genreFilter;
      const matchesDirector = !this.directorFilter || movie.fkDirector === this.directorFilter;
      return matchesText && matchesGenre && matchesDirector;
    });
  }

  ngOnInit(): void {
    this.loadDirectors();
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading = true;
    this.error = '';
    this.moviesService.getAll().subscribe({
      next: data => {
        this.movies = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar las películas. Verifica que la API esté disponible.';
        this.loading = false;
      }
    });
  }

  loadDirectors(): void {
    this.directorsService.getAll().subscribe({
      next: data => this.directors = data,
      error: () => this.error = 'No fue posible cargar los directores.'
    });
  }

  save(): void {
    this.error = '';
    this.success = '';
    this.saving = true;
    const wasEditing = this.editingId !== null;
    const payload: SaveMovie = {
      ...this.form,
      duration: this.form.duration.length === 5 ? `${this.form.duration}:00` : this.form.duration
    };

    const request: Observable<unknown> = wasEditing
      ? this.moviesService.update(this.editingId!, payload)
      : this.moviesService.create(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.success = wasEditing
          ? 'La película se actualizó correctamente.'
          : 'La película se agregó correctamente.';
        this.cancel(false);
        this.loadMovies();
      },
      error: err => {
        this.saving = false;
        this.error = err.error?.message ?? 'No fue posible guardar la película.';
      }
    });
  }

  edit(movie: Movie): void {
    this.error = '';
    this.success = '';
    this.editingId = movie.pkMovies;
    this.form = {
      name: movie.name,
      gender: movie.gender,
      duration: movie.duration.substring(0, 5),
      fkDirector: movie.fkDirector
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(movie: Movie): void {
    if (!confirm(`¿Seguro que deseas eliminar “${movie.name}”?`)) return;
    this.error = '';
    this.success = '';
    this.moviesService.delete(movie.pkMovies).subscribe({
      next: () => {
        this.success = 'La película se eliminó correctamente.';
        this.loadMovies();
      },
      error: () => this.error = 'No fue posible eliminar la película.'
    });
  }

  cancel(clearMessages = true): void {
    this.editingId = null;
    this.form = this.emptyForm();
    if (clearMessages) {
      this.error = '';
      this.success = '';
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.genreFilter = '';
    this.directorFilter = 0;
  }

  trackByMovieId(_: number, movie: Movie): number {
    return movie.pkMovies;
  }

  private normalize(value: string): string {
    return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  private emptyForm(): SaveMovie {
    return { name: '', gender: '', duration: '01:30', fkDirector: 0 };
  }
}
