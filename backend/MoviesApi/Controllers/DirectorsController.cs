using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MoviesApi.Data;
using MoviesApi.Dtos;
using MoviesApi.Models;

namespace MoviesApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DirectorsController(AppDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DirectorResponse>>> GetAll()
    {
        var directors = await context.Directors
            .AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DirectorResponse(d.PKDirector, d.Name, d.Age, d.Active))
            .ToListAsync();

        return Ok(directors);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DirectorResponse>> GetById(int id)
    {
        var director = await context.Directors
            .AsNoTracking()
            .Where(d => d.PKDirector == id)
            .Select(d => new DirectorResponse(d.PKDirector, d.Name, d.Age, d.Active))
            .FirstOrDefaultAsync();

        return director is null ? NotFound() : Ok(director);
    }

    [HttpPost]
    public async Task<ActionResult<DirectorResponse>> Create(SaveDirectorRequest request)
    {
        var director = new Director
        {
            Name = request.Name.Trim(),
            Age = request.Age,
            Active = request.Active
        };

        context.Directors.Add(director);
        await context.SaveChangesAsync();

        var response = new DirectorResponse(
            director.PKDirector, director.Name, director.Age, director.Active);

        return CreatedAtAction(nameof(GetById), new { id = director.PKDirector }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SaveDirectorRequest request)
    {
        var director = await context.Directors.FindAsync(id);
        if (director is null) return NotFound();

        director.Name = request.Name.Trim();
        director.Age = request.Age;
        director.Active = request.Active;
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var director = await context.Directors.FindAsync(id);
        if (director is null) return NotFound();

        var hasMovies = await context.Movies.AnyAsync(m => m.FKDirector == id);
        if (hasMovies)
        {
            return Conflict(new
            {
                message = "No se puede eliminar el director porque tiene películas registradas."
            });
        }

        context.Directors.Remove(director);
        await context.SaveChangesAsync();
        return NoContent();
    }
}