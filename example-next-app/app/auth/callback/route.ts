import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * OAuth2 Callback Route Handler
 *
 * Receives the authorization code from Hydra after successful login/consent,
 * exchanges it for tokens, and stores them in httpOnly cookies using the BFF pattern.
 *
 * GET /auth/callback?code=...&state=...
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");
  const errorDescription = req.nextUrl.searchParams.get("error_description");

  // Validate state against cookie
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("oauth_state")?.value;
  const returnTo = cookieStore.get("oauth_return_to")?.value;
  const codeVerifier = cookieStore.get("oauth_pkce_verifier")?.value;
  
  if (!state || !expectedState || state !== expectedState) {
    console.warn("[oauth callback] Invalid state parameter:", { state, expectedState });
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=invalid_state&error_description=${encodeURIComponent(
          "Invalid or missing OAuth state"
        )}`,
        req.url
      )
    );
  }

  // Clear state cookie after validation
  cookieStore.set("oauth_state", "", { path: "/", maxAge: 0 });
  cookieStore.set("oauth_pkce_verifier", "", { path: "/", maxAge: 0 });


  // Handle OAuth errors
  if (error) {
    console.error("[oauth callback] OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription ?? "")}`,
        req.url
      )
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  if (!codeVerifier) {
    return NextResponse.json(
      { error: "Missing PKCE verifier" },
      { status: 400 }
    );
  }

  try {
    // Get client credentials and Hydra URL from env
    const clientId = process.env.OAUTH_CLIENT_ID ?? "frontend-app";
    const clientSecret = process.env.OAUTH_CLIENT_SECRET ?? "dev-secret";
    const hydraPublicUrl =
      process.env.HYDRA_PUBLIC_BASE_URL ?? "http://localhost:5444";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const redirectUri = `${appUrl}/auth/callback`;

    // Exchange authorization code for tokens
    const tokenEndpoint = `${hydraPublicUrl}/oauth2/token`;
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
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
      console.error("[oauth callback] Token exchange failed:", errorBody);
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokens = await tokenResponse.json();
    const {
      access_token,
      id_token,
      refresh_token,
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

    // Set tokens in httpOnly cookies
    const cookieStore = await cookies();
    
    if (access_token) {
      cookieStore.set("oauth_access_token", access_token, cookieOptions);
    }

    if (id_token) {
      cookieStore.set("oauth_id_token", id_token, cookieOptions);
    }

    if (refresh_token) {
      // Refresh token has longer expiry
      cookieStore.set("oauth_refresh_token", refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    // Store token metadata (non-sensitive) for client-side checks
    cookieStore.set(
      "oauth_token_meta",
      JSON.stringify({
        token_type,
        scope,
        expires_at: Date.now() + (expires_in ?? 3600) * 1000,
      }),
      {
        httpOnly: false, // Allow client to read expiry for refresh logic
        secure: isProduction,
        sameSite: "strict" as const,
        path: "/",
        maxAge: expires_in ?? 3600,
      }
    );

    // Redirect to home or stored return_to
    const redirect = returnTo || appUrl;
    console.log("[oauth callback] Login successful, redirecting to:", redirect);
    return NextResponse.redirect(new URL(redirect, req.url));
  } catch (error) {
    console.error("[oauth callback] Error:", error);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=callback_failed&error_description=${encodeURIComponent(
          error instanceof Error ? error.message : "Token exchange failed"
        )}`,
        req.url
      )
    );
  }
}
