import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Director, SaveDirector } from '../../models/director';
import { DirectorsService } from '../../services/directors';

// Componente que permite administrar a los directores: crear, editar, eliminar y consultar directores
@Component({
  selector: 'app-directors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './directors.html',
  styleUrl: './directors.css'
})
export class Directors implements OnInit {
  private readonly service = inject(DirectorsService);

  // Estado de inicio de la vista y del formulario
  directors: Director[] = [];
  form: SaveDirector = this.emptyForm();
  editingId: number | null = null;

  // Indicadores y mensajes para informar al usuario
  loading = false;
  saving = false;
  error = '';
  success = '';

  // Valores utilizados para filtrar la tabla
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  // Total de directores activos - tarjeta de resumen
  get activeCount(): number {
    return this.directors.filter(director => director.active).length;
  }

  // Filtra por nombre y estado sin modificar la lista original
  get filteredDirectors(): Director[] {
    const term = this.normalize(this.searchTerm);

    return this.directors.filter(director => {
      const matchesText =
        !term || this.normalize(director.name).includes(term);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && director.active) ||
        (this.statusFilter === 'inactive' && !director.active);

      return matchesText && matchesStatus;
    });
  }

  // Carga los registros al abrir el componente
  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.service.getAll().subscribe({
      next: data => {
        this.directors = data;
        this.loading = false;
      },
      error: () => {
        this.error =
          'No fue posible cargar los directores. Verifica que la API esté disponible.';
        this.loading = false;
      }
    });
  }

  // Utiliza el mismo formulario para crear y actualizar registros
  save(): void {
    this.error = '';
    this.success = '';
    this.saving = true;

    const wasEditing = this.editingId !== null;

    const request: Observable<unknown> = wasEditing
      ? this.service.update(this.editingId!, this.form)
      : this.service.create(this.form);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.success = wasEditing
          ? 'El director se actualizó correctamente.'
          : 'El director se agregó correctamente.';

        this.cancel(false);
        this.load();
      },
      error: () => {
        this.saving = false;
        this.error = 'No fue posible guardar el director.';
      }
    });
  }

  // Copia los datos seleccionados al formulario y activa el modo edición
  edit(director: Director): void {
    this.error = '';
    this.success = '';
    this.editingId = director.pkDirector;

    this.form = {
      name: director.name,
      age: director.age,
      active: director.active
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(director: Director): void {
    const confirmed = confirm(
      `¿Seguro que deseas eliminar a “${director.name}”?`
    );

    if (!confirmed) return;

    this.error = '';
    this.success = '';

    this.service.delete(director.pkDirector).subscribe({
      next: () => {
        this.success = 'El director se eliminó correctamente.';
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        // La API puede rechazar la eliminación si tiene películas relacionadas
        this.error =
          err.error?.message ?? 'No fue posible eliminar el director.';
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
    this.statusFilter = 'all';
  }

  // Ayuda a Angular a identificar las filas por su clave primaria
  trackByDirectorId(_: number, director: Director): number {
    return director.pkDirector;
  }

  // Normaliza el texto para buscar sin distinguir mayúsculas o acentos
  private normalize(value: string): string {
    return value
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private emptyForm(): SaveDirector {
    return {
      name: '',
      age: 18,
      active: true
    };
  }
}