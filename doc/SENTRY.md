# Sentry Error Tracking & Performance Monitoring

This project integrates [Sentry](https://sentry.io/) for comprehensive error tracking, performance monitoring, and source map management across the Next.js application.

## Overview

Sentry configuration is isolated in the dedicated `sentry/` folder within `example-next-app/`:

- **`sentry/instrumentation-client.ts`** - Client-side error tracking and Replay integration
- **`sentry/server.config.ts`** - Server-side error and performance tracking
- **`sentry/edge.config.ts`** - Edge function error tracking (middleware, edge routes)

All three share the same DSN configured via environment variables, enabling unified error tracking across runtime environments.

## Setup

### 1. Create a Sentry Project

1. Go to [sentry.io](https://sentry.io/) and sign up/log in
2. Create a new project:
   - **Platform**: Select "Next.js"
   - This will give you a DSN (Data Source Name) for error reporting
3. Note your organization slug and project slug (visible in Sentry project settings)

### 2. Configure Environment Variables

Update your `.env` file (or `.env.local` for local development) with:

```dotenv
# Public DSN for client, server, and edge error reporting
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID

# Sentry organization slug (for build-time source map uploads)
SENTRY_ORG=your-org-slug

# Sentry project slug (for build-time source map uploads)
SENTRY_PROJECT=your-project-slug

# Auth token for source map uploads (generate at https://sentry.io/settings/auth-tokens/)
SENTRY_AUTH_TOKEN=your_auth_token_here
```

### 3. Generate Sentry Auth Token

To enable automatic source map uploads during the build:

1. Go to [sentry.io/settings/auth-tokens/](https://sentry.io/settings/auth-tokens/)
2. Create a new auth token with scopes:
   - `project:read`
   - `project:write`
   - `releases:write`
3. Copy and paste into `SENTRY_AUTH_TOKEN` in your `.env` file

## Architecture

### Client-Side (Browser)

**File**: `sentry/instrumentation-client.ts`

- Captures unhandled exceptions and errors in browser
- Records frontend performance metrics (page load, navigation timing)
- Enables [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/) for debugging (10% sampled)
- Full error replay captures (100% sampled)
- Captures router transitions via `onRouterTransitionStart`

**Configuration**:
- `tracesSampleRate: 1` - Traces all transactions (adjust in production)
- `replaysSessionSampleRate: 0.1` - Records 10% of sessions
- `replaysOnErrorSampleRate: 1.0` - Records 100% of error replays
- `sendDefaultPii: true` - Includes user context (email, username) when available

### Server-Side (Node.js)

**File**: `sentry/server.config.ts`

- Captures unhandled exceptions during request handling
- Tracks server-side performance metrics (API route duration, database queries)
- Integrates with route handlers and server components
- Sends full request context (headers, user data) for debugging

**Configuration**:
- `tracesSampleRate: 1` - Traces all transactions (adjust in production)
- `sendDefaultPii: true` - Includes request user context

### Edge Functions (Middleware)

**File**: `sentry/edge.config.ts`

- Captures errors in Vercel Edge Runtime functions
- Tracks middleware performance
- Works with edge routes and middleware

**Configuration**:
- Same as server-side config
- Uses `process.env.NEXT_RUNTIME === "edge"` for conditional registration

### Registration

**File**: `instrumentation.ts` (root level, auto-loaded by Next.js)

```typescript
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry/server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry/edge.config");
  }
}
```

This ensures each runtime loads only its relevant Sentry configuration.

## Build Configuration

**File**: `next.config.ts`

The [Sentry Webpack plugin](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/) is configured in `withSentryConfig()`:

```typescript
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "moorph",
  project: process.env.SENTRY_PROJECT || "auth-system",
  
  // Tunnel route for ad-blocker circumvention
  tunnelRoute: "/monitoring",
  
  // Source map upload settings
  widenClientFileUpload: true,
  
  // Vercel Cron monitoring
  automaticVercelMonitors: true,
  
  // Tree-shaking for bundle optimization
  treeshake: {
    removeDebugLogging: true,
  },
});
```

### Source Map Upload

During the build (`bun run build`):

1. Next.js generates source maps for production bundles
2. Sentry Webpack plugin uploads them using `SENTRY_AUTH_TOKEN`
3. When errors occur in production, Sentry displays original source code instead of minified code

**Requirements**:
- `SENTRY_AUTH_TOKEN` must be set (generate at Sentry dashboard)
- `SENTRY_ORG` and `SENTRY_PROJECT` must match your Sentry project
- Build will fail if upload fails and token is invalid

### Tunnel Route

The tunnel route `/monitoring` allows error reports to bypass ad blockers:

- **Route**: `GET /monitoring?*` and `POST /monitoring?*`
- **Configured in**: `next.config.ts` as `tunnelRoute: "/monitoring"`
- **Middleware check**: Ensure middleware doesn't block this route (see [middleware.ts](../example-next-app/middleware.ts))

## Error Boundaries

**File**: `app/global-error.tsx`

The Next.js App Router error boundary captures uncaught exceptions and renders a fallback UI:

```typescript
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Error is automatically captured by Sentry via captureException
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

## Testing Sentry Integration

### Client-Side Error

1. Visit: http://localhost:3000/sentry-example-page
2. Click "Throw error" button
3. Check Sentry dashboard for the error

### Server-Side Error

1. Visit: http://localhost:3000/api/sentry-example-api
2. Check Sentry dashboard for the server error

### Performance Monitoring

1. Navigate through the app
2. Check Sentry dashboard → "Performance" tab for:
   - Page load times
   - API route duration
   - Database query spans

## Environment-Specific Configuration

### Development

```dotenv
NEXT_PUBLIC_SENTRY_DSN=https://your-dev-dsn@...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-dev-project
SENTRY_AUTH_TOKEN=your_token
```

- `tracesSampleRate: 1` - Capture all traces for debugging

### Production

```dotenv
NEXT_PUBLIC_SENTRY_DSN=https://your-prod-dsn@...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-prod-project
SENTRY_AUTH_TOKEN=your_token
```

**Recommended adjustments**:
- Reduce `tracesSampleRate` to 0.1-0.2 (10-20%) to avoid quota limits
- Set `replaysSessionSampleRate: 0.05` (5% of sessions)
- Use [Sentry Quota Management](https://docs.sentry.io/product/accounts/quotas/) to control costs

## Data Privacy

### PII (Personally Identifiable Information)

With `sendDefaultPii: true`, Sentry captures:
- User ID/email (from session context)
- Request headers
- URL query parameters
- Cookies (configurable)

**To exclude sensitive data**:

1. **Client-side**: Use `beforeSend()` callback in `sentry/instrumentation-client.ts`
2. **Server-side**: Use `beforeSend()` callback in `sentry/server.config.ts`
3. **Dashboard**: Use Sentry Data Scrubbing rules

Example:
```typescript
Sentry.init({
  dsn: "...",
  beforeSend(event) {
    // Remove credit card data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

### GDPR Compliance

- Users can opt-out of error tracking (implement toggle in settings)
- Use `Sentry.setUser(null)` to clear user context
- Configure [Data Retention](https://docs.sentry.io/product/accounts/quotas/) policies in Sentry dashboard

## Troubleshooting

### Source Maps Not Uploading

**Error**: `SENTRY_AUTH_TOKEN is missing or invalid`

- Verify `SENTRY_AUTH_TOKEN` is set correctly
- Check scopes: must include `project:write` and `releases:write`
- Ensure `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry dashboard

### Errors Not Appearing in Sentry

- Verify `NEXT_PUBLIC_SENTRY_DSN` is correct
- Check browser console for Sentry initialization errors
- Ensure tunnel route `/monitoring` is not blocked by middleware
- Disable ad blockers during testing

### Too Many Events / Quota Issues

- Reduce `tracesSampleRate` in config files
- Use [Inbound Filters](https://docs.sentry.io/product/data-management/event-ingestion/inbound-filters/) to exclude noise
- Set up [Quota Alerts](https://docs.sentry.io/product/accounts/quotas/) in Sentry dashboard

## Further Reading

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/performance/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)
