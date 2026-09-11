using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MoviesApi.Data;
using MoviesApi.Dtos;
using MoviesApi.Models;

namespace MoviesApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController(AppDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MovieResponse>>> GetAll()
    {
        var movies = await context.Movies
            .AsNoTracking()
            .OrderBy(m => m.Name)
            .Select(m => new MovieResponse(
                m.PKMovies,
                m.Name,
                m.Gender,
                m.Duration,
                m.FKDirector,
                m.Director.Name))
            .ToListAsync();

        return Ok(movies);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MovieResponse>> GetById(int id)
    {
        var movie = await context.Movies
            .AsNoTracking()
            .Where(m => m.PKMovies == id)
            .Select(m => new MovieResponse(
                m.PKMovies,
                m.Name,
                m.Gender,
                m.Duration,
                m.FKDirector,
                m.Director.Name))
            .FirstOrDefaultAsync();

        return movie is null ? NotFound() : Ok(movie);
    }

    [HttpPost]
    public async Task<ActionResult<MovieResponse>> Create(SaveMovieRequest request)
    {
        var director = await context.Directors.FindAsync(request.FKDirector);
        if (director is null)
            return BadRequest(new { message = "El director seleccionado no existe." });

        if (request.Duration <= TimeSpan.Zero)
            return BadRequest(new { message = "La duración debe ser mayor que cero." });

        var movie = new Movie
        {
            Name = request.Name.Trim(),
            Gender = request.Gender.Trim(),
            Duration = request.Duration,
            FKDirector = request.FKDirector
        };

        context.Movies.Add(movie);
        await context.SaveChangesAsync();

        var response = new MovieResponse(
            movie.PKMovies,
            movie.Name,
            movie.Gender,
            movie.Duration,
            movie.FKDirector,
            director.Name);

        return CreatedAtAction(nameof(GetById), new { id = movie.PKMovies }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SaveMovieRequest request)
    {
        var movie = await context.Movies.FindAsync(id);
        if (movie is null) return NotFound();

        var directorExists = await context.Directors.AnyAsync(
            d => d.PKDirector == request.FKDirector);

        if (!directorExists)
            return BadRequest(new { message = "El director seleccionado no existe." });

        if (request.Duration <= TimeSpan.Zero)
            return BadRequest(new { message = "La duración debe ser mayor que cero." });

        movie.Name = request.Name.Trim();
        movie.Gender = request.Gender.Trim();
        movie.Duration = request.Duration;
        movie.FKDirector = request.FKDirector;
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var movie = await context.Movies.FindAsync(id);
        if (movie is null) return NotFound();

        context.Movies.Remove(movie);
        await context.SaveChangesAsync();
        return NoContent();
    }
}