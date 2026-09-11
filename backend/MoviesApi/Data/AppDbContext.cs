using Microsoft.EntityFrameworkCore;
using MoviesApi.Models;

namespace MoviesApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Director> Directors => Set<Director>();
    public DbSet<Movie> Movies => Set<Movie>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Director>()
            .HasMany(d => d.Movies)
            .WithOne(m => m.Director)
            .HasForeignKey(m => m.FKDirector)
            .OnDelete(DeleteBehavior.Restrict);
    }
}