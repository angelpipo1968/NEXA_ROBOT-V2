Write-Host "Resetting Nexa AI services (removing volumes)..."
docker-compose -f infra/docker-compose.yml down -v
Write-Host "Services reset!"
