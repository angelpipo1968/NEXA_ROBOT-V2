$models = @('llama3.2:3b', 'llama3:latest', 'deepseek-r1:8b')
$prompt = "Responde en una línea: ¿Cuál es el sentido de la vida?"

foreach ($model in $models) {
    Write-Host "`n🧪 Probando $model..." -ForegroundColor Cyan
    $start = Get-Date
    
    $body = @{
        model = $model
        prompt = $prompt
        stream = $false
        options = @{ num_predict = 50 }
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
            -Method Post -Body $body -ContentType "application/json"
        
        $latency = ((Get-Date) - $start).TotalSeconds
        Write-Host "   Latencia: $($latency.ToString('0.00'))s" -ForegroundColor Green
        Write-Host "   Tokens: $($result.eval_count)" -ForegroundColor Gray
        Write-Host "   Respuesta: $($result.response.Substring(0, [Math]::Min(50, $result.response.Length)))..." -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
