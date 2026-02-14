import { NextRequest, NextResponse } from "next/server";
import { hydraAdmin } from "@/ory/hydra/hydra";

/**
 * GET /api/hydra/login?login_challenge=...
 *
 * Fetches the Hydra login request so the caller (the login page)
 * can decide whether to skip authentication or show the login UI.
 */
export async function GET(req: NextRequest) {
  const loginChallenge = req.nextUrl.searchParams.get("login_challenge");

  if (!loginChallenge) {
    return NextResponse.json(
      { error: "login_challenge query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const { data } = await hydraAdmin.getOAuth2LoginRequest({
      loginChallenge,
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[hydra/login] GET error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to fetch login request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/hydra/login
 *
 * Accepts the Hydra login request with the given subject (Kratos identity id).
 *
 * Body: { login_challenge: string; subject: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { login_challenge, subject } = body as {
      login_challenge?: string;
      subject?: string;
    };

    if (!login_challenge) {
      return NextResponse.json(
        { error: "login_challenge is required" },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { error: "subject is required" },
        { status: 400 }
      );
    }

    const { data } = await hydraAdmin.acceptOAuth2LoginRequest({
      loginChallenge: login_challenge,
      acceptOAuth2LoginRequest: {
        subject,
        remember: true,
        remember_for: 3600,
      },
    });

    return NextResponse.json({ redirect_to: data.redirect_to });
  } catch (err: unknown) {
    console.error("[hydra/login] POST error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to accept login request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
