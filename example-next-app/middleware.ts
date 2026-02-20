import { NextResponse } from "next/server";

/**
 * Next.js Middleware for Security Headers
 * 
 * Adds essential security headers to all responses to protect against
 * common web vulnerabilities like XSS, clickjacking, and MIME sniffing.
 */
export function middleware() {
  // Clone the response to add headers
  const response = NextResponse.next();

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  // Content Security Policy (CSP)
  // Restricts sources for scripts, styles, and other resources
  const connectSrcUrls = isDevelopment 
    ? "'self' http://localhost:* http://127.0.0.1:* https://auth.moorph.local"
    : "'self' https://auth.moorph.local";

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/eval needed for Next.js
    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for styled-components/CSS-in-JS
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrcUrls}`, // Allow API calls to auth domain
    "frame-ancestors 'self' https://auth.moorph.local", // Allow OAuth iframes from same domain
    "base-uri 'self'",
    "form-action 'self'",
    isDevelopment ? "" : "upgrade-insecure-requests", // Upgrade HTTP to HTTPS in production
  ].filter(Boolean).join("; ");
  
  response.headers.set("Content-Security-Policy", cspDirectives);

  // X-Frame-Options: Changed to SAMEORIGIN to allow OAuth iframes
  // (was DENY which could break OAuth flows)
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // X-Content-Type-Options: Prevents MIME-sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Strict-Transport-Security (HSTS): Forces HTTPS (only in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // X-XSS-Protection: Legacy XSS protection (for older browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy: Controls referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy: Controls browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return response;
}

// Apply middleware to all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
