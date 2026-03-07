import { NextRequest, NextResponse } from "next/server";
import { hydraAdmin } from "@/ory/hydra/hydra";
import * as Sentry from "@sentry/nextjs";

/**
 * GET /api/hydra/logout?logout_challenge=...
 *
 * Fetches the Hydra logout request so the caller can inspect it
 * before accepting.
 */
export async function GET(req: NextRequest) {
  const logoutChallenge = req.nextUrl.searchParams.get("logout_challenge");

  if (!logoutChallenge) {
    return NextResponse.json(
      { error: "logout_challenge query parameter is required" },
      { status: 400 }
    );
  }

  return await Sentry.startSpan(
    { op: "hydra.admin", name: "getOAuth2LogoutRequest" },
    async (span) => {
      try {
        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Fetching Hydra logout request",
          level: "info",
        });

        const { data } = await hydraAdmin.getOAuth2LogoutRequest({
          logoutChallenge,
        });

        span.setAttribute("hydra.rp_initiated", data.rp_initiated || false);

        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Hydra logout request fetched",
          level: "info",
        });

        return NextResponse.json(data);
      } catch (err: unknown) {
        console.error("[hydra/logout] GET error:", err);
        Sentry.captureException(err);
        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Failed to fetch logout request",
          level: "error",
        });
        const message =
          err instanceof Error ? err.message : "Failed to fetch logout request";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  );
}

/**
 * POST /api/hydra/logout
 *
 * Accepts the Hydra logout request, invalidating the OAuth2 session.
 *
 * Body: { logout_challenge: string }
 */
export async function POST(req: NextRequest) {
  return await Sentry.startSpan(
    { op: "hydra.admin", name: "acceptOAuth2LogoutRequest" },
    async () => {
      try {
        const body = await req.json();
        const { logout_challenge } = body as { logout_challenge?: string };

        if (!logout_challenge) {
          return NextResponse.json(
            { error: "logout_challenge is required" },
            { status: 400 }
          );
        }

        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Accepting Hydra logout request",
          level: "info",
        });

        const { data } = await hydraAdmin.acceptOAuth2LogoutRequest({
          logoutChallenge: logout_challenge,
        });

        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Hydra logout request accepted",
          level: "info",
        });

        return NextResponse.json({ redirect_to: data.redirect_to });
      } catch (err: unknown) {
        console.error("[hydra/logout] POST error:", err);
        Sentry.captureException(err);
        Sentry.addBreadcrumb({
          category: "oauth.hydra",
          message: "Failed to accept logout request",
          level: "error",
        });
        const message =
          err instanceof Error ? err.message : "Failed to accept logout request";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  );
}
