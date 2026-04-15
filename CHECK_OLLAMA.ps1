# Script para verificar y arrancar Ollama
Write-Host "🔍 Verificando estado de Ollama..." -ForegroundColor Cyan

# Verificar si Ollama responde
$urls = @(
    'http://localhost:11434/api/tags',
    'http://127.0.0.1:11434/api/tags',
    'http://[::1]:11434/api/tags',
    'http://localhost:11434/api/models',
    'http://127.0.0.1:11434/api/models'
)

$ok = $false
foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Ollama está ACTIVO en $url" -ForegroundColor Green
            $ok = $true
            break
        }
    } catch {
        continue
    }
}

if ($ok) {
    $models = $response.Content | ConvertFrom-Json
    Write-Host "`n📦 Modelos disponibles:" -ForegroundColor Yellow
    $models.models | ForEach-Object { Write-Host "  - $($_.name)" -ForegroundColor Green }
    exit 0
}

Write-Host "❌ Ollama NO está respondiendo" -ForegroundColor Red

Write-Host "`n⚙️  Intentando iniciar Ollama..." -ForegroundColor Yellow

# Intentar iniciar Ollama si está instalado
$ollamaPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe"
if (Test-Path $ollamaPath) {
    Write-Host "📍 Encontrado Ollama en: $ollamaPath" -ForegroundColor Green
    Write-Host "🚀 Iniciando Ollama..." -ForegroundColor Cyan
    Start-Process -FilePath $ollamaPath -ArgumentList "serve" -NoNewWindow -PassThru
    exit 0
}

# Si no está en la ruta esperada, intenta con comando directo
Write-Host "📍 Intentando comando 'ollama serve'..." -ForegroundColor Cyan
try {
    & ollama serve
    if ($LASTEXITCODE -eq 0) {
        exit 0
    }
} catch {
    Write-Host "❌ No se pudo ejecutar 'ollama serve' directamente." -ForegroundColor Red
}

# Si nada funciona, dar instrucciones
Write-Host "`n❌ NO SE PUDO INICIAR OLLAMA" -ForegroundColor Red
Write-Host "`n📖 Instrucciones para instalar/ejecutar Ollama:" -ForegroundColor Yellow
Write-Host "1. Descargar desde: https://ollama.ai/download"
Write-Host "2. Instalar Ollama (Windows)"
Write-Host "3. Abrir una terminal y ejecutar: ollama serve"
Write-Host "4. En otra terminal, descargar un modelo:"
Write-Host "   ollama pull deepseek-r1:8b"
Write-Host ""
Write-Host "O si ya tienes Ollama instalado:"
Write-Host "- Abre una terminal PowerShell nueva y ejecuta: ollama serve"
Write-Host "- Déjala corriendo mientras usas Nexa"
Write-Host ""
Write-Host "Si Ollama está en otra máquina:"
Write-Host "- Configura la variable en localStorage: NEXA_OLLAMA_URL=http://IP:11434"
exit 1
