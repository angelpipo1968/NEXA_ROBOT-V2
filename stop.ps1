Write-Host "Stopping Nexa AI services..."
docker-compose -f infra/docker-compose.yml down
Write-Host "Services stopped!"
