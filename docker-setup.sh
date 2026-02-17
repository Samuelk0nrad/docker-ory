#!/bin/bash

# Quick Docker Setup Script
# Builds and starts the full stack including Next.js in Docker

set -e

echo "🚀 Building and starting the full ORY stack with Next.js..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp example.env .env
    echo "📝 Please edit .env and add your secrets:"
    echo "   - Generate HYDRA_SYSTEM_SECRET: openssl rand -base64 32"
    echo "   - Generate KRATOS_SYSTEM_SECRET: openssl rand -base64 32"
    echo ""
    echo "After updating .env, run this script again."
    exit 1
fi

# Build and start all services
echo "📦 Building Docker images..."
docker compose build

echo ""
echo "🎬 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if services are running
echo ""
echo "🔍 Checking service status..."
docker compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Access points:"
echo "   - Next.js App:    http://localhost:3000"
echo "   - Mailslurper:    http://localhost:4436"
echo "   - PgAdmin:        http://localhost:5050"
echo "   - Hydra Public:   http://localhost:5444"
echo "   - Kratos Public:  http://localhost:5545"
echo ""
echo "🧪 Run './test-setup.sh' to verify the installation"
echo ""
echo "📊 View logs with: docker compose logs -f nextjs-app"
