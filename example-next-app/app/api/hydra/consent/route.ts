import { NextRequest, NextResponse } from "next/server";
import { hydraAdmin } from "@/ory/hydra/hydra";
import * as Sentry from "@sentry/nextjs";

/**
 * GET /api/hydra/consent?consent_challenge=...
 *
 * Fetches the Hydra consent request. In a first-party setup with
 * `skip_consent: true` on the OAuth client, `skip` will always be true.
 */
export async function GET(req: NextRequest) {
  const consentChallenge = req.nextUrl.searchParams.get("consent_challenge");

  if (!consentChallenge) {
    return NextResponse.json(
      { error: "consent_challenge query parameter is required" },
      { status: 400 }
    );
  }

  return await Sentry.startSpan(
    { op: "hydra.admin", name: "getOAuth2ConsentRequest" },
    async (span) => {
      try {
        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Fetching Hydra consent request",
          level: "info",
        });

        const { data } = await hydraAdmin.getOAuth2ConsentRequest({
          consentChallenge,
        });

        span.setAttribute("hydra.skip", data.skip || false);
        span.setAttribute("hydra.requested_scopes_count", data.requested_scope?.length || 0);

        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Hydra consent request fetched",
          level: "info",
          data: { skip: data.skip, scopes_count: data.requested_scope?.length || 0 },
        });

        return NextResponse.json(data);
      } catch (err: unknown) {
        console.error("[hydra/consent] GET error:", err);
        Sentry.captureException(err);
        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Failed to fetch consent request",
          level: "error",
        });
        const message =
          err instanceof Error ? err.message : "Failed to fetch consent request";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  );
}

/**
 * POST /api/hydra/consent
 *
 * Auto-accepts the consent request, granting all requested scopes and
 * embedding user identity claims in the JWT session (access_token + id_token).
 *
 * Body: {
 *   consent_challenge: string;
 *   grant_scope: string[];
 *   grant_access_token_audience: string[];
 *   session?: { access_token?: object; id_token?: object };
 * }
 */
export async function POST(req: NextRequest) {
  return await Sentry.startSpan(
    { op: "hydra.admin", name: "acceptOAuth2ConsentRequest" },
    async (span) => {
      try {
        const body = await req.json();
        const {
          consent_challenge,
          grant_scope,
          grant_access_token_audience,
          session,
        } = body as {
          consent_challenge?: string;
          grant_scope?: string[];
          grant_access_token_audience?: string[];
          session?: { access_token?: object; id_token?: object };
        };

        if (!consent_challenge) {
          return NextResponse.json(
            { error: "consent_challenge is required" },
            { status: 400 }
          );
        }

        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Accepting Hydra consent request",
          level: "info",
        });

        span.setAttribute("hydra.granted_scopes_count", grant_scope?.length || 0);
        span.setAttribute("hydra.remember", true);

        const { data } = await hydraAdmin.acceptOAuth2ConsentRequest({
          consentChallenge: consent_challenge,
          acceptOAuth2ConsentRequest: {
            grant_scope: grant_scope ?? [],
            grant_access_token_audience: grant_access_token_audience ?? [],
            remember: true,
            remember_for: 3600,
            session: session ?? {},
          },
        });

        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Hydra consent request accepted",
          level: "info",
        });

        return NextResponse.json({ redirect_to: data.redirect_to });
      } catch (err: unknown) {
        console.error("[hydra/consent] POST error:", err);
        Sentry.captureException(err);
        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Failed to accept consent request",
          level: "error",
        });
        const message =
          err instanceof Error ? err.message : "Failed to accept consent request";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  );
}
