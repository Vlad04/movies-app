export interface Movie {
    pkMovies: number;
    name: string;
    gender: string;
    duration: string;
    fkDirector: number;
    directorName: string;
}

export interface SaveMovie {
    name: string;
    gender: string;
    duration: string;
    fkDirector: number;
}