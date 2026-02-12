# NEXA VISION - CLI Alias Setup Script
# Run this to set up a quick-command for the current session

function nexa-vision {
    param(
        [Parameter(Mandatory = $false)]
        [string]$prompt = "cyberpunk futuristic city Mars sunset 8K"
    )
    python "c:\nexa\NEXA_OS\modules\image_gen\nexa_vision.py" $prompt
}

Write-Host "✅ NEXA-VISION CLI Command Ready." -ForegroundColor Cyan
Write-Host "Usage: nexa-vision 'your prompt here'" -ForegroundColor Gray
