#!/bin/bash
echo "Starting Nexa AI services..."
docker-compose -f infra/docker-compose.yml up -d
echo "Services started!"
