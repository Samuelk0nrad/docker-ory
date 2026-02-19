#!/bin/bash

# Quick Docker Setup Script
# Builds and starts the full stack including Next.js in Docker

set -e

echo "🚀 Building and starting the full ORY stack with Next.js..."
echo ""

# Check if root .env exists (Hydra/Kratos secrets)
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

# Check if Next.js .env exists
if [ ! -f example-next-app/.env ]; then
    echo "⚠️  example-next-app/.env not found. Creating from example..."
    cp example-next-app/example.env example-next-app/.env
    echo "📝 Please review example-next-app/.env and update if needed."
    echo ""
fi

# Check if TLS certificates exist
if [ ! -f proxy-config/cert/auth.moorph.local.pem ] || [ ! -f proxy-config/cert/auth.moorph.local-key.pem ]; then
    echo "❌ TLS certificates not found in proxy-config/cert/"
    echo "   Please generate them first:"
    echo "   1. Install mkcert: https://github.com/FiloSottile/mkcert#installation"
    echo "   2. Run: mkcert -install"
    echo "   3. Run: cd proxy-config/cert && mkcert auth.moorph.local"
    echo ""
    echo "   See proxy-config/cert/README.md for full instructions."
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
echo "📍 Access points (via proxy — make sure auth.moorph.local is in /etc/hosts):"
echo "   - Auth App (HTTPS): https://auth.moorph.local"
echo ""
echo "📍 Direct service access:"
echo "   - Mailslurper:    http://localhost:4436"
echo "   - PgAdmin:        http://localhost:5050"
echo "   - Hydra Public:   http://localhost:5444"
echo "   - Kratos Public:  http://localhost:5545"
echo ""
echo "⚠️  Add to /etc/hosts if not already present:"
echo "   127.0.0.1  auth.moorph.local"
echo ""
echo "🔐 SSL certificates for the proxy must exist in proxy-config/cert/."
echo "   See proxy-config/cert/README.md for generation instructions (requires mkcert)."
echo ""
echo "🧪 Run './test-setup.sh' to verify the installation"
echo ""
echo "📊 View logs with: docker compose logs -f nextjs-app"
