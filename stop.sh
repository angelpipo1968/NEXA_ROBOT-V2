#!/bin/bash
echo "Stopping Nexa AI services..."
docker-compose -f infra/docker-compose.yml down
echo "Services stopped!"
