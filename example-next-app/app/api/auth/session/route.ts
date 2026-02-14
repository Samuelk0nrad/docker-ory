import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * OAuth Session Info API Route
 *
 * Returns decoded claims from the OAuth access token and ID token
 * stored in httpOnly cookies. Does NOT expose the raw tokens to the client.
 *
 * GET /api/auth/session
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("oauth_access_token")?.value;
    const idToken = cookieStore.get("oauth_id_token")?.value;
    const tokenMeta = cookieStore.get("oauth_token_meta")?.value;

    if (!accessToken && !idToken) {
      console.log("[auth/session] No OAuth tokens found in cookies", {
        accessToken: accessToken,
        idToken: idToken,
        tokenMeta: tokenMeta,
      });
      return NextResponse.json(
        { isAuthenticated: false, error: "No OAuth tokens found" },
        { status: 401 }
      );
    }

    // Decode JWT tokens (without verification for BFF pattern)
    // In production, you might want to verify against Hydra's JWKS
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

    const accessTokenClaims = accessToken ? decodeJWT(accessToken) : null;
    const idTokenClaims = idToken ? decodeJWT(idToken) : null;
    const meta = tokenMeta ? JSON.parse(tokenMeta) : null;

    // Check if token is expired
    const isExpired = meta?.expires_at
      ? Date.now() >= meta.expires_at
      : false;

    return NextResponse.json({
      isAuthenticated: !isExpired,
      isOAuthSession: true,
      accessTokenClaims,
      idTokenClaims,
      metadata: meta,
      needsRefresh: isExpired,
    });
  } catch (error) {
    console.error("[auth/session] Error:", error);
    return NextResponse.json(
      {
        isAuthenticated: false,
        error: error instanceof Error ? error.message : "Failed to read session",
      },
      { status: 500 }
    );
  }
}
