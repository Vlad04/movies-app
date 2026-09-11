FROM node:22-alpine AS frontend-build
WORKDIR /source/frontend
COPY frontend/movies-app/package.json frontend/movies-app/package-lock.json ./
RUN npm ci
COPY frontend/movies-app/ ./
RUN npm run build -- --configuration production

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /source
COPY backend/MoviesApi/MoviesApi.csproj backend/MoviesApi/
RUN dotnet restore backend/MoviesApi/MoviesApi.csproj
COPY backend/MoviesApi/ backend/MoviesApi/
RUN dotnet publish backend/MoviesApi/MoviesApi.csproj -c Release -o /app/publish --no-restore
COPY --from=frontend-build /source/frontend/dist/movies-app/browser /app/publish/wwwroot

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=backend-build /app/publish .
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "MoviesApi.dll"]
