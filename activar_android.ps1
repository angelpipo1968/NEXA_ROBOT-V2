Set-Location "C:\nexa"
Write-Host "Iniciando proceso de sincronizacion en C:\nexa..."

# 1. Build del proyecto web
Write-Host "Ejecutando npm run build..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Fallo en npm run build"; exit }

# 2. Sincronizar con Android
Write-Host "Sincronizando con Capacitor (npx cap sync android)..."
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Error "Fallo en npx cap sync android"; exit }

# 3. Abrir Android Studio
Write-Host "Abriendo Android Studio..."
npx cap open android
