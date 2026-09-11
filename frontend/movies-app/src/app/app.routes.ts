import { Routes } from '@angular/router';
import { Directors } from './components/directors/directors';
import { Movies } from './components/movies/movies';

export const routes: Routes = [
    { path: '', redirectTo: 'movies', pathMatch: 'full' },
    { path: 'movies', component: Movies },
    { path: 'directors', component: Directors },
    { path: '**', redirectTo: 'movies' }
];