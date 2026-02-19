import * as Sentry from '@sentry/nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth2 Callback Route Handler
 *
 * Receives the authorization code from Hydra after successful login/consent,
 * exchanges it for tokens, and stores them in httpOnly cookies using the BFF pattern.
 *
 * GET /auth/callback?code=...&state=...
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');
  const errorDescription = req.nextUrl.searchParams.get('error_description');

  // Validate state against cookie
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('oauth_state')?.value;
  const expectedNonce = cookieStore.get('oauth_nonce')?.value;
  const returnTo = cookieStore.get('oauth_return_to')?.value;
  const codeVerifier = cookieStore.get('oauth_pkce_verifier')?.value;

  // Always clear temporary cookies immediately to prevent reuse, even on error
  cookieStore.set('oauth_state', '', { path: '/', maxAge: 0 });
  cookieStore.set('oauth_nonce', '', { path: '/', maxAge: 0 });
  cookieStore.set('oauth_pkce_verifier', '', { path: '/', maxAge: 0 });
  cookieStore.set('oauth_return_to', '', { path: '/', maxAge: 0 });

  Sentry.addBreadcrumb({
    category: 'oauth',
    message: 'OAuth callback received',
    level: 'info',
    data: { has_code: !!code, has_state: !!state, has_error: !!error },
  });

  if (!state || !expectedState || state !== expectedState) {
    console.warn('[oauth callback] Invalid state parameter:', {
      state,
      expectedState,
    });
    Sentry.addBreadcrumb({
      category: 'oauth',
      message: 'State validation failed',
      level: 'warning',
    });
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=invalid_state&error_description=${encodeURIComponent(
          'Invalid or missing OAuth state'
        )}`,
        req.url
      )
    );
  }

  // Handle OAuth errors
  if (error) {
    console.error('[oauth callback] OAuth error:', error, errorDescription);
    Sentry.addBreadcrumb({
      category: 'oauth',
      message: 'OAuth provider returned error',
      level: 'error',
      data: { error_type: error },
    });
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription ?? '')}`,
        req.url
      )
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Missing authorization code' },
      { status: 400 }
    );
  }

  if (!codeVerifier) {
    return NextResponse.json(
      { error: 'Missing PKCE verifier' },
      { status: 400 }
    );
  }

  try {
    Sentry.addBreadcrumb({
      category: 'oauth',
      message: 'State validation successful',
      level: 'info',
    });

    // Get client credentials and Hydra URL from env
    const clientId = process.env.OAUTH_CLIENT_ID ?? 'frontend-app';
    const clientSecret = process.env.OAUTH_CLIENT_SECRET ?? 'dev-secret';
    const hydraPublicUrl =
      process.env.HYDRA_PUBLIC_BASE_URL ?? 'http://localhost:5444';
    const appUrl =
      process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'http://localhost:3000';
    const redirectUri = `${appUrl}/auth/callback`;

    // Exchange authorization code for tokens
    const tokenEndpoint = `${hydraPublicUrl}/oauth2/token`;
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    // Use Basic Auth for client authentication
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64'
    );

    // Wrap token exchange in span for performance tracking
    const tokenResponse = await Sentry.startSpan(
      { op: 'http.client', name: 'POST /oauth2/token' },
      async (span) => {
        Sentry.addBreadcrumb({
          category: 'oauth',
          message: 'Exchanging authorization code for tokens',
          level: 'info',
        });

        span.setAttribute('grant_type', 'authorization_code');
        span.setAttribute('has_pkce', true);

        const response = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
          },
          body: tokenParams.toString(),
        });

        span.setAttribute('http.response.status_code', response.status);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('[oauth callback] Token exchange failed:', errorBody);
          Sentry.addBreadcrumb({
            category: 'oauth',
            message: 'Token exchange failed',
            level: 'error',
            data: { status_code: response.status },
          });
          throw new Error(`Token exchange failed: ${response.statusText}`);
        }

        Sentry.addBreadcrumb({
          category: 'oauth',
          message: 'Token exchange successful',
          level: 'info',
        });

        return response;
      }
    );

    const tokens = await tokenResponse.json();
    const {
      access_token,
      id_token,
      refresh_token,
      expires_in,
      token_type,
      scope,
    } = tokens;

    Sentry.addBreadcrumb({
      category: 'oauth',
      message: 'Tokens received',
      level: 'info',
      data: {
        has_access_token: !!access_token,
        has_id_token: !!id_token,
        has_refresh_token: !!refresh_token,
      },
    });

    // Prepare cookie options (httpOnly, secure in production, SameSite=Strict)
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
      maxAge: expires_in ?? 3600, // Default to 1 hour if not provided
    };

    // Set tokens in httpOnly cookies
    const cookieStore = await cookies();

    if (access_token) {
      cookieStore.set('oauth_access_token', access_token, cookieOptions);
    }

    if (id_token) {
      // Validate nonce in ID token to prevent replay attacks
      if (expectedNonce) {
        try {
          // Decode ID token (without verification for nonce check only)
          const payload = id_token.split('.')[1];
          const decoded = JSON.parse(
            Buffer.from(payload, 'base64').toString('utf-8')
          );

          if (decoded.nonce !== expectedNonce) {
            console.error('[oauth callback] Nonce mismatch in ID token');
            Sentry.addBreadcrumb({
              category: 'oauth',
              message: 'Nonce validation failed',
              level: 'error',
            });
            throw new Error('Invalid nonce in ID token');
          }
        } catch (error) {
          console.error('[oauth callback] Failed to validate nonce:', error);
          Sentry.captureException(error);
          throw new Error('ID token nonce validation failed');
        }
      }

      cookieStore.set('oauth_id_token', id_token, cookieOptions);
    }

    if (refresh_token) {
      // Refresh token has longer expiry
      cookieStore.set('oauth_refresh_token', refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    // Store token metadata (non-sensitive) for client-side checks
    cookieStore.set(
      'oauth_token_meta',
      JSON.stringify({
        token_type,
        scope,
        expires_at: Date.now() + (expires_in ?? 3600) * 1000,
      }),
      {
        httpOnly: false, // Allow client to read expiry for refresh logic
        secure: isProduction,
        sameSite: 'strict' as const,
        path: '/',
        maxAge: expires_in ?? 3600,
      }
    );

    // Validate and sanitize redirect URL to prevent open redirect vulnerability
    let safeRedirect = appUrl;
    if (returnTo) {
      try {
        // Parse the returnTo URL to validate it
        const returnToUrl = new URL(returnTo, appUrl);
        const appUrlParsed = new URL(appUrl);

        // Only allow redirects to the same origin (same protocol, host, and port)
        const allowedOrigins = [appUrlParsed.origin];

        if (allowedOrigins.includes(returnToUrl.origin)) {
          // Use pathname + search to prevent protocol/host manipulation
          safeRedirect = returnToUrl.pathname + returnToUrl.search;
        } else {
          console.warn(
            '[oauth callback] Rejected external redirect:',
            returnTo
          );
          // Fall back to app root for safety
          safeRedirect = '/';
        }
      } catch (error) {
        console.warn('[oauth callback] Invalid returnTo URL:', returnTo, error);
        // Fall back to app root if parsing fails
        safeRedirect = '/';
      }
    }

    console.log(
      '[oauth callback] Login successful, redirecting to:',
      safeRedirect,
      'request URL:',
      req.url
    );
    Sentry.addBreadcrumb({
      category: 'oauth',
      message: 'OAuth callback completed successfully',
      level: 'info',
    });
    return NextResponse.redirect(new URL(safeRedirect, appUrl));
  } catch (error) {
    console.error('[oauth callback] Error:', error);
    Sentry.captureException(error);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=callback_failed&error_description=${encodeURIComponent(
          error instanceof Error ? error.message : 'Token exchange failed'
        )}`,
        req.url
      )
    );
  }
}
