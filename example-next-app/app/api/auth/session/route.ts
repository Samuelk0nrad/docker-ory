import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify } from "jose";

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

    // Get Hydra's JWKS endpoint for JWT signature verification
    // TODO: move hydraPublicUrl to ory/hydra/ folder
    const hydraPublicUrl =
      process.env.NEXT_PUBLIC_HYDRA_PUBLIC_URL ?? 
      process.env.HYDRA_PUBLIC_BASE_URL ?? 
      "http://localhost:5444";
    const jwksUri = `${hydraPublicUrl}/.well-known/jwks.json`;
    
    // Create JWKS client for signature verification
    const JWKS = createRemoteJWKSet(new URL(jwksUri));
    
    // Verify JWT signature and decode claims
    let idTokenClaims;
    try {
      const { payload } = await jwtVerify(idToken, JWKS, {
        issuer: hydraPublicUrl, // Verify issuer matches Hydra
        // jwtVerify automatically validates exp claim and throws if expired
      });
      idTokenClaims = payload;
      
      // Additional explicit expiry check for clarity and logging
      if (idTokenClaims.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime >= idTokenClaims.exp) {
          console.warn("[auth/session] Token expired:", {
            exp: idTokenClaims.exp,
            now: currentTime,
          });
          throw new Error("Token expired");
        }
      }
    } catch (verifyError) {
      console.error("[auth/session] JWT verification failed:", verifyError);
      
      // Clear expired/invalid tokens
      cookieStore.set("oauth_id_token", "", { path: "/", maxAge: 0 });
      cookieStore.set("oauth_access_token", "", { path: "/", maxAge: 0 });
      cookieStore.set("oauth_token_meta", "", { path: "/", maxAge: 0 });
      
      const errorMessage = verifyError instanceof Error ? verifyError.message : "Invalid token";
      const isExpired = errorMessage.includes("expired") || errorMessage.includes("exp");
      
      return NextResponse.json(
        { 
          user: null, 
          error: isExpired ? "Token expired" : "Invalid token",
          expired: isExpired,
        }, 
        { status: 401 }
      );
    }

    const meta = tokenMeta ? JSON.parse(tokenMeta) : null;

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
