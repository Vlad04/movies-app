using System.ComponentModel.DataAnnotations;

namespace MoviesApi.Dtos;

public record DirectorResponse(int PKDirector, string Name, int Age, bool Active);

public class SaveDirectorRequest
{
    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Range(0, 130)]
    public int Age { get; set; }

    public bool Active { get; set; } = true;
}