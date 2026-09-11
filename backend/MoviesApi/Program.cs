using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using MoviesApi.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "No se configuró ConnectionStrings:DefaultConnection. Usa User Secrets localmente o ConnectionStrings__DefaultConnection en producción.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.MapGet("/health", async (AppDbContext database) =>
{
    var databaseAvailable = await database.Database.CanConnectAsync();
    return Results.Ok(new
    {
        status = databaseAvailable ? "ok" : "database-unavailable",
        database = databaseAvailable,
        utc = DateTime.UtcNow
    });
});

app.MapFallbackToFile("index.html");
app.Run();
