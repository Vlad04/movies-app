import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { Director } from '../../models/director';
import { Movie, SaveMovie } from '../../models/movie';
import { DirectorsService } from '../../services/directors';
import { MoviesService } from '../../services/movies';

// Componente que permite administrar a las películas: crear, editar, eliminar y consultar películas
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

  // Datos utilizados por la tabla, el selector de directores y el formulario
  movies: Movie[] = [];
  directors: Director[] = [];
  form: SaveMovie = this.emptyForm();
  editingId: number | null = null;

  // Indicadores y mensajes de la interfaz
  loading = false;
  saving = false;
  error = '';
  success = '';

  // Valores utilizados para filtrar la tabla
  searchTerm = '';
  genreFilter = '';
  directorFilter = 0;

  // Genera la lista de géneros disponibles sin valores repetidos
  get genres(): string[] {
    return [...new Set(this.movies.map(movie => movie.gender))]
      .sort((a, b) => a.localeCompare(b));
  }

  // Aplica simultáneamente los filtros de texto, género y director
  get filteredMovies(): Movie[] {
    const term = this.normalize(this.searchTerm);

    return this.movies.filter(movie => {
      const matchesText =
        !term ||
        this.normalize(movie.name).includes(term) ||
        this.normalize(movie.directorName).includes(term);

      const matchesGenre =
        !this.genreFilter || movie.gender === this.genreFilter;

      const matchesDirector =
        !this.directorFilter ||
        movie.fkDirector === this.directorFilter;

      return matchesText && matchesGenre && matchesDirector;
    });
  }

  // Carga las películas y los directores al abrir el componente
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
        this.error =
          'No fue posible cargar las películas. Verifica que la API esté disponible.';
        this.loading = false;
      }
    });
  }

  // Los directores alimentan el selector del formulario y el filtro de la tabla
  loadDirectors(): void {
    this.directorsService.getAll().subscribe({
      next: data => {
        this.directors = data;
      },
      error: () => {
        this.error = 'No fue posible cargar los directores.';
      }
    });
  }

  // Utiliza el mismo formulario para crear y actualizar películas
  save(): void {
    this.error = '';
    this.success = '';
    this.saving = true;

    const wasEditing = this.editingId !== null;

    // El campo HTML de tipo time devuelve HH:mm. La API recibe la duración como HH:mm:ss, por lo que agregamos los segundos cuando no están presentes.
    const payload: SaveMovie = {
      ...this.form,
      duration:
        this.form.duration.length === 5
          ? `${this.form.duration}:00`
          : this.form.duration
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
        this.error =
          err.error?.message ??
          'No fue posible guardar la película.';
      }
    });
  }

  // Copia la película seleccionada al formulario y activa el modo edición
  edit(movie: Movie): void {
    this.error = '';
    this.success = '';
    this.editingId = movie.pkMovies;

    this.form = {
      name: movie.name,
      gender: movie.gender,

      // Convierte HH:mm:ss al formato HH:mm utilizado por el input
      duration: movie.duration.substring(0, 5),

      fkDirector: movie.fkDirector
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(movie: Movie): void {
    const confirmed = confirm(
      `¿Seguro que deseas eliminar “${movie.name}”?`
    );

    if (!confirmed) return;

    this.error = '';
    this.success = '';

    this.moviesService.delete(movie.pkMovies).subscribe({
      next: () => {
        this.success = 'La película se eliminó correctamente.';
        this.loadMovies();
      },
      error: () => {
        this.error = 'No fue posible eliminar la película.';
      }
    });
  }

  // Restablece el formulario y desactiva el modo edición
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

  // Permite que Angular identifique cada fila mediante su clave primaria
  trackByMovieId(_: number, movie: Movie): number {
    return movie.pkMovies;
  }

  // Permite buscar sin distinguir mayúsculas, acentos o espacios externos
  private normalize(value: string): string {
    return value
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // Valores iniciales utilizados al crear o limpiar el formulario
  private emptyForm(): SaveMovie {
    return {
      name: '',
      gender: '',
      duration: '01:30',
      fkDirector: 0
    };
  }
}