
Write-Host "STARTING SYSTEM AUTO-UPDATE..." -ForegroundColor Cyan

Set-Location "c:\nexa"

if (-not (Test-Path .env)) { Write-Warning "NO .ENV FILE FOUND. Vercel/Supabase config might be missing." }

# 1. GitHub
Write-Host "1. Syncing with GitHub..." -ForegroundColor Yellow
$branch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($branch)) { $branch = "prod-v7" }
Write-Host "Current Branch: $branch"

git add .
git commit -m "Auto-Update: System Sync $(Get-Date -Format 'yyyy-MM-dd HH:mm')" --allow-empty --no-verify
git push origin $branch
if ($?) { Write-Host "GITHUB SYNCED." -ForegroundColor Green } else { Write-Host "GITHUB SYNC FAILED." -ForegroundColor Red }

# 2. Vercel
Write-Host "2. Deploying to Vercel..." -ForegroundColor Yellow
cmd /c "npx -y --legacy-peer-deps vercel --prod --yes"
if ($?) { Write-Host "VERCEL DEPLOYED." -ForegroundColor Green } else { Write-Host "VERCEL DEPLOY FAILED." -ForegroundColor Red }

# 3. Supabase
Write-Host "3. Syncing Supabase..." -ForegroundColor Yellow
Write-Host "Pushing DB migrations (if authenticated)..."
cmd /c "npx -y supabase db push"
if ($?) { Write-Host "SUPABASE SYNCED." -ForegroundColor Green } else { Write-Host "SUPABASE SYNC SKIPPED (Check CLI Auth)." -ForegroundColor Yellow }

Write-Host "SYSTEM AUTO-UPDATE COMPLETE." -ForegroundColor Cyan
