-- Esquema requerido por la evaluación técnica.
-- En Hostinger la base ya se crea desde hPanel, por eso este archivo no ejecuta CREATE DATABASE.

CREATE TABLE IF NOT EXISTS Director (
    PKDirector INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Age INT NOT NULL,
    Active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT PK_Director PRIMARY KEY (PKDirector),
    CONSTRAINT CK_Director_Age CHECK (Age BETWEEN 0 AND 130)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Movies (
    PKMovies INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Gender VARCHAR(50) NOT NULL,
    Duration TIME NOT NULL,
    FKDirector INT NOT NULL,
    CONSTRAINT PK_Movies PRIMARY KEY (PKMovies),
    CONSTRAINT FK_Movies_Director
        FOREIGN KEY (FKDirector)
        REFERENCES Director (PKDirector)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    INDEX IX_Movies_FKDirector (FKDirector)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;