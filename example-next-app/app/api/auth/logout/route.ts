import * as Sentry from '@sentry/nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * OAuth Logout API Route
 *
 * Clears all OAuth tokens from httpOnly cookies.
 * Optionally can call the OAuth provider's logout endpoint server-side.
 *
 * POST /api/auth/logout
 */
export async function POST() {
  return Sentry.startSpan(
    { op: 'auth.logout', name: 'OAuth Logout' },
    async (span) => {
      try {
        Sentry.addBreadcrumb({
          category: 'auth',
          message: 'Starting logout process',
          level: 'info',
        });

        const cookieStore = await cookies();

        // Clear all OAuth-related cookies
        const oauthCookies = [
          'oauth_access_token',
          'oauth_id_token',
          'oauth_refresh_token',
          'oauth_token_meta',
          'oauth_state',
          'oauth_return_to',
        ];

        for (const cookieName of oauthCookies) {
          cookieStore.set(cookieName, '', {
            path: '/',
            maxAge: 0,
          });
        }

        // Clear Kratos session cookies (any cookie starting with ory_kratos_session)
        const kratosCookies = cookieStore
          .getAll()
          .filter((cookie) => cookie.name.startsWith('ory_kratos_session'));
        for (const cookie of kratosCookies) {
          cookieStore.set(cookie.name, '', {
            path: '/',
            maxAge: 0,
          });
        }

        Sentry.addBreadcrumb({
          category: 'auth',
          message: 'Cleared OAuth and Kratos cookies',
          level: 'info',
          data: {
            oauth_cookies_count: oauthCookies.length,
            kratos_cookies_count: kratosCookies.length,
          },
        });

        // Optional: Call Hydra's revocation endpoint to invalidate tokens
        // This is a best practice for security but not required for client-side logout
        const accessToken = cookieStore.get('oauth_access_token')?.value;
        if (accessToken) {
          try {
            Sentry.addBreadcrumb({
              category: 'oauth',
              message: 'Revoking access token',
              level: 'info',
            });

            const hydraPublicUrl =
              process.env.HYDRA_PUBLIC_BASE_URL ?? 'http://localhost:5444';
            const clientId = process.env.OAUTH_CLIENT_ID ?? 'frontend-app';
            const clientSecret =
              process.env.OAUTH_CLIENT_SECRET ?? 'dev-secret';

            const basicAuth = Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString('base64');

            await fetch(`${hydraPublicUrl}/oauth2/revoke`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${basicAuth}`,
              },
              body: new URLSearchParams({
                token: accessToken,
              }).toString(),
            });

            Sentry.addBreadcrumb({
              category: 'oauth',
              message: 'Token revocation completed',
              level: 'info',
            });
          } catch (err) {
            // Ignore revocation errors - cookies are already cleared
            console.warn('[auth/logout] Token revocation failed:', err);
            Sentry.captureException(err);
          }
        }

        // Build Hydra logout URL to terminate SSO session
        // TODO: move hydraPublicUrl and appUrl to a shared config file
        const hydraPublicUrl =
          process.env.HYDRA_PUBLIC_BASE_URL ??
          process.env.NEXT_PUBLIC_HYDRA_PUBLIC_URL ??
          'http://localhost:5444';
        const appUrl =
          process.env.NEXT_PUBLIC_APP_DOMAIN ??
          'http://localhost:3000';
        const logoutUrl = `${hydraPublicUrl}/oauth2/sessions/logout?return_to=${encodeURIComponent(
          appUrl
        )}`;

        span.setAttribute('logout.had_access_token', !!accessToken);

        Sentry.addBreadcrumb({
          category: 'auth',
          message: 'Logout completed',
          level: 'info',
        });

        return NextResponse.json({
          success: true,
          logoutUrl,
        });
      } catch (error) {
        console.error('[auth/logout] Error:', error);
        Sentry.captureException(error);
        return NextResponse.json(
          {
            error: error instanceof Error ? error.message : 'Logout failed',
          },
          { status: 500 }
        );
      }
    }
  );
}
