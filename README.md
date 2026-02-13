# ORY Starter

Starter Template for the ORY Stack, with [ORY Kratos](https://www.ory.com/kratos) and [ORY Hydra](https://www.ory.com/hydra) set up with docker locally.

## Key Implementations

- PostgreSQL database with automatic setup
- [ORY Kratos](https://www.ory.com/kratos) - Identity and user management
- [ORY Hydra](https://www.ory.com/hydra) - OAuth 2.0 and OpenID Connect provider
- Mailslurper for development email testing
- [Next.js example](./example-next-app/) implementation for the Kratos flow with custom UI (shadcn)
- Automatic OAuth client creation on startup (for development)

## Quick Start

1. Clone repository: `git clone git@github.com:Samuelk0nrad/docker-ory.git`
2. Copy example.env file: `cp example.env .env`
3. Generate random secrets for Kratos and Hydra: `openssl rand -base64 32`, and add them to the .env file
4. Run: `docker compose up -d`
5. Verify setup: `./test-setup.sh`

## Services & Endpoints

### [ORY Hydra](https://www.ory.com/hydra) - OAuth 2.0 & OpenID Connect

- **Public API**: http://localhost:5444
- **Admin API**: http://localhost:5445
- **OpenID Configuration**: http://localhost:5444/.well-known/openid-configuration

**Pre-configured OAuth Client:**
- Client ID: `frontend-app`
- Client Secret: `dev-secret`
- Grant Types: `authorization_code`, `refresh_token`
- Scopes: `openid`, `profile`, `email`, `offline`
- Redirect URIs:
  - http://localhost:3000/callback
  - http://localhost:3000/auth/callback

### [ORY Kratos](https://www.ory.com/kratos) - Identity Management

- **Public API**: http://localhost:5545
- **Admin API**: http://localhost:5544
- Config file: [config.yaml](./kratos-config/config.yaml)
- Identity schema: [identity.schema.json](./kratos-config/identity.schema.json)

### Database & Tools

- **PostgreSQL**: Port 5432
- **PgAdmin**: http://localhost:5050
  - Email: admin@pgadmin.com
  - Password: Kennwort1
- **Mailslurper**: http://localhost:4436

## Testing

Run the included test script to verify all services are working correctly:

```bash
./test-setup.sh
```

This will check:
- Container health status
- API endpoints availability
- OAuth client creation
- OpenID Connect configuration

## Configuration

### Hydra

Hydra is configured via:
- **Config file**: [hydra-config/config.yaml](./hydra-config/config.yaml) - Main Hydra configuration
- **Setup script**: [hydra-setup/setup.sh](./hydra-setup/setup.sh) - Automatic OAuth client creation

The OAuth client is automatically created on startup by the setup script. The setup is idempotent and safe to run multiple times.

To modify the OAuth client configuration, edit the [hydra-setup/setup.sh](./hydra-setup/setup.sh) file.

### Kratos

Kratos is configured via:
- **Config file**: [kratos-config/config.yaml](./kratos-config/config.yaml)
- **Identity schema**: [kratos-config/identity.schema.json](./kratos-config/identity.schema.json)

### Environment Variables

Required environment variables (see [example.env](./example.env)):
- `HYDRA_SYSTEM_SECRET` - Secret for Hydra (generate with `openssl rand -base64 32`)
- `HYDRA_DSN` - Database connection string for Hydra
- `KRATOS_SYSTEM_SECRET` - Secret for Kratos (generate with `openssl rand -base64 32`)
- `KRATOS_DSN` - Database connection string for Kratos
- `GOOGLE_OAUTH2_CLIENT_ID` - Google OAuth client ID (optional)
- `GOOGLE_OAUTH2_CLIENT_SECRET` - Google OAuth client secret (optional)
