until curl -sf http://hydra:4445/health/ready; do
  echo 'Waiting for Hydra...'
  sleep 2
done

curl -sf http://hydra:4445/admin/clients/my-client ||
  curl -X POST http://hydra:4445/admin/clients \
    -H 'Content-Type: application/json' \
    -d '{
        \"client_id\": \"my-client\",
        \"client_secret\": \"my-secret\",
        \"grant_types\": [\"authorization_code\", \"refresh_token\"],
        \"response_types\": [\"code\"],
        \"scope\": \"openid offline\",
        \"redirect_uris\": [\"http://localhost:3000/callback\"]
      }'
