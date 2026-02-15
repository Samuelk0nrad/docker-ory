import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * OAuth Token Refresh API Route
 *
 * Uses the refresh token to obtain new access and ID tokens.
 * Updates tokens in httpOnly cookies.
 *
 * POST /api/auth/refresh
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("oauth_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token available" },
        { status: 401 }
      );
    }

    // Get client credentials and Hydra URL from env
    const clientId = process.env.OAUTH_CLIENT_ID ?? "frontend-app";
    const clientSecret = process.env.OAUTH_CLIENT_SECRET ?? "dev-secret";
    const hydraPublicUrl =
      process.env.HYDRA_PUBLIC_BASE_URL ?? "http://localhost:5444";

    // Exchange refresh token for new tokens
    const tokenEndpoint = `${hydraPublicUrl}/oauth2/token`;
    const tokenParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    // Use Basic Auth for client authentication
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );

    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error("[auth/refresh] Token refresh failed:", errorBody);
      
      // Clear all OAuth cookies on refresh failure
      cookieStore.set("oauth_access_token", "", { path: "/", maxAge: 0 });
      cookieStore.set("oauth_id_token", "", { path: "/", maxAge: 0 });
      cookieStore.set("oauth_refresh_token", "", { path: "/", maxAge: 0 });
      cookieStore.set("oauth_token_meta", "", { path: "/", maxAge: 0 });
      
      return NextResponse.json(
        { error: "Token refresh failed" },
        { status: 401 }
      );
    }

    const tokens = await tokenResponse.json();
    const {
      access_token,
      id_token,
      refresh_token: new_refresh_token,
      expires_in,
      token_type,
      scope,
    } = tokens;

    // Prepare cookie options (httpOnly, secure in production, SameSite=Strict)
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict" as const,
      path: "/",
      maxAge: expires_in ?? 3600, // Default to 1 hour if not provided
    };

    // Update tokens in httpOnly cookies
    if (access_token) {
      cookieStore.set("oauth_access_token", access_token, cookieOptions);
    }

    if (id_token) {
      cookieStore.set("oauth_id_token", id_token, cookieOptions);
    }

    // Update refresh token if a new one was issued
    if (new_refresh_token) {
      cookieStore.set("oauth_refresh_token", new_refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    // Update token metadata
    const expiresAt = Date.now() + (expires_in ?? 3600) * 1000;
    cookieStore.set(
      "oauth_token_meta",
      JSON.stringify({
        token_type,
        scope,
        expires_at: expiresAt,
      }),
      {
        httpOnly: false, // Allow client to read expiry for refresh logic
        secure: isProduction,
        sameSite: "strict" as const,
        path: "/",
        maxAge: expires_in ?? 3600,
      }
    );

    return NextResponse.json({
      expiresAt,
    });
  } catch (error) {
    console.error("[auth/refresh] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Token refresh failed",
      },
      { status: 500 }
    );
  }
}
