# Movies Manager — CRUD técnico

Aplicación web para administrar películas y directores mediante un CRUD completo. La solución utiliza Angular para la interfaz, ASP.NET Core Web API para las reglas y MySQL para persistencia.

## Demostración pública

La URL se agregará aquí después del despliegue:

```text
https://TU-SERVICIO.onrender.com
```

## Funcionalidad

- Crear, consultar, actualizar y eliminar películas.
- Crear, consultar, actualizar y eliminar directores.
- Relación de uno a muchos entre director y películas.
- Restricción al intentar eliminar un director con películas relacionadas.
- Búsqueda de películas por nombre o director.
- Filtros de películas por género y director.
- Búsqueda de directores por nombre y filtro por estado.
- Diseño responsivo para computadora, tableta y teléfono.
- Swagger disponible en `/swagger`.
- Endpoint de estado en `/health`.

## Arquitectura

```text
Angular -> ASP.NET Core Web API -> MySQL
```

En producción, ASP.NET Core sirve también los archivos compilados de Angular. De esta forma, la interfaz y la API comparten una sola URL y las llamadas se realizan mediante `/api`.

## Tecnologías

- Angular 20
- TypeScript 5.9
- ASP.NET Core 8
- Entity Framework Core 8
- Pomelo.EntityFrameworkCore.MySql 8.0.3
- MySQL
- Docker

## Estructura

```text
movies-crud-test/
├── backend/MoviesApi/        # API REST en C#
├── database/                 # Scripts SQL
├── frontend/movies-app/      # Interfaz Angular
├── Dockerfile                # Compilación unificada para producción
├── .dockerignore
├── .gitignore
└── README.md
```

## Base de datos

1. Crear una base MySQL.
2. Ejecutar `database/schema.sql`.
3. Opcionalmente ejecutar `database/sample-data.sql`.

### Relación

Un director puede tener varias películas. Cada película debe tener exactamente un director mediante `Movies.FKDirector`.

| Tabla | Clave primaria | Relación |
|---|---|---|
| `Director` | `PKDirector` | Uno a muchos con `Movies` |
| `Movies` | `PKMovies` | `FKDirector` referencia a `Director` |

El campo `Gender` conserva el nombre solicitado en el diagrama original, aunque semánticamente representa el género de la película.

## Ejecución local

### Requisitos

- .NET SDK 8
- Node.js 22.12 o superior
- npm
- Una base MySQL accesible

### 1. Configurar la conexión

Desde `backend/MoviesApi`:

```powershell
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=HOST;Port=3306;Database=DATABASE;User=USER;Password=PASSWORD;SslMode=Preferred;"
```

Las credenciales no deben guardarse en archivos versionados.

### 2. Ejecutar la API

```powershell
cd backend/MoviesApi
dotnet restore
dotnet run
```

La API se ejecuta en `http://localhost:5090`.

### 3. Ejecutar Angular

En otra terminal:

```powershell
cd frontend/movies-app
npm install
npm start
```

Abrir `http://localhost:4200`. El proxy de Angular dirige las solicitudes `/api` hacia el backend local.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/directors` | Listar directores |
| GET | `/api/directors/{id}` | Consultar director |
| POST | `/api/directors` | Crear director |
| PUT | `/api/directors/{id}` | Actualizar director |
| DELETE | `/api/directors/{id}` | Eliminar director |
| GET | `/api/movies` | Listar películas |
| GET | `/api/movies/{id}` | Consultar película |
| POST | `/api/movies` | Crear película |
| PUT | `/api/movies/{id}` | Actualizar película |
| DELETE | `/api/movies/{id}` | Eliminar película |

## Compilación

Frontend:

```powershell
cd frontend/movies-app
npm ci
npm run build
```

Backend:

```powershell
cd backend/MoviesApi
dotnet restore
dotnet build --configuration Release
```

Contenedor completo:

```powershell
docker build -t movies-crud-test .
docker run --rm -p 8080:10000 -e "ConnectionStrings__DefaultConnection=Server=HOST;Port=3306;Database=DATABASE;User=USER;Password=PASSWORD;SslMode=Preferred;" movies-crud-test
```

Abrir `http://localhost:8080`.

## Despliegue público en Render

El `Dockerfile` compila Angular, publica ASP.NET Core y coloca Angular en `wwwroot`. Render puede construirlo directamente desde GitHub.

1. Subir el repositorio a GitHub.
2. Entrar a `https://dashboard.render.com`.
3. Seleccionar **New + -> Web Service**.
4. Conectar el repositorio de GitHub.
5. En **Language**, seleccionar **Docker**.
6. Confirmar que **Dockerfile Path** sea `./Dockerfile`.
7. Seleccionar una región.
8. Elegir el plan apropiado para la evaluación.
9. Agregar la variable de entorno:

```text
Key: ConnectionStrings__DefaultConnection
Value: Server=HOST;Port=3306;Database=DATABASE;User=USER;Password=PASSWORD;SslMode=Preferred;
```

10. No guardar esa variable en GitHub ni escribirla dentro del Dockerfile.
11. Crear el servicio y esperar a que el despliegue termine.
12. En el servicio, abrir **Connect -> Outbound** y revisar las IP de salida.
13. Autorizar esas IP en **Hostinger -> Bases de datos -> MySQL remoto**. Si hPanel no admite los rangos proporcionados, habilitar **Any Host** solamente para esta base de evaluación y mantener un usuario exclusivo con contraseña fuerte. Revocar ese acceso al finalizar la evaluación.
14. En Render, usar **Manual Deploy -> Deploy latest commit** para reintentar después de autorizar MySQL.
15. Abrir la URL `https://NOMBRE.onrender.com`.
16. Comprobar `/health`, `/swagger`, `/movies` y `/directors`.
17. Colocar la URL real en la sección **Demostración pública** de este README.

## Decisiones técnicas

- Se utilizan DTOs para separar las entidades de persistencia del contrato HTTP.
- La clave foránea usa eliminación restringida para proteger la integridad de los datos.
- El frontend filtra en memoria porque el volumen esperado para esta evaluación es pequeño.
- La URL relativa `/api` permite el mismo código en desarrollo y producción.
- La cadena de conexión se inyecta con User Secrets localmente y con una variable de entorno en producción.
- El contenedor utiliza compilación multi-stage para no incluir Node.js ni el SDK de .NET en la imagen final.

## Pruebas manuales sugeridas

1. Crear un director.
2. Editar su nombre, edad y estado.
3. Crear una película relacionada con ese director.
4. Buscarla por nombre.
5. Filtrarla por género y director.
6. Intentar eliminar el director mientras tiene una película; debe devolver conflicto.
7. Eliminar la película.
8. Eliminar el director.
9. Recargar la página y comprobar persistencia.

## Autor

Vladimir Rodríguez Bahena
