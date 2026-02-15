import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * OAuth Login Initiation API Route
 *
 * Builds the OAuth authorization URL and sets state cookie for CSRF protection.
 * Returns the authorization URL for the client to redirect to.
 *
 * GET /api/auth/login?returnTo=/some/path
 */
export async function GET(req: NextRequest) {
  try {
    const base64UrlEncode = (input: Uint8Array) =>
      Buffer.from(input)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
    const createCodeVerifier = () => {
      const random = crypto.getRandomValues(new Uint8Array(32));
      return base64UrlEncode(random);
    };
    const createCodeChallenge = async (verifier: string) => {
      const data = new TextEncoder().encode(verifier);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return base64UrlEncode(new Uint8Array(digest));
    };
    const returnTo = req.nextUrl.searchParams.get("returnTo");

    // Get OAuth configuration from environment
    const hydraPublicUrl =
      process.env.NEXT_PUBLIC_HYDRA_PUBLIC_URL ?? 
      process.env.HYDRA_PUBLIC_BASE_URL ?? 
      "http://localhost:5444";
    const appUrl = 
      process.env.NEXT_PUBLIC_APP_URL ?? 
      process.env.NEXT_PUBLIC_APP_DOMAIN ?? 
      "http://localhost:3000";
    const redirectUri = `${appUrl}/auth/callback`;
    const clientId = 
      process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? 
      process.env.OAUTH_CLIENT_ID ?? 
      "frontend-app";

    // Build OAuth authorization URL
    const authUrl = new URL(`${hydraPublicUrl}/oauth2/auth`);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid profile email offline");
    authUrl.searchParams.set("redirect_uri", redirectUri);

    // Generate PKCE code verifier/challenge (S256)
    const codeVerifier = createCodeVerifier();
    const codeChallenge = await createCodeChallenge(codeVerifier);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    // Generate strong random state for CSRF protection (>= 8 chars)
    const state = crypto.randomUUID(); // 36 chars
    authUrl.searchParams.set("state", state);

    // Set state cookie for callback validation (short-lived, 10 min)
    const cookieStore = await cookies();
    cookieStore.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 600, // 10 minutes
    });

    // Store PKCE verifier for token exchange (short-lived, 10 min)
    cookieStore.set("oauth_pkce_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 600, // 10 minutes
    });

    // Store returnTo in cookie for post-login redirect
    if (returnTo) {
      cookieStore.set("oauth_return_to", returnTo, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/",
        maxAge: 600, // 10 minutes
      });
    }

    return NextResponse.json({
      authorizationUrl: authUrl.toString(),
    });
  } catch (error) {
    console.error("[auth/login] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to initiate login",
      },
      { status: 500 }
    );
  }
}
