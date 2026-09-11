using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MoviesApi.Models;

[Table("Director")]
public class Director
{
    [Key]
    [Column("PKDirector")]
    public int PKDirector { get; set; }

    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Range(0, 130)]
    public int Age { get; set; }

    public bool Active { get; set; } = true;

    public ICollection<Movie> Movies { get; set; } = new List<Movie>();
}