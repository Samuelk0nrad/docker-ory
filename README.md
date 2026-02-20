# ORY Starter

Starter Template for the ORY Stack, with [ORY Kratos](https://www.ory.com/kratos) and [ORY Hydra](https://www.ory.com/hydra) set up with docker locally.

## Key Implementations

- PostgreSQL database with automatic setup
- [ORY Kratos](https://www.ory.com/kratos) - Identity and user management
- [ORY Hydra](https://www.ory.com/hydra) v2.2+ - OAuth 2.0 and OpenID Connect provider
- **Full OAuth2/OIDC integration** - Hydra delegates authentication to Kratos, then issues JWTs
- **Backend-for-Frontend (BFF) pattern** - Tokens stored in httpOnly cookies, never exposed to browser
- **Automatic consent flow** - First-party OAuth client with skip_consent enabled
- Mailslurper for development email testing
- [Next.js example](./example-next-app/) implementation with custom UI (shadcn)
- Automatic OAuth client creation on startup (for development)
- **Sentry error tracking** - Error monitoring and performance tracking (see [doc/SENTRY.md](./doc/SENTRY.md))

## Quick Start

### Option 1: Docker (Recommended - Full Stack)

Run everything including the Next.js app in Docker:

#### Step 1: Clone the repository

```sh
git clone git@github.com:Samuelk0nrad/docker-ory.git
```

#### Step 2: Set up your environment for the containers

- First copy the `example.env` file to `.env`
- Second, you have to create secrets for Kratos and Hydra, to do so run this command twice:

```sh
openssl rand -base64 32
```

#### Step 3: Add your domain (`auth.moorph.local`) to your hosts file

**`on linux/Mac:`**

Add at the end of your /etc/hosts file the following line (Tip: Open the file with sudo):
```txt
127.0.0.1 auth.moorph.local
```

This will let you access the whole application via `auth.moorph.local`

**`on Windown`**

Use ~Google~ / ChatGPT / OpenClaw / ...

#### Step 4: Add TLS certificate for `auth.moorph.local`

The reverse proxy looks at the `proxy-config/cert` for the TLS certificate and the key so create them there!

**`on linux`**:
if not already:
1. Install mkcert
2. Install the local CA:
   ```sh
   mkcert -install
   ```

Then create the certificates inside the `proxy-config/cert` folder:
```sh
mkcert auth.moorph.local
```

**Thats it!** (for this step)

for more details look at [cert readme](./proxy-config/cert/README.md)

#### Step 5: Set up your nextjs environment

- Copy the `example.env` file inside the `example-next-app` to `.env`
- If you followed the previous steps you just have to set up the sentry variables

#### Step 6: Run the whole auth stack!

Just run the docker compose container:
```sh
docker compose up -d
```

To see the logs from the nextjs application you can run:
```bash
docker compose logs nextjs-app -f
```

(same with all the other services)

you should now be able to access the application at https://auth.moorph.local

### Option 2: Hybrid (Development)
(this is ai generated and I'm not shure if it works! (same with the whole other readme, expect the first option :) ))

Run Ory services in Docker, Next.js locally for faster development:

1. Clone repository: `git clone git@github.com:Samuelk0nrad/docker-ory.git`
2. Follow Steps 2-4 from Option 1 to set up environment, hosts file, and TLS certificates
3. Start Ory services only: `docker compose up -d postgres pgadmin ory-hydra ory-kratos mailslurper proxy`
4. Verify setup: `./test-setup.sh`
5. Start Next.js app locally: `cd example-next-app && cp example.env .env && bun install && bun run dev`
6. Visit: https://auth.moorph.local (proxy forwards to your local Next.js dev server)

**Note:** This mode requires the nginx proxy to be running to handle SSL/TLS termination and routing.

## Architecture Overview

### OAuth2/OIDC Flow

This setup implements a complete OAuth2/OIDC authentication flow where:

1. **Hydra** acts as the OAuth2/OIDC provider (authorization server)
2. **Kratos** handles the actual user authentication (login/registration)
3. **Next.js app** acts as both:
   - OAuth2 client (initiates OAuth flows)
   - Backend-for-Frontend (BFF) - securely manages tokens

**Flow sequence:**
1. User initiates OAuth2 flow → PKCE `code_challenge` generated → redirected to Hydra
2. Hydra delegates login to Kratos (transparent to user)
3. User authenticates via Kratos (username/password, OIDC providers, etc.)
4. Kratos returns to Hydra with authenticated subject
5. Hydra issues consent (auto-skipped for first-party client)
6. Authorization code exchanged for tokens with PKCE `code_verifier` (server-side)
7. Tokens stored in httpOnly cookies (never exposed to browser)
8. User authenticated with JWT claims available client-side

## Services & Endpoints

### [ORY Hydra](https://www.ory.com/hydra) - OAuth 2.0 & OpenID Connect

- **Version**: v2.2.0+
- **Public API (via proxy)**: https://auth.moorph.local/api/.ory/hydra
- **Public API (direct host port)**: http://localhost:5444
- **Admin API**: http://localhost:5445
- **OpenID Configuration (via proxy)**: https://auth.moorph.local/api/.ory/hydra/.well-known/openid-configuration
- **OpenID Configuration (direct host port)**: http://localhost:5444/.well-known/openid-configuration

**Pre-configured OAuth Client:**
- Client ID: `frontend-app`
- Client Secret: `dev-secret` (server-side only, never exposed)
- Grant Types: `authorization_code`, `refresh_token`
- Response Types: `code`
- Scopes: `openid`, `profile`, `email`, `offline`
- Redirect URIs:
  - https://auth.moorph.local/callback
  - https://auth.moorph.local/auth/callback
- **Skip Consent**: `true` (auto-accept consent for first-party client)

**Integration Features:**
- Login delegation to Kratos via `/auth/hydra/login`
- Auto-consent via `/auth/hydra/consent`
- Logout coordination via `/auth/hydra/logout`
- JWT tokens with embedded user identity claims
- Token exchange handled server-side in BFF pattern

### [ORY Kratos](https://www.ory.com/kratos) - Identity Management

- **Public API (via proxy)**: https://auth.moorph.local/api/.ory/kratos
- **Public API (direct host port)**: http://localhost:5545
- **Admin API**: http://localhost:5544
- Config file: [config.yaml](./kratos-config/config.yaml)
- Identity schema: [identity.schema.json](./kratos-config/identity.schema.json)

**Configured Features:**
- Password authentication
- Email verification & recovery
- OIDC providers (Google configured as example, but can be extended)
- **OAuth2 return URL support** for Hydra integration
- Allowed return URLs: `https://auth.moorph.local/auth/hydra/*`

### Next.js Application

- **Public URL (via proxy)**: https://auth.moorph.local
- **Container Port**: 80 (internal)
- **Framework**: Next.js 15+ (App Router)
- **UI**: Custom components with shadcn/ui
- **Runtime**: Bun 1.2.1 (Alpine-based container)

**Deployment Options:**
1. **Docker (Production)**: Included in `docker-compose.yaml` as `nextjs-app` service
2. **Local Development**: Run with `bun run dev` for hot-reload

**Authentication Endpoints:**
- `/auth/login` - Kratos login with optional `return_to` support
- `/auth/registration` - User registration with optional `return_to`
- `/auth/hydra/login` - OAuth2 login delegation (server component)
- `/auth/hydra/consent` - OAuth2 consent handling (server component)
- `/auth/hydra/logout` - OAuth2 logout coordination (server component)
- `/auth/callback` - OAuth2 token exchange & cookie storage (route handler)

**API Routes:**
- `/api/hydra/login` - GET/POST for Hydra login request handling
- `/api/hydra/consent` - GET/POST for Hydra consent request handling
- `/api/hydra/logout` - GET/POST for Hydra logout request handling
- `/api/auth/session` - GET OAuth token claims without exposing raw tokens

**Session Management:**
- Client hook: `useSession()` from `hook/auth/session_hook.tsx`
- Context: Provides both Kratos and OAuth session states
- Methods:
  - `startOAuthFlow(returnTo?)` - Initiates OAuth2 authorization
  - `logout()` - Handles both Kratos and OAuth logout
  - `refrashSession()` - Refreshes Kratos session
- State:
  - `isLoggedIn` - Combined Kratos + OAuth authentication status
  - `isOAuthSession` - Whether authenticated via OAuth2
  - `accessTokenClaims` - Decoded JWT claims (sub, email, name, etc.)
  - `user` - Kratos identity data

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

**Version**: v2.2.0+ (upgraded from v1.10.6 for SDK compatibility)

Hydra is configured via:
- **Config file**: [hydra-config/config.yaml](./hydra-config/config.yaml) - Main Hydra configuration
- **Setup script**: [hydra-setup/setup.sh](./hydra-setup/setup.sh) - Automatic OAuth client creation

The OAuth client is automatically created on startup by the setup script using Hydra v2.x admin API paths (`/admin/clients`). The setup is idempotent and safe to run multiple times.

**Key Configuration:**
- JWT access tokens (`strategies.access_token: jwt`)
- Login/consent/logout URLs point to Next.js app
- Token lifespans configured in [hydra-config/config.yaml](./hydra-config/config.yaml)

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


## Things that I want to add in the future / I'm working on:

- [ ] fix issue if clicking login -> registrate, it doesn't redirect to the hydra oauth flow, and a nother click on login is required

---
- [ ] fix test setup
- [ ] add health checks to containers for testing
