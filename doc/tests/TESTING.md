# Testing Guide

Complete guide for testing the Ory Hydra/Kratos integration with Next.js.

---

## Quick Start

```bash
# Single command to run everything (automated)
cd example-next-app
bun run test:all

# OR manual steps:

# 1. Start test services (Docker)
docker compose -f docker-compose.test.yaml up -d
sleep 20

# 2. Run tests
cd example-next-app

# Unit tests only
bun test test/unit

# Direct API tests (Kratos/Hydra)
bun test test/integration/kratos-flow.test.ts

# Full integration tests (requires Next.js app on port 3001)
bun run dev:test  # Terminal 1
bun test test/integration  # Terminal 2

# All tests with coverage
bun test:coverage
```

---

## Test Commands

### Automated (Recommended)
```bash
bun run test:all           # Complete automated test suite
                           # - Starts Docker services
                           # - Starts Next.js in test mode
                           # - Runs all tests
                           # - Cleans up automatically
```

### Basic
```bash
bun test                    # Run all tests
bun test test/unit          # Unit tests only
bun test:coverage           # With coverage report
bun test --watch            # Watch mode
```

### Integration
```bash
bun test test/integration/kratos-flow.test.ts  # Kratos flows
bun test test/integration/hydra-flow.test.ts   # Hydra flows
bun test test/integration/oauth-flow.test.ts   # OAuth flows
```

### Docker Services
```bash
# Start test stack
docker compose -f docker-compose.test.yaml up -d

# Check status
docker compose -f docker-compose.test.yaml ps

# View logs
docker compose -f docker-compose.test.yaml logs -f kratos-test

# Stop and cleanup
docker compose -f docker-compose.test.yaml down -v
```

---

## Test Coverage

### Unit Tests (13 tests)
- `test/unit/utils.test.ts` - Utility functions
- `test/unit/kratos-utils.test.ts` - Kratos helpers

### Integration Tests (28 tests)
- `test/integration/kratos-flow.test.ts` - Kratos self-service flows (11 tests)
- `test/integration/hydra-flow.test.ts` - Hydra OAuth flows (8 tests)
- `test/integration/oauth-flow.test.ts` - Complete OAuth flow (9 tests)

**Total: 41 tests, all passing**

---

## Test Environment

### Architecture
- **Isolated**: Separate Docker stack from development
- **Database**: SQLite (lightweight, no persistence needed)
- **Ports**: Test services on 6xxx range (dev uses 5xxx)
- **Network**: Separate `ory-bridge-test` network

### Services
| Service | Ports | Purpose |
|---------|-------|---------|
| Hydra Test | 6444/6445 | OAuth2 server |
| Kratos Test | 6545/6544 | Identity management |
| Mailslurper Test | 6436-6438 | Email testing |

### Environment Variables (`.env.test`)
```env
# Kratos
NEXT_PUBLIC_KRATOS_URL=http://localhost:6545
KRATOS_ADMIN_URL=http://localhost:6544

# Hydra
NEXT_PUBLIC_HYDRA_URL=http://localhost:6444
HYDRA_ADMIN_URL=http://localhost:6445

# OAuth Client
OAUTH2_CLIENT_ID=test-client-id
OAUTH2_CLIENT_SECRET=test-client-secret
OAUTH2_REDIRECT_URI=http://localhost:3001/auth/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## File Structure

```
docker-compose.test.yaml           # Test Docker stack
hydra-config/
  ├── config.test.yaml             # Hydra test config
hydra-setup/
  ├── setup.test.sh                # OAuth client setup
kratos-config/
  ├── config.test.yaml             # Kratos test config
example-next-app/
  ├── .env.test                    # Test environment
  ├── jest.config.ts               # Jest configuration
  ├── test/
  │   ├── setup.ts                 # Global setup
  │   ├── helpers/
  │   │   └── flow-helpers.ts      # OAuth/Kratos utilities
  │   ├── unit/                    # Unit tests
  │   └── integration/             # Integration tests
```

---

## Adding New Tests

### Unit Test
```typescript
// test/unit/my-feature.test.ts
describe('My Feature', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expected)
  })
})
```

### Integration Test
```typescript
// test/integration/my-flow.test.ts
describe('My Flow Integration', () => {
  const kratosUrl = process.env.NEXT_PUBLIC_KRATOS_URL || 'http://localhost:6545'
  
  it('should test flow', async () => {
    const response = await fetch(`${kratosUrl}/endpoint`)
    expect(response.ok).toBe(true)
  })
})
```

---

## Troubleshooting

### Services Won't Start
```bash
# Check logs
docker compose -f docker-compose.test.yaml logs

# Force recreate
docker compose -f docker-compose.test.yaml down -v
docker compose -f docker-compose.test.yaml up -d --force-recreate
```

### Tests Fail with Connection Errors
```bash
# Verify services are healthy
docker compose -f docker-compose.test.yaml ps

# Wait longer
sleep 30

# Check port conflicts
lsof -i :6444,6445,6544,6545
```

### Coverage Issues
If tests pass with `bun test` but fail with `bun test:coverage`:
- Check polyfills in `test/setup.ts`
- Ensure `node-fetch` is installed
- Verify Node.js version compatibility

### Password Breach Errors
If Kratos rejects test passwords:
- Use unique passwords: `SecureTestPass${Date.now()}!XyZ`
- Avoid common patterns
- Don't reuse production passwords in tests

---

## Configuration

### Jest (`jest.config.ts`)
```typescript
const config = {
  preset: 'next/jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
  ],
}
```

### Test Setup (`test/setup.ts`)
- Imports `@testing-library/jest-dom`
- Polyfills: `fetch`, `TextEncoder`, `crypto`
- Mocks Next.js router
- Sets environment variables
- Configures 30s timeout

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: docker compose -f docker-compose.test.yaml up -d
      - run: sleep 20
      - run: bun test:coverage
      - run: docker compose -f docker-compose.test.yaml down -v
```

---

## Best Practices

1. **Isolation**: Keep test and dev environments separate
2. **Cleanup**: Use `docker compose down -v` to remove volumes between test runs
3. **Unique Data**: Generate unique emails/passwords per test run
4. **Parallel Safe**: Integration tests use `--runInBand` to avoid conflicts
5. **Fast Feedback**: Run unit tests first (faster), then integration
6. **Coverage**: Aim for >80% on business logic, 100% on utilities

---

## Next Steps

- Add E2E tests with Playwright for browser flows
- Add component tests with React Testing Library
- Add API contract tests
- Add performance/load tests
- Integrate with CI/CD pipeline
- Add test data factories/fixtures
- Add mutation testing
