#!/bin/bash
set -e

echo "=========================================="
echo "Testing Ory Hydra Setup"
echo "=========================================="
echo ""

# Test 1: Check if all containers are running
echo "Test 1: Checking container status..."
RUNNING=$(docker ps --filter "name=hydra" --filter "status=running" --format "{{.Names}}")
if [[ "$RUNNING" == "hydra" ]]; then
    echo "✓ Hydra container is running"
else
    echo "✗ Hydra container is not running"
    exit 1
fi

RUNNING=$(docker ps --filter "name=kratos" --filter "status=running" --format "{{.Names}}")
if [[ "$RUNNING" == "kratos" ]]; then
    echo "✓ Kratos container is running"
else
    echo "✗ Kratos container is not running"
    exit 1
fi

RUNNING=$(docker ps --filter "name=postgres" --filter "status=running" --format "{{.Names}}")
if [[ "$RUNNING" == "postgres" ]]; then
    echo "✓ Postgres container is running"
else
    echo "✗ Postgres container is not running"
    exit 1
fi
echo ""

# Test 2: Check Hydra health
echo "Test 2: Checking Hydra health endpoints..."
HEALTH=$(curl -s http://localhost:5445/health/ready | grep -o '"status":"ok"')
if [[ "$HEALTH" == '"status":"ok"' ]]; then
    echo "✓ Hydra admin API is healthy"
else
    echo "✗ Hydra admin API is not healthy"
    exit 1
fi

HEALTH=$(curl -s http://localhost:5444/health/ready | grep -o '"status":"ok"')
if [[ "$HEALTH" == '"status":"ok"' ]]; then
    echo "✓ Hydra public API is healthy"
else
    echo "✗ Hydra public API is not healthy"
    exit 1
fi
echo ""

# Test 3: Check OAuth client exists
echo "Test 3: Verifying OAuth client creation..."
CLIENT=$(curl -s http://localhost:5445/clients/frontend-app)
CLIENT_ID=$(echo "$CLIENT" | grep -o '"client_id":"frontend-app"')
if [[ "$CLIENT_ID" == '"client_id":"frontend-app"' ]]; then
    echo "✓ OAuth client 'frontend-app' exists"
    echo ""
    echo "Client details:"
    echo "$CLIENT" | python3 -m json.tool 2>/dev/null || echo "$CLIENT"
else
    echo "✗ OAuth client 'frontend-app' not found"
    exit 1
fi
echo ""

# Test 4: Check OpenID configuration
echo "Test 4: Checking OpenID configuration..."
OIDC=$(curl -s http://localhost:5444/.well-known/openid-configuration)
ISSUER=$(echo "$OIDC" | grep -o '"issuer":"http://localhost:5444/"')
if [[ "$ISSUER" == '"issuer":"http://localhost:5444/"' ]]; then
    echo "✓ OpenID configuration is accessible"
else
    echo "✗ OpenID configuration is not accessible"
    exit 1
fi
echo ""

# Test 5: Check Kratos health
echo "Test 5: Checking Kratos health endpoints..."
HEALTH=$(curl -s http://localhost:5545/health/ready | grep -o '"status":"ok"')
if [[ "$HEALTH" == '"status":"ok"' ]]; then
    echo "✓ Kratos public API is healthy"
else
    echo "✗ Kratos public API is not healthy"
    exit 1
fi
echo ""

# Test 6: Check setup container logs
echo "Test 6: Checking setup container logs..."
LOGS=$(docker logs docker-ory-ory-hydra-setup-1 2>&1)
if echo "$LOGS" | grep -q "OAuth client created successfully\|Client frontend-app already exists"; then
    echo "✓ Setup container completed successfully"
else
    echo "✗ Setup container did not complete successfully"
    echo "Logs:"
    echo "$LOGS"
    exit 1
fi
echo ""

echo "=========================================="
echo "All tests passed! ✓"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Hydra is running and healthy"
echo "- Kratos is running and healthy"
echo "- OAuth client 'frontend-app' has been created automatically"
echo "- OpenID Connect configuration is accessible"
echo ""
echo "OAuth Client Details:"
echo "- Client ID: frontend-app"
echo "- Client Secret: dev-secret"
echo "- Grant Types: authorization_code, refresh_token"
echo "- Response Types: code"
echo "- Scopes: openid, profile, email, offline"
echo "- Redirect URIs:"
echo "  - http://localhost:3000/callback"
echo "  - http://localhost:3000/auth/callback"
echo ""
echo "Hydra URLs:"
echo "- Public API: http://localhost:5444"
echo "- Admin API: http://localhost:5445"
echo ""
echo "Kratos URLs:"
echo "- Public API: http://localhost:5545"
echo "- Admin API: http://localhost:5544"
