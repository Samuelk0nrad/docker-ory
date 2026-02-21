import { kratosServer } from '@/ory/kratos/kratos.server';
import * as Sentry from '@sentry/nextjs';
import { cookies } from 'next/headers';
import { redirect, unstable_rethrow } from 'next/navigation';

interface ConsentPageProps {
  searchParams: Promise<{
    consent_challenge?: string;
  }>;
}

/**
 * Hydra Consent Page
 *
 * Auto-accepts the OAuth2 consent request with:
 * - All requested scopes
 * - All requested audiences
 * - User identity traits embedded in JWT session claims (id_token + access_token)
 *
 * Since the OAuth client is configured with `skip_consent: true`, Hydra will
 * typically set `skip: true` on the consent request, but we still need this
 * endpoint to formally accept and embed user claims.
 */
export default async function HydraConsentPage({
  searchParams,
}: ConsentPageProps) {
  const { consent_challenge } = await searchParams;

  if (!consent_challenge) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Missing consent_challenge
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            This page requires a valid consent_challenge parameter.
          </p>
        </div>
      </div>
    );
  }

  try {
    Sentry.addBreadcrumb({
      category: 'oauth.hydra',
      message: 'Starting Hydra consent page flow',
      level: 'info',
    });

    const baseUrl = process.env.NEXT_INTERNAL_URL ?? 'http://localhost:3000';

    // 1. Fetch the consent request from Hydra
    const consentReqUrl = new URL(`${baseUrl}/api/hydra/consent`);
    consentReqUrl.searchParams.set('consent_challenge', consent_challenge);

    const consentReqRes = await fetch(consentReqUrl.toString());
    if (!consentReqRes.ok) {
      throw new Error(
        `Failed to fetch consent request: ${consentReqRes.statusText}`
      );
    }

    const consentRequest = await consentReqRes.json();

    Sentry.addBreadcrumb({
      category: 'oauth.hydra',
      message: 'Fetched consent request',
      level: 'info',
      data: {
        requested_scopes_count: consentRequest.requested_scope?.length ?? 0,
      },
    });

    console.log(
      '[hydra/consent page] fetched consent request successfully, data:',
      consentRequest
    );

    // 2. Get the Kratos session to embed user traits
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    let userClaims = {};
    try {
      const { data: session } = await kratosServer.toSession({
        cookie: cookieHeader,
      });
      const identity = session.identity;

      // Extract common user traits for the JWT
      userClaims = {
        sub: identity?.id ?? consentRequest.subject,
        email: identity?.traits?.email ?? '',
        name: identity?.traits?.name ?? '',
        // Add any other traits you want in the JWT
      };

      Sentry.addBreadcrumb({
        category: 'oauth.hydra',
        message: 'Extracted user claims from Kratos session',
        level: 'info',
      });
    } catch {
      console.warn(
        '[hydra/consent] No Kratos session found, using subject:',
        consentRequest.subject
      );
      // Fall back to just the subject if no Kratos session
      userClaims = {
        sub: consentRequest.subject,
      };

      Sentry.addBreadcrumb({
        category: 'oauth.hydra',
        message: 'No Kratos session, using subject only',
        level: 'warning',
      });
    }

    console.log(
      '[hydra/consent page] user claims to embed in tokens:',
      userClaims
    );

    // 3. Accept consent with all requested scopes + audiences + user claims
    Sentry.addBreadcrumb({
      category: 'oauth.hydra',
      message: 'Accepting consent',
      level: 'info',
    });
    const acceptRes = await fetch(`${baseUrl}/api/hydra/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent_challenge,
        grant_scope: consentRequest.requested_scope ?? [],
        grant_access_token_audience:
          consentRequest.requested_access_token_audience ?? [],
        session: {
          id_token: userClaims,
          access_token: userClaims,
        },
      }),
    });

    if (!acceptRes.ok) {
      throw new Error(`Failed to accept consent: ${acceptRes.statusText}`);
    }

    
    const acceptResData = await acceptRes.json();
    const { redirect_to } = acceptResData;
    console.log(
      '[hydra/consent page] consent accepted successfully, redirecting',
      "accept response data:",
      acceptResData
    );
    console.log('[hydra/consent page] redirecting to:', redirect_to);
    redirect(redirect_to);
  } catch (error) {
    console.error('[hydra/consent page] error:', error);

    // Re-throw Next.js internal errors (like redirect) so they are handled by the framework
    unstable_rethrow(error);

    Sentry.captureException(error);

    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Consent Flow Error
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }
}
