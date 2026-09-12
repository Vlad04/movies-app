[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

# ==================================================
# CONFIGURACIÓN MYSQL
# Completar estos valores antes de compartir el archivo.
# ==================================================
$databaseHost = 'srv1610.hstgr.io'
$databasePort = '3306'
$databaseName = 'u327351184_personal_hub'
$databaseUser = 'u327351184_personal'
$databasePassword = 'Vlad17201325!'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDirectory = Join-Path $projectRoot 'backend\MoviesApi'
$backendProject = Join-Path $backendDirectory 'MoviesApi.csproj'
$frontendDirectory = Join-Path $projectRoot 'frontend\movies-app'

function Test-RequiredCommand {
    param([Parameter(Mandatory)][string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "No se encontró '$Name'. Instala esta herramienta y vuelve a ejecutar el script."
    }
}

function Test-Configuration {
    $values = @($databaseHost, $databaseName, $databaseUser, $databasePassword)
    $pendingValue = $values | Where-Object { $_ -like 'REEMPLAZAR_*' }

    if ($pendingValue) {
        throw 'Debes completar la configuración MySQL al inicio de run-local.ps1 antes de compartirlo.'
    }
}

Write-Host 'Iniciando Movies Manager...' -ForegroundColor Cyan

Test-RequiredCommand 'dotnet'
Test-RequiredCommand 'node'
Test-RequiredCommand 'npm'
Test-Configuration

if (-not (Test-Path -LiteralPath $backendProject)) {
    throw "No se encontró el backend en: $backendProject"
}

if (-not (Test-Path -LiteralPath $frontendDirectory)) {
    throw "No se encontró el frontend en: $frontendDirectory"
}

# Registra automáticamente la conexión para el backend local.
$connectionString = "Server=$databaseHost;Port=$databasePort;Database=$databaseName;User=$databaseUser;Password=$databasePassword;SslMode=Preferred;"

Write-Host 'Configurando la conexión MySQL...' -ForegroundColor Cyan
& dotnet user-secrets set --project $backendProject 'ConnectionStrings:DefaultConnection' $connectionString | Out-Null

if ($LASTEXITCODE -ne 0) {
    throw 'No fue posible configurar la conexión MySQL.'
}

# Retira la cadena completa de la variable cuando deja de ser necesaria.
$connectionString = $null

Write-Host 'Restaurando dependencias del backend...' -ForegroundColor Cyan
& dotnet restore $backendProject

if ($LASTEXITCODE -ne 0) {
    throw 'No fue posible restaurar las dependencias del backend.'
}

$nodeModules = Join-Path $frontendDirectory 'node_modules'

if (-not (Test-Path -LiteralPath $nodeModules)) {
    Write-Host 'Instalando dependencias del frontend...' -ForegroundColor Cyan
    Push-Location $frontendDirectory

    try {
        & npm install

        if ($LASTEXITCODE -ne 0) {
            throw 'No fue posible instalar las dependencias de Angular.'
        }
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host 'Las dependencias del frontend ya están instaladas.' -ForegroundColor Green
}

# Usa PowerShell 7 cuando está disponible; de lo contrario utiliza Windows PowerShell.
$shellCommand = Get-Command 'pwsh' -ErrorAction SilentlyContinue

if (-not $shellCommand) {
    $shellCommand = Get-Command 'powershell' -ErrorAction Stop
}

$shellPath = $shellCommand.Source
$escapedBackend = $backendDirectory.Replace("'", "''")
$escapedFrontend = $frontendDirectory.Replace("'", "''")

$backendCommand = "Set-Location -LiteralPath '$escapedBackend'; `$Host.UI.RawUI.WindowTitle = 'Movies API'; dotnet run"
$frontendCommand = "Set-Location -LiteralPath '$escapedFrontend'; `$Host.UI.RawUI.WindowTitle = 'Movies Angular'; npm start"

Write-Host 'Abriendo la API...' -ForegroundColor Cyan
Start-Process -FilePath $shellPath -ArgumentList @('-NoExit', '-Command', $backendCommand)

Start-Sleep -Seconds 3

Write-Host 'Abriendo Angular...' -ForegroundColor Cyan
Start-Process -FilePath $shellPath -ArgumentList @('-NoExit', '-Command', $frontendCommand)

# Espera brevemente a que Angular responda antes de abrir el navegador.
Write-Host 'Esperando a que la aplicación esté disponible...' -ForegroundColor Cyan
$applicationUrl = 'http://localhost:4200'
$applicationReady = $false

for ($attempt = 1; $attempt -le 60; $attempt++) {
    try {
        Invoke-WebRequest -Uri $applicationUrl -UseBasicParsing -TimeoutSec 2 | Out-Null
        $applicationReady = $true
        break
    }
    catch {
        Start-Sleep -Seconds 1
    }
}

Start-Process $applicationUrl

Write-Host ''
if ($applicationReady) {
    Write-Host 'Movies Manager está disponible.' -ForegroundColor Green
}
else {
    Write-Host 'El navegador se abrió, pero Angular todavía puede estar compilando.' -ForegroundColor Yellow
}

Write-Host 'Frontend: http://localhost:4200'
Write-Host 'API:      http://localhost:5090'
Write-Host 'Swagger:  http://localhost:5090/swagger'
Write-Host ''
Write-Host 'Para detener el proyecto, presiona Ctrl + C en las dos terminales abiertas.'