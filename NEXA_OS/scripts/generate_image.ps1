param (
    [string]$Prompt = "cinematic futuristic city on Mars sunset 8K photorealistic"
)

$EncodedPrompt = [uri]::EscapeDataString($Prompt)
$Url = "https://www.bing.com/create?q=$EncodedPrompt"

Write-Host "🚀 Generando imagen en Bing Image Creator..." -ForegroundColor Cyan
Write-Host "🎯 Prompt: $Prompt" -ForegroundColor Gray

Start-Process $Url
