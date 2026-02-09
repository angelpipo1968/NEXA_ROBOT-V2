Write-Host "Starting Nexa AI services..."
docker-compose -f infra/docker-compose.yml up -d
Write-Host "Services started!"
