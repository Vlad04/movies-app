using System.ComponentModel.DataAnnotations;

namespace MoviesApi.Dtos;

public record MovieResponse(
    int PKMovies,
    string Name,
    string Gender,
    TimeSpan Duration,
    int FKDirector,
    string DirectorName
);

public class SaveMovieRequest
{
    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Gender { get; set; } = string.Empty;

    [Required]
    public TimeSpan Duration { get; set; }

    [Range(1, int.MaxValue)]
    public int FKDirector { get; set; }
}