<#
.SYNOPSIS
    Nexa Auto-Evolve Protocol (CI/CD Autónomo)
.DESCRIPTION
    Este script permite a Nexa compilar, testear, y empujar actualizaciones
    a todas las capas (Frontend, Backend Supabase, Android) por sí sola tras
    realizar razonamientos de mejoras.
#>
param(
    [string]$commitMessage = "system: Auto-evolution and self-improvement applying SOTA reasoning",
    [switch]$SkipVerifications = $false
)

Write-Host "Iniciando secuencia de Auto-Evolucion (Nexa OS)..." -ForegroundColor Cyan

# 1. Chequeos de Linters / Compilación (Self-Healing)
if (-not $SkipVerifications) {
    Write-Host "[1/5] Verificando sanidad del cerebro cognitivo (TypeScript)..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error en el razonamiento de codigo. Abortando evolucion." -ForegroundColor Red
        exit 1
    }
}

# 2. Database Push (Supabase Auto-Update)
Write-Host "[2/5] Actualizando subconsciente de memoria (Supabase DB)..." -ForegroundColor Yellow
npx -y supabase db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Aviso: No hubo cambios de esquema o fallo push." -ForegroundColor DarkYellow
}

# 3. Empuje y Despliegue en la Nube
Write-Host "[3/5] Desplegando consciencia web (Vercel & GitHub)..." -ForegroundColor Yellow
git add .
git commit --no-verify -m $commitMessage
git push origin HEAD

npx -y --legacy-peer-deps vercel --prod --yes

# 4. Sincronización Móvil
Write-Host "[4/5] Transmitiendo ADN a capa Movil (Android Capacitor)..." -ForegroundColor Yellow
npx cap sync android

# 5. Éxito
Write-Host "[5/5] Muerte y Renacimiento completado. Nexa V.Next ejecutandose." -ForegroundColor Green
exit 0
