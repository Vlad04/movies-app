-- Datos iniciales de demostración
INSERT INTO Director (Name, Age, Active)
VALUES
    ('Anthony Russo', 56, TRUE),
    ('Chris Columbus', 68, TRUE);

INSERT INTO Movies (Name, Gender, Duration, FKDirector)
VALUES
    (
        'Los Vengadores: Infinity War',
        'Acción y ciencia ficción',
        '02:29:00',
        1
    ),
    (
        'Harry Potter y la piedra filosofal',
        'Fantasía',
        '02:32:00',
        2
    );