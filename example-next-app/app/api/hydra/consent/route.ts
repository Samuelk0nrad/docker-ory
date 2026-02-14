import { NextRequest, NextResponse } from "next/server";
import { hydraAdmin } from "@/ory/hydra/hydra";

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

  try {
    const { data } = await hydraAdmin.getOAuth2ConsentRequest({
      consentChallenge,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[hydra/consent] GET error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to fetch consent request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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

    return NextResponse.json({ redirect_to: data.redirect_to });
  } catch (err: unknown) {
    console.error("[hydra/consent] POST error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to accept consent request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
