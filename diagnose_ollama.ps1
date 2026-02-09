Write-Host "=== Ollama Diagnostics ===" -ForegroundColor Cyan

# 1. Check if Ollama process exists
Write-Host "`n[1] Checking Ollama process..." -ForegroundColor Yellow
$proc = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
if ($proc) {
    Write-Host "   ✅ Ollama is running (PID: $($proc.Id))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Ollama is NOT running" -ForegroundColor Red
}

# 2. Test basic connectivity to port 11434
Write-Host "`n[2] Testing port 11434..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName localhost -Port 11434 -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host "   ✅ Port 11434 is open" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 11434 is closed" -ForegroundColor Red
}

# 3. Check for installed models
Write-Host "`n[3] Checking installed models..." -ForegroundColor Yellow
try {
    $models = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -ErrorAction Stop
    Write-Host "   ✅ Available models:" -ForegroundColor Green
    $models.models | ForEach-Object { Write-Host "      - $($_.name)" }
} catch {
    Write-Host "   ❌ Could not fetch models: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Simple generate test
Write-Host "`n[4] Testing model response..." -ForegroundColor Yellow
try {
    $body = @{model="llama3.2:3b"; prompt="Say OK"; stream=$false} | ConvertTo-Json
    $test = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Test successful: $($test.response)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== End Diagnostics ===" -ForegroundColor Cyan
