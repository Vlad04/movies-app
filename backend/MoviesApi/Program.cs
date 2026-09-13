using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using MoviesApi.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "No se configuró ConnectionStrings:DefaultConnection. " +
        "Usa User Secrets localmente o ConnectionStrings__DefaultConnection en producción."
    );

// Se especifica MySQL 8 para evitar una conexión adicional con AutoDetect.
var serverVersion = new MySqlServerVersion(new Version(8, 0, 0));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        serverVersion,
        mySqlOptions =>
        {
            // Reintenta temporalmente cuando ocurre un error de conexión.
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null
            );
        }
    )
);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto;

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

// Render puede comprobar el servicio sin abrir una conexión a MySQL.
app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "ok",
        service = "MoviesApi",
        utc = DateTime.UtcNow
    });
});

app.MapFallbackToFile("index.html");

app.Run();