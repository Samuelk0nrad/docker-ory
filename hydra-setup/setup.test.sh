#!/bin/sh

# Wait for Hydra to be ready
echo "Waiting for Hydra to be ready..."
sleep 5

# Create OAuth2 client for testing
echo "Creating test OAuth2 client..."
curl -X POST http://ory-hydra-test:4445/admin/clients \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "test-client-id",
    "client_name": "Test Client",
    "client_secret": "test-client-secret",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "redirect_uris": ["http://localhost:3001/auth/callback"],
    "scope": "openid offline_access email profile",
    "token_endpoint_auth_method": "client_secret_post"
  }'

echo ""
echo "Test OAuth2 client created successfully"
