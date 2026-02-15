import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * OAuth Session Info API Route
 *
 * Returns user information and session metadata from OAuth tokens.
 * Does NOT expose raw tokens to the client (httpOnly cookies).
 *
 * GET /api/auth/session
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const idToken = cookieStore.get("oauth_id_token")?.value;
    const tokenMeta = cookieStore.get("oauth_token_meta")?.value;
    const refreshToken = cookieStore.get("oauth_refresh_token")?.value;

    if (!idToken) {
      return NextResponse.json({ user: null });
    }

    // Decode JWT ID token to extract user claims
    const decodeJWT = (token: string) => {
      try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        const decoded = Buffer.from(payload, "base64").toString("utf-8");
        return JSON.parse(decoded);
      } catch (err) {
        console.error("Failed to decode JWT:", err);
        return null;
      }
    };

    const idTokenClaims = decodeJWT(idToken);
    const meta = tokenMeta ? JSON.parse(tokenMeta) : null;

    if (!idTokenClaims) {
      return NextResponse.json({ user: null });
    }

    // Extract user information from ID token claims
    const user = {
      id: idTokenClaims.sub || "",
      email: idTokenClaims.email || "",
      name: idTokenClaims.name || idTokenClaims.preferred_username || undefined,
    };

    // Calculate expiration time
    const expiresAt = meta?.expires_at || (idTokenClaims.exp ? idTokenClaims.exp * 1000 : null);

    return NextResponse.json({
      user,
      expiresAt,
      hasRefreshToken: !!refreshToken,
    });
  } catch (error) {
    console.error("[auth/session] Error:", error);
    return NextResponse.json(
      {
        user: null,
        error: error instanceof Error ? error.message : "Failed to read session",
      },
      { status: 500 }
    );
  }
}
