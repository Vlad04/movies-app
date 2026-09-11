using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MoviesApi.Models;

[Table("Movies")]
public class Movie
{
    [Key]
    [Column("PKMovies")]
    public int PKMovies { get; set; }

    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(50)]
    public string Gender { get; set; } = string.Empty;

    [Required]
    public TimeSpan Duration { get; set; }

    public int FKDirector { get; set; }

    [ForeignKey(nameof(FKDirector))]
    public Director Director { get; set; } = null!;
}