import { kratosServer } from '@/ory/kratos/kratos.server';
import * as Sentry from '@sentry/nextjs';
import { cookies } from 'next/headers';
import { redirect, unstable_rethrow } from 'next/navigation';

interface LoginPageProps {
  searchParams: Promise<{
    login_challenge?: string;
  }>;
}

/**
 * Hydra Login Page
 *
 * Handles the OAuth2 login flow by:
 * 1. Fetching the login request from Hydra via the API route
 * 2. If skip=true (user already has a session), immediately accepting
 * 3. If no Kratos session exists, redirecting to /auth/login with return_to
 * 4. If Kratos session exists, accepting login with the user's identity.id
 */
export default async function HydraLoginPage({ searchParams }: LoginPageProps) {
  const { login_challenge } = await searchParams;

  if (!login_challenge) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Missing login_challenge
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            This page requires a valid login_challenge parameter.
          </p>
        </div>
      </div>
    );
  }

  try {
    Sentry.addBreadcrumb({
      category: 'oauth.hydra',
      message: 'Starting Hydra login page flow',
      level: 'info',
    });

    // 1. Fetch the Hydra login request
    const baseUrl = process.env.NEXT_INTERNAL_URL ?? 'http://localhost:3000';
    const loginReqUrl = new URL(`${baseUrl}/api/hydra/login`);
    loginReqUrl.searchParams.set('login_challenge', login_challenge);
    console.log(
      '[hydra/login page] fetching login request, baseurl:',
      loginReqUrl.toString()
    );

    const loginReqRes = await fetch(loginReqUrl.toString());
    if (!loginReqRes.ok) {
      console.log(
        '[hydra/login page] failed to fetch login request, status:',
        loginReqRes.status
      );
      throw new Error(
        `Failed to fetch login request: ${loginReqRes.statusText}`
      );
    }

    const loginRequest = await loginReqRes.json();

    console.log(
      '[hydra/login page] fetched login request successfully, data:',
      loginRequest
    );

    Sentry.addBreadcrumb({
      category: 'oauth.hydra',
      message: 'Fetched login request',
      level: 'info',
      data: {
        skip: loginRequest.skip,
        has_subject: !!loginRequest.subject,
      },
    });

    // 2. If skip=true, immediately accept with the existing subject
    if (loginRequest.skip && loginRequest.subject) {
      Sentry.addBreadcrumb({
        category: 'oauth.hydra',
        message: 'Skip=true, accepting login',
        level: 'info',
      });

      const acceptRes = await fetch(`${baseUrl}/api/hydra/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login_challenge,
          subject: loginRequest.subject,
        }),
      });

      if (!acceptRes.ok) {
        throw new Error(`Failed to accept login: ${acceptRes.statusText}`);
      }

      const { redirect_to } = await acceptRes.json();
      redirect(redirect_to);
    }

    // 3. Check if the user has a Kratos session
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    let kratosSession;

    let ok = false;
    try {
      const { data } = await kratosServer.toSession({ cookie: cookieHeader });
      kratosSession = data;
      ok = true;
    } catch (error) {
      console.log(
        '[hydra/login page] no valid Kratos session found, error:',
        error
      );
      ok = false;
    }

    Sentry.addBreadcrumb({
      category: 'oauth.hydra',
      message: 'Checked Kratos session',
      level: 'info',
      data: {
        has_session: ok,
      },
    });

    console.log(
      '[hydra/login page] Kratos session check, has session:',
      ok,
      'session data:',
      kratosSession,
      'cookie header:',
      cookieHeader
    );

    if (!ok || !kratosSession?.identity) {
      // No session → redirect to Kratos login with return_to
      Sentry.addBreadcrumb({
        category: 'oauth.hydra',
        message: 'No Kratos session, redirecting to login',
        level: 'info',
      });

      const returnUrl = `/auth/hydra/login?login_challenge=${encodeURIComponent(login_challenge)}`;
      redirect(`/auth/login?return_to=${encodeURIComponent(returnUrl)}`);
    }

    // 4. Accept login with the Kratos identity.id as subject
    const subject = kratosSession.identity?.id;
    if (!subject) {
      throw new Error('Kratos session exists but has no identity.id');
    }

    const acceptRes = await fetch(`${baseUrl}/api/hydra/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login_challenge, subject }),
    });

    if (!acceptRes.ok) {
      throw new Error(`Failed to accept login: ${acceptRes.statusText}`);
    }

    const { redirect_to } = await acceptRes.json();
    redirect(redirect_to);
  } catch (error) {
    // Re-throw Next.js internal errors (like redirect) so they are handled by the framework
    unstable_rethrow(error);

    console.error('[hydra/login page] error:', error);
    Sentry.captureException(error);
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Login Flow Error</h1>
          <p className="mt-2 text-sm text-gray-600">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }
}
