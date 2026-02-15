import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * OAuth Logout API Route
 *
 * Clears all OAuth tokens from httpOnly cookies.
 * Optionally can call the OAuth provider's logout endpoint server-side.
 *
 * POST /api/auth/logout
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear all OAuth-related cookies
    const oauthCookies = [
      "oauth_access_token",
      "oauth_id_token",
      "oauth_refresh_token",
      "oauth_token_meta",
      "oauth_state",
      "oauth_return_to",
    ];

    for (const cookieName of oauthCookies) {
      cookieStore.set(cookieName, "", {
        path: "/",
        maxAge: 0,
      });
    }

    // Optional: Call Hydra's revocation endpoint to invalidate tokens
    // This is a best practice for security but not required for client-side logout
    const accessToken = cookieStore.get("oauth_access_token")?.value;
    if (accessToken) {
      try {
        const hydraPublicUrl =
          process.env.HYDRA_PUBLIC_BASE_URL ?? "http://localhost:5444";
        const clientId = process.env.OAUTH_CLIENT_ID ?? "frontend-app";
        const clientSecret = process.env.OAUTH_CLIENT_SECRET ?? "dev-secret";

        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
          "base64"
        );

        await fetch(`${hydraPublicUrl}/oauth2/revoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${basicAuth}`,
          },
          body: new URLSearchParams({
            token: accessToken,
          }).toString(),
        });
      } catch (err) {
        // Ignore revocation errors - cookies are already cleared
        console.warn("[auth/logout] Token revocation failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[auth/logout] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Logout failed",
      },
      { status: 500 }
    );
  }
}
