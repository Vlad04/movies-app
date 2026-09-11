// Representa un director recibido desde la API.
// Incluye la clave primaria generada por la base de datos.
export interface Director {
    pkDirector: number;
    name: string;
    age: number;
    active: boolean;
}

// Representa los datos enviados a la API para crear o actualizar un director.
// No incluye el ID porque la base de datos lo genera al crear el registro
export interface SaveDirector {
    name: string;
    age: number;
    active: boolean;
}