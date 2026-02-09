#!/bin/bash
echo "Resetting Nexa AI services (removing volumes)..."
docker-compose -f infra/docker-compose.yml down -v
echo "Services reset!"
