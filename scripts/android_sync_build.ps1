
# Aurora Deployment Protocol: Android APK Generator & Notification Hub
# Automates the full cycle: Build -> Sync -> APK Compile -> Send Notification

Write-Host "INITIALIZING AURORA ANDROID DEPLOYMENT..." -ForegroundColor Cyan

$ROOT_DIR = "c:\nexa"
$ANDROID_DIR = "c:\nexa\android"
Set-Location $ROOT_DIR

# 1. Web Build
Write-Host "Step 1: Building optimized web bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Web build failed. Aurora cannot proceed."
    exit $LASTEXITCODE
}

# 2. Capacitor Sync
Write-Host "Step 2: Syncing assets with Capacitor Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Capacitor sync failed."
    exit $LASTEXITCODE
}

# 3. Gradle Assemble
Write-Host "Step 3: Compiling APK (Gradle)..." -ForegroundColor Yellow
Set-Location $ANDROID_DIR
cmd /c "gradlew.bat assembleDebug"
if ($LASTEXITCODE -ne 0) { 
    Write-Error "APK Compilation failed. Check Android Studio logs."
    Set-Location $ROOT_DIR
    exit $LASTEXITCODE
}

# 4. Final Verification & Notification
$APK_PATH = "$ANDROID_DIR\app\build\outputs\apk\debug\app-universal-debug.apk"
if (Test-Path $APK_PATH) {
    Set-Location $ROOT_DIR
    
    # Send Notification via Supabase (or log to database for user retrieval)
    Write-Host "Step 4: Registrying build in Aurora Cloud..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $msg = "Aurora Build Successful: $timestamp. APK ready at $APK_PATH"
    
    # In a real scenario, we'd use a Twilio/SendGrid/WhatsApp API here.
    # For now, we simulate the 'System Alert' which Aurora will read to the user.
    $notifyFile = "$ROOT_DIR\last_build_alert.txt"
    $msg | Out-File $notifyFile
    
    Write-Host "`n"
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "AURORA PROTOCOL: ANDROID DEPLOYED" -ForegroundColor Green
    Write-Host "APK Location: $APK_PATH" -ForegroundColor White
    Write-Host "Status: Notification Sent to Aurora HUD" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Green
}
else {
    Write-Warning "APK build finished but file not found at expected path."
}
