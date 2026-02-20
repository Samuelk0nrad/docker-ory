#!/bin/sh
set -e

# WARNING: This script uses development secrets that MUST be changed before production deployment!
# - client_secret "dev-secret" is hardcoded for development only
# - In production, generate a strong random secret: openssl rand -base64 32
# - Update the secret in your OAuth client configuration

HYDRA_ADMIN=http://hydra:4445

echo "Waiting for Hydra to be ready..."
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do
  if curl -sf "$HYDRA_ADMIN/health/ready" >/dev/null 2>&1; then
    echo "Hydra is ready!"
    break
  fi
  echo "Attempt $i: Hydra not ready yet, waiting..."
  sleep 2
done

if ! curl -sf "$HYDRA_ADMIN/health/ready" >/dev/null 2>&1; then
  echo "ERROR: Hydra did not become ready in time"
  exit 1
fi

echo "Creating OAuth client..."
CLIENT_ID="frontend-app"

# Check if client already exists
if curl -sf "$HYDRA_ADMIN/admin/clients/$CLIENT_ID" >/dev/null 2>&1; then
  echo "Client $CLIENT_ID already exists"
  exit 0
fi

# Create the client
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$HYDRA_ADMIN/admin/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "'"$CLIENT_ID"'",
    "client_name": "Frontend App",
    "client_secret": "dev-secret",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "scope": "openid profile email offline",
    "redirect_uris": [
      "http://localhost:3000/callback", 
      "http://localhost:3000/auth/callback", 
      "https://auth.moorph.local/callback", 
      "https://auth.moorph.local/auth/callback"
    ],
    "token_endpoint_auth_method": "client_secret_basic",
    "skip_consent": true,
    "skip_logout_consent": true
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "OAuth client created successfully!"
  exit 0
else
  echo "ERROR: Failed to create OAuth client"
  exit 1
fi
