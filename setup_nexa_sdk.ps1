# Setup Nexa SDK for Windows
$binDir = "c:\nexa\bin"
if (-not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir
}

$url = "https://github.com/NexaAI/nexa-sdk/releases/latest/download/nexa-cli_windows_x86_64.exe"
$dest = "$binDir\nexa.exe"

Write-Host "Downloading Nexa SDK binary from GitHub..."
Invoke-WebRequest -Uri $url -OutFile $dest

if (Test-Path $dest) {
    Write-Host "Nexa SDK installed successfully at: $dest"
    & $dest --version
} else {
    Write-Error "Failed to download Nexa SDK binary."
}
