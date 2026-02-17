# Example Next.js App with Ory Hydra & Kratos

This is a [Next.js](https://nextjs.org) project demonstrating OAuth2/OIDC authentication flows using Ory Hydra and Ory Kratos. The application showcases:

- OAuth2 Authorization Code Flow with PKCE
- Hydra login, consent, and logout flows
- Kratos self-service flows (registration, login, recovery, verification, settings)
- Session management

## Getting Started

### Prerequisites

- Docker and Docker Compose (for Ory services or full stack)
- Node.js 20+ or Bun (for local development only)
- Environment variables configured (see `example.env` or `.env.docker`)

### Option 1: Docker (Full Stack - Recommended)

Run everything including the Next.js app in Docker:

```bash
# From the root directory
docker compose up -d

# The application will be available at http://localhost:3000
```

The Next.js application runs as the `nextjs-app` service and automatically connects to Ory services.

**To rebuild after code changes:**
```bash
docker compose up -d --build nextjs-app
```

**To view logs:**
```bash
docker compose logs -f nextjs-app
```

### Option 2: Local Development (Hybrid)

Run Ory services in Docker, Next.js locally for faster development with hot-reload:

```bash
# From the root directory - start Ory services only
docker compose up -d postgres pgadmin ory-hydra ory-kratos mailslurper

# From this directory - start Next.js in dev mode
cp example.env .env
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Testing

This project includes comprehensive unit and integration tests for the authentication flows.

### Test Setup

The test suite uses:
- **Jest** for test execution
- **Testing Library** for React component testing
- **Docker Compose** for isolated test environment (SQLite-backed Hydra/Kratos)

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests (auto-starts test Docker stack)
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
test/
├── setup.ts                    # Jest configuration and global mocks
├── helpers/
│   └── flow-helpers.ts        # Utilities for OAuth/Kratos flows
├── unit/
│   ├── utils.test.ts          # Unit tests for utilities
│   └── kratos-utils.test.ts   # Unit tests for Kratos helpers
└── integration/
    ├── oauth-flow.test.ts     # OAuth2 flow integration tests
    ├── hydra-flow.test.ts     # Hydra login/consent/logout tests
    └── kratos-flow.test.ts    # Kratos registration/login/recovery tests
```

### Integration Test Flow Coverage

The integration tests validate the following happy-path flows:

**OAuth2 Authorization Code Flow:**
1. User registration in Kratos
2. OAuth authorization initiation
3. Login challenge handling
4. Consent challenge handling
5. Token exchange (authorization code → access/refresh tokens)
6. Token refresh
7. Token revocation

**Kratos Self-Service Flows:**
- Registration with password
- Login with password
- Account recovery
- Email verification
- Settings/profile updates
- Session management

**Hydra Admin Operations:**
- OAuth2 client management
- Login request handling
- Consent request handling
- Logout request handling

### Test Environment

Integration tests use a dedicated Docker Compose stack (`docker-compose.test.yaml`) with:
- Isolated SQLite databases for Hydra and Kratos
- Test-specific ports (6xxx range)
- Test OAuth2 client pre-configured
- Separate network namespace

The test stack is automatically:
- Started before integration tests (`pretest:integration`)
- Torn down after tests complete (`posttest:integration`)

### Environment Variables

Test-specific environment variables are defined in `.env.test`:
- Kratos public/admin URLs
- Hydra public/admin URLs
- Test OAuth2 client credentials
- Test secrets (not for production)

## Project Structure

```
app/
├── api/
│   ├── auth/              # OAuth endpoints (login, logout, refresh, session)
│   └── hydra/             # Hydra callback handlers (login, consent, logout)
├── auth/                  # Authentication UI pages
└── settings/              # User settings page
components/                # Reusable UI components
hook/                      # React hooks (session management)
lib/                       # Utility functions
ory/
├── hydra/                 # Hydra client integration
└── kratos/                # Kratos flow handling
```

## Error Tracking with Sentry

This application uses [Sentry](https://sentry.io) for error tracking and performance monitoring.

### Configuration

Sentry is configured across three environments:
- **Client** (`instrumentation-client.ts`) - Browser error tracking with session replay
- **Server** (`sentry.server.config.ts`) - Server-side error tracking
- **Edge** (`sentry.edge.config.ts`) - Edge runtime error tracking

### Features

- **User Context**: Automatically tracks user information (ID, email, username) when authenticated
- **Error Boundaries**: Route-specific error handling for `/auth` and `/settings` routes
- **Session Replay**: Records user sessions on errors (production: 5% sample rate)
- **Performance Monitoring**: Traces requests and transactions (production: 10% sample rate)
- **Environment Tagging**: Separates development and production data

### Production Optimization

Sample rates are automatically adjusted based on environment:
- **Development**: Full sampling (100% traces, 10% replays)
- **Production**: Reduced sampling (10% traces, 5% replays, 100% error replays)

### Tunnel Route

Sentry requests are routed through `/monitoring` to bypass ad-blockers and respect CSP policies.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Ory Hydra Documentation](https://www.ory.sh/docs/hydra)
- [Ory Kratos Documentation](https://www.ory.sh/docs/kratos)
- [OAuth 2.0 RFC](https://oauth.net/2/)
- [OpenID Connect](https://openid.net/connect/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker Deployment

### Building the Docker Image

The project includes a production-ready multi-stage Dockerfile:

```bash
# Build the image
docker build -t nextjs-ory-app .

# Run standalone (requires Ory services)
docker run -p 3000:3000 \
  -e KRATOS_PUBLIC_BASE_URL=http://kratos:4433 \
  -e HYDRA_PUBLIC_BASE_URL=http://hydra:4444 \
  nextjs-ory-app
```

### Docker Compose

The application is integrated into the main `docker-compose.yaml` as the `nextjs-app` service with:
- Multi-stage build for optimized image size
- Bun runtime for fast cold starts
- Non-root user for security
- Automatic service dependencies
- Environment variables pre-configured

### Environment Variables for Docker

When running in Docker, use container hostnames for internal communication:
- `KRATOS_PUBLIC_BASE_URL=http://kratos:4433`
- `HYDRA_PUBLIC_BASE_URL=http://hydra:4444`
- `HYDRA_ADMIN_URL=http://hydra:4445`

See `.env.docker` for a complete example.
