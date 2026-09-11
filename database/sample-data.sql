INSERT INTO Director (Name, Age, Active)
VALUES
    ('Christopher Nolan', 56, TRUE),
    ('Greta Gerwig', 43, TRUE);

INSERT INTO Movies (Name, Gender, Duration, FKDirector)
VALUES
    ('Inception', 'Science Fiction', '02:28:00', 1),
    ('Barbie', 'Comedy', '01:54:00', 2);