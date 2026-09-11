
// Representa una película recibida desde la API.
// Incluye su clave primaria y la información del director relacionado.
export interface Movie {
    pkMovies: number;
    name: string;
    gender: string;
    duration: string;
    fkDirector: number;
    directorName: string;
}
// Representa los datos enviados a la API para crear o actualizar una película.
// No incluye el ID porque la base de datos lo genera al crear el registro
export interface SaveMovie {
    name: string;
    gender: string;
    duration: string;
    fkDirector: number;
}